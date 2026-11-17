"use client";

// Live OpenSeadragon viewer of published BioImage Archive composites.
// Channel toggles operate on the RGB planes of those composites — not raw
// OME-zarr channel unmixing, which is not on this page.
import { useEffect, useRef, useState } from "react";
import FigureLightbox from "./FigureLightbox";

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
  if (channels.r && channels.g && channels.b) return img.src;
  const c = document.createElement("canvas");
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0);
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
        try { viewer.destroy(); } catch { /* already gone */ }
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
        await new Promise((res, rej) => {
          img.onload = res;
          img.onerror = rej;
          img.src = study.src;
        });
        imgCache.current[study.src] = img;
      }
      if (cancelled) return;
      viewer.open({ type: "image", url: filterUrl(img, channels) });
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

  const zoom = (factor) => {
    const v = viewerRef.current;
    if (!v?.viewport) return;
    v.viewport.zoomBy(factor);
    v.viewport.applyConstraints();
  };

  return (
    <div id="bioimage-viewer" className="mt-16">
      <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-violet">
        PUBLIC MULTIPLEXED TISSUE · BIOIMAGE ARCHIVE · LIVE VIEWER
      </p>
      <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-[#f4f1ea]">
        Zoom and pan the published composites. Channel toggles show or hide
        the RGB planes of that composite — not raw OME-zarr channels.
      </p>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-dim">Dataset</p>
          <div className="mt-2 inline-flex flex-wrap rounded-[4px] border border-white/15 p-1 gap-1" role="tablist" aria-label="BioImage Archive dataset">
            {STUDIES.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={studyId === s.id}
                onClick={() => { setStudyId(s.id); setChannels({ r: true, g: true, b: true }); }}
                className={`font-mono text-[12px] px-3 py-1.5 rounded-[3px] transition-colors ${
                  studyId === s.id ? "bg-[#f4f1ea] text-ink" : "text-[#f4f1ea]/80 hover:bg-white/10"
                }`}
              >
                S-BIAD{s.id}
              </button>
            ))}
          </div>
        </div>
        <p className="font-mono text-[12px] text-[#f4f1ea]/80">{study.title}</p>
      </div>

      <div className="mt-4 rounded-[6px] border border-white/12 overflow-hidden bg-[#050607]">
        <div className="flex flex-wrap items-center gap-2 px-3 py-3 border-b border-white/10">
          <span className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-dim mr-1">Channels</span>
          {study.channels.map((ch) => {
            const on = channels[ch.key];
            return (
              <button
                key={ch.key}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(ch.key)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[12px] transition-colors ${
                  on ? "border-white/30 text-[#f4f1ea] bg-white/10" : "border-white/10 text-white/40"
                }`}
              >
                <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: on ? ch.color : "#3a3a3a" }} aria-hidden />
                {ch.label}
              </button>
            );
          })}
        </div>

        <div className="relative">
          <div ref={hostRef} className="w-full h-[420px] md:h-[520px] bg-black" />
          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            <button type="button" onClick={() => zoom(1 / 1.35)} className="h-9 w-9 rounded-[4px] border border-white/25 bg-black/70 text-[#f4f1ea] text-lg leading-none" aria-label="Zoom out">−</button>
            <button type="button" onClick={() => zoom(1.35)} className="h-9 w-9 rounded-[4px] border border-white/25 bg-black/70 text-[#f4f1ea] text-lg leading-none" aria-label="Zoom in">+</button>
          </div>
          <p className="pointer-events-none absolute left-3 bottom-3 font-mono text-[11px] tracking-[0.08em] text-[#f4f1ea] bg-black/55 px-2 py-1 rounded-[3px]">
            scroll to zoom · drag to pan
          </p>
        </div>
        {err && <p className="px-4 py-2 font-mono text-[12px] text-[#ffb4b4]">{err}</p>}
        <div className="px-4 py-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[13.5px] text-[#f4f1ea]">{study.title}</p>
          <a href={study.href} target="_blank" rel="noreferrer" className="font-mono text-[12px] text-[#c9fff4] hover:text-white">
            {study.credit} ↗
          </a>
        </div>
      </div>

      <div className="mt-8 grid md:grid-cols-3 gap-6">
        {ANNOTATED.map((fig) => (
          <figure key={fig.src} className="flex flex-col">
            <FigureLightbox src={fig.src} alt={fig.alt} caption={fig.caption}>
              <img src={fig.src} alt={fig.alt} className="w-full h-auto rounded-[4px] border border-white/10 bg-black" />
            </FigureLightbox>
            <figcaption className="mt-3 text-[13px] leading-relaxed text-[#d9d4c8]">{fig.caption}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
