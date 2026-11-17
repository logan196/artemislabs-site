"use client";

// Live OpenSeadragon viewer of published BioImage Archive composites.
// Channel toggles operate on the RGB planes of those composites — not raw
// OME-zarr channel unmixing, which is not on this page.
import { useEffect, useRef, useState } from "react";

const STUDIES = [
  {
    id: "605",
    src: "tissue/sbiad605_ccrcc_mif.jpg",
    title: "ccRCC · Hoechst / MCM2 / CD3 / CD8",
    credit: "BioImage Archive S-BIAD605 · Wölflein et al. · CC0",
    href: "https://www.ebi.ac.uk/biostudies/bioimages/studies/S-BIAD605",
    channels: [
      { key: "b", label: "Blue · Hoechst", color: "#508cff" },
      { key: "g", label: "Green · MCM2", color: "#50dc82" },
      { key: "r", label: "Red · CD3/CD8", color: "#e64646" },
    ],
  },
  {
    id: "1237",
    src: "tissue/sbiad1237_luad_mif.jpg",
    title: "Lung adenocarcinoma · multiplex IF",
    credit: "BioImage Archive S-BIAD1237 · Um et al. · CC BY 4.0",
    href: "https://www.ebi.ac.uk/biostudies/bioimages/studies/S-BIAD1237",
    channels: [
      { key: "r", label: "Red", color: "#e64646" },
      { key: "g", label: "Green", color: "#50dc82" },
      { key: "b", label: "Blue / magenta mix", color: "#c85ad0" },
    ],
  },
  {
    id: "1641",
    src: "tissue/sbiad1641_thalamus_mf.png",
    title: "Human thalamus · multiplexed fluorescence",
    credit: "BioImage Archive S-BIAD1641 · John et al. · CC BY 4.0",
    href: "https://www.ebi.ac.uk/biostudies/bioimages/studies/S-BIAD1641",
    channels: [
      { key: "r", label: "Red plane", color: "#e64646" },
      { key: "g", label: "Green plane", color: "#50dc82" },
      { key: "b", label: "Blue plane", color: "#508cff" },
    ],
  },
];

const ANNOTATED = [
  {
    src: "tissue/annotated/sbiad605_labeled.jpg",
    alt: "Labeled ccRCC multiplex composite with Hoechst, MCM2 and CD3/CD8 swatches",
    caption: "Fig. A  ·  S-BIAD605 labeled composite. Swatches follow the published Hoechst / MCM2 / CD3–CD8 colors.",
  },
  {
    src: "tissue/annotated/sbiad605_intensity.jpg",
    alt: "RGB intensity histograms computed on the published S-BIAD605 composite",
    caption: "Fig. B  ·  Intensity of the published RGB planes on S-BIAD605, computed on this page. Not a raw OME-zarr unmix.",
  },
  {
    src: "tissue/annotated/sbiad1237_labeled.jpg",
    alt: "Labeled lung adenocarcinoma multiplex composite from S-BIAD1237",
    caption: "Fig. C  ·  S-BIAD1237 labeled composite. Channel colors follow the published image; antigen names are not in this file.",
  },
];

function loadOSD() {
  return new Promise((resolve, reject) => {
    if (window.OpenSeadragon) return resolve(window.OpenSeadragon);
    const s = document.createElement("script");
    s.src = "vendor/openseadragon.min.js";
    s.async = true;
    s.onload = () => resolve(window.OpenSeadragon);
    s.onerror = () => reject(new Error("OpenSeadragon failed to load"));
    document.head.appendChild(s);
  });
}

function filterUrl(img, channels) {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0);
  if (channels.r && channels.g && channels.b) return img.src;
  const data = ctx.getImageData(0, 0, c.width, c.height);
  const px = data.data;
  for (let i = 0; i < px.length; i += 4) {
    if (!channels.r) px[i] = 0;
    if (!channels.g) px[i + 1] = 0;
    if (!channels.b) px[i + 2] = 0;
  }
  ctx.putImageData(data, 0, 0);
  return c.toDataURL("image/jpeg", 0.92);
}

export default function TissueViewer() {
  const hostRef = useRef(null);
  const viewerRef = useRef(null);
  const imgCache = useRef({});
  const [studyId, setStudyId] = useState(STUDIES[0].id);
  const [channels, setChannels] = useState({ r: true, g: true, b: true });
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState("");
  const study = STUDIES.find((s) => s.id === studyId) || STUDIES[0];

  useEffect(() => {
    let cancelled = false;
    let viewer;
    loadOSD()
      .then((OSD) => {
        if (cancelled || !hostRef.current) return;
        viewer = OSD({
          element: hostRef.current,
          prefixUrl: "",
          showNavigationControl: false,
          showZoomControl: false,
          showHomeControl: false,
          showFullPageControl: false,
          visibilityRatio: 1,
          minZoomImageRatio: 0.8,
          maxZoomPixelRatio: 4,
          gestureSettingsMouse: { clickToZoom: false, scrollToZoom: true, dragToPan: true },
          gestureSettingsTouch: { pinchToZoom: true, flickEnabled: true },
          background: "#050607",
        });
        viewerRef.current = viewer;
        setReady(true);
      })
      .catch((e) => setErr(e.message));
    return () => {
      cancelled = true;
      if (viewer) {
        try { viewer.destroy(); } catch {}
      }
      viewerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !ready) return;
    let cancelled = false;
    const load = async () => {
      let img = imgCache.current[study.src];
      if (!img) {
        img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise((res, rej) => {
          img.onload = res;
          img.onerror = rej;
          img.src = study.src;
        });
        imgCache.current[study.src] = img;
      }
      if (cancelled) return;
      const url = filterUrl(img, channels);
      viewer.open({ type: "image", url });
    };
    load().catch((e) => setErr(e.message || "image failed"));
    return () => { cancelled = true; };
  }, [study, channels, ready]);

  const toggle = (key) => {
    setChannels((c) => {
      const next = { ...c, [key]: !c[key] };
      if (!next.r && !next.g && !next.b) return c;
      return next;
    });
  };

  const zoom = (delta) => {
    const v = viewerRef.current;
    if (!v) return;
    v.viewport.zoomBy(delta);
    v.viewport.applyConstraints();
  };

  return (
    <div id="bioimage-viewer">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-dim tracking-wide">
            PUBLIC MULTIPLEXED TISSUE · BIOIMAGE ARCHIVE · LIVE VIEWER
          </p>
          <p className="mt-1 text-[15px] text-snow/90 max-w-2xl">
            Zoom and pan the published composites. Channel toggles show or hide
            the RGB planes of that composite — not raw OME-zarr channels.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {STUDIES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => { setStudyId(s.id); setChannels({ r: true, g: true, b: true }); }}
              className={`font-mono text-[11px] px-2.5 py-1 rounded-[3px] border transition-colors ${
                studyId === s.id
                  ? "border-[#7eefe0]/60 text-snow bg-white/5"
                  : "border-line text-dim hover:text-snow"
              }`}
            >
              S-BIAD{s.id}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-[4px] border border-line overflow-hidden bg-[#050607]">
        <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 border-b border-line">
          <div className="flex flex-wrap gap-3">
            {study.channels.map((ch) => (
              <label key={ch.key} className="inline-flex items-center gap-1.5 font-mono text-[11px] text-dim cursor-pointer">
                <input
                  type="checkbox"
                  checked={channels[ch.key]}
                  onChange={() => toggle(ch.key)}
                  className="accent-[#7eefe0]"
                />
                <span className="h-2 w-2 rounded-sm" style={{ background: ch.color }} aria-hidden />
                {ch.label}
              </label>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => zoom(1 / 1.4)} className="font-mono text-[12px] text-dim hover:text-snow border border-line rounded-[3px] w-7 h-7">−</button>
            <button type="button" onClick={() => zoom(1.4)} className="font-mono text-[12px] text-dim hover:text-snow border border-line rounded-[3px] w-7 h-7">+</button>
            <span className="font-mono text-[10.5px] text-dim hidden sm:inline">scroll to zoom · drag to pan</span>
          </div>
        </div>
        <div ref={hostRef} className="relative w-full h-[360px] md:h-[480px] bg-black" />
        {err && <p className="px-3 py-2 font-mono text-[11px] text-red-300">{err}</p>}
        <div className="px-3 py-2 border-t border-line flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-[11px] text-dim">{study.title}</p>
          <a href={study.href} target="_blank" rel="noreferrer" className="font-mono text-[11px] text-snow/80 hover:text-[#7eefe0]">
            {study.credit} ↗
          </a>
        </div>
      </div>

      <div className="mt-8 grid sm:grid-cols-3 gap-5">
        {ANNOTATED.map((fig) => (
          <figure key={fig.src} className="rounded-[4px] border border-line bg-panel p-2.5">
            <img src={fig.src} alt={fig.alt} className="w-full h-auto rounded-[2px] bg-black" />
            <figcaption className="mt-2 font-mono text-[11px] text-dim leading-relaxed">{fig.caption}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
