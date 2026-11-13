"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Reveal, { Stagger, item } from "./Reveal";

const SAMPLES = [
  { id: "GBM1", title: "HGG1 · Ren et al. 2023", source: "GSE194329 · Visium · astrocytoma, IDH-mut, gr. 4" },
  { id: "GBM2", title: "GBM2 · Ren et al. 2023", source: "GSE194329 · Visium · GBM, IDH-wt, recurrent" },
  { id: "GBM3", title: "GBM3 · Ren et al. 2023", source: "GSE194329 · Visium · GBM, IDH-wt, primary" },
  { id: "GBM4", title: "HGG4 · Ren et al. 2023", source: "GSE194329 · Visium · astrocytoma, IDH-mut, gr. 4" },
  { id: "TenX_GBM", title: "GBM · 10x Genomics", source: "Parent Visium · fresh frozen" },
];

const VIEWS = [
  { id: "overlay", label: "cell states on H&E" },
  { id: "breakdown", label: "breakdown · EGFR · SOX2 · GFAP · CD68" },
  { id: "he", label: "H&E histology" },
];

// The living figure: our prettiest section (AT15, de Jong et al.) breathing
// between raw H&E and the paper's annotation.
function LivingFigure() {
  const [annotated, setAnnotated] = useState(false);
  const figRef = useRef(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAnnotated(true);
      return;
    }
    let t0, iv;
    const io = new IntersectionObserver((e) => {
      if (!e[0].isIntersecting) return;
      io.disconnect();
      t0 = setTimeout(() => setAnnotated(true), 1500);
      iv = setInterval(() => setAnnotated((a) => !a), 4600);
    }, { threshold: 0.35 });
    if (figRef.current) io.observe(figRef.current);
    return () => { io.disconnect(); clearTimeout(t0); clearInterval(iv); };
  }, []);
  return (
    <figure ref={figRef} className="mt-12 rounded-[4px] overflow-hidden border border-snow/60 shadow-[0_18px_50px_-22px_rgba(28,26,21,0.4)] bg-panel">
      <span className="relative block aspect-[16/8] overflow-hidden">
        <img
          src="dejong/AT15-BRA-4-FO-B2-S25_he.jpg"
          alt="Glioblastoma serial section AT15: H&E-stained tissue"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <img
          src="dejong/AT15-BRA-4-FO-B2-S25_overlay.jpg"
          alt="The same AT15 section with the paper's cell states overlaid"
          className="absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-[1800ms] ease-in-out"
          style={{ opacity: annotated ? 1 : 0 }}
        />
      </span>
      <figcaption className="border-t border-line bg-panel px-5 py-3 text-[13px] text-dim leading-relaxed">
        <span className="font-semibold text-snow">Fig. 2&nbsp;|</span>{" "}
        AT15, an atlas section breathing between the raw H&E and its
        cell2location-estimated states — de Jong et al., Nature 2026 · gbmspace.org.
      </figcaption>
    </figure>
  );
}

export default function GbmGallery() {
  const [meta, setMeta] = useState({});
  const [active, setActive] = useState("GBM1");
  const [view, setView] = useState("overlay");

  useEffect(() => {
    fetch("gbm/meta.json").then((r) => (r.ok ? r.json() : {})).then(setMeta).catch(() => {});
  }, []);

  const m = meta[active];

  return (
    <section id="gallery" className="relative px-6 md:px-14 py-28 md:py-40 max-w-7xl mx-auto">
      <Reveal>
        <p className="font-mono text-sm text-violet mb-4">03 · GLIOBLASTOMA, LIVE</p>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl">
          Five sections, one afternoon.
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-dim leading-relaxed">
          Five public glioma sections, dropped into the pipeline unmodified —{" "}
          <span className="text-snow">each one came out the other side as a live portal.</span>
        </p>
        <ul className="mt-4 max-w-2xl space-y-1.5 text-[15.5px] text-dim leading-relaxed list-none">
          <li>→ four high-grade gliomas from Ren et al. 2023 (GSE194329; two IDH-wt GBM, two IDH-mut grade-4 astrocytomas, WHO CNS5) + one 10x Genomics GBM</li>
          <li>→ BANKSY domains, putative cell states and marker maps, each with its own interactive Vitessce portal</li>
          <li>→ three gbmspace.org atlas sections through the same stack, the paper&apos;s own annotations intact — one is breathing just below</li>
        </ul>
        <LivingFigure />
      </Reveal>

      <div className="mt-14 flex flex-col gap-6">
        <Stagger className="flex gap-3 overflow-x-auto pb-2">
          {SAMPLES.map((s) => (
            <motion.a
              key={s.id}
              variants={item}
              href={`live/${s.id}/index.html`}
              target="_blank"
              rel="noreferrer"
              title="Open this section's interactive Vitessce portal"
              className="text-left shrink-0 rounded-2xl border border-line bg-panel/60 hover:border-violet/50 px-5 py-4 transition-all"
            >
              <p className="font-medium">{s.title}</p>
              <p className="font-mono text-xs text-dim mt-1">{s.source}</p>
              {meta[s.id] && (
                <p className="font-mono text-xs text-violet/80 mt-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse mr-1.5 align-middle" aria-hidden />
                  {meta[s.id].n_spots.toLocaleString()} spots · {meta[s.id].n_clusters} domains · live portal →
                </p>
              )}
            </motion.a>
          ))}
        </Stagger>

        <div className="rounded-3xl border border-line bg-panel/60 p-5 md:p-8">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
            <a
              href="live/explore/index.html"
              target="_blank"
              rel="noreferrer"
              className="order-last w-full sm:w-auto sm:order-none rounded-[3px] bg-violet-deep text-ink px-5 py-2 text-[15px] font-medium hover:bg-violet transition-colors text-center"
            >
              Artemis Explore — H&amp;E × markers × cell states, live →
            </a>
            <a
              href="live/GBM3/portal.html"
              target="_blank"
              rel="noreferrer"
              className="order-last w-full sm:w-auto sm:order-none rounded-[3px] border border-snow/50 px-5 py-2 text-[15px] text-dim hover:text-snow hover:border-violet transition-all text-center"
            >
              GBM3 portal →
            </a>
            <a
              href="live/brain/index.html"
              target="_blank"
              rel="noreferrer"
              className="order-last w-full sm:w-auto sm:order-none rounded-[3px] border border-snow/50 px-5 py-2 text-[15px] text-dim hover:text-snow hover:border-violet transition-all text-center"
            >
              3.9M-cell mouse brain atlas →
            </a>
            <a
              href="live/seqfish/portal.html"
              target="_blank"
              rel="noreferrer"
              className="order-last w-full sm:w-auto sm:order-none rounded-[3px] border border-snow/50 px-5 py-2 text-[15px] text-dim hover:text-snow hover:border-violet transition-all text-center"
            >
              seqFISH+ mouse cortex →
            </a>
            {m && (
              <div className="flex gap-2 flex-wrap">
                {m.top_states.map((t) => (
                  <span key={t.label} className="font-mono text-xs text-dim border border-line rounded-full px-3 py-1">
                    {t.label} · {t.n.toLocaleString()}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-ink border border-snow/60">
            <iframe
              src="live/explore/index.html"
              title="Artemis Explore — live glioblastoma section viewer: H&E, marker channels, cell states"
              className="w-full h-[640px] md:h-[720px] border-0"
              loading="lazy"
            />
            <span className="absolute top-3 right-3 font-mono text-[11px] text-ink bg-violet-deep/95 rounded-[3px] px-2.5 py-1 pointer-events-none">
              ● live — this is the viewer, not a screenshot
            </span>
          </div>
          <p className="mt-4 text-[13.5px] text-dim leading-relaxed">
            <span className="font-semibold text-snow">Fig. 3&nbsp;|</span> Artemis Explore, running live in this page — AT15 glioblastoma section (de Jong et al., <i>Nature</i> 2026): pan and zoom the H&E, composite eight expression-derived marker channels, toggle 66 mapped cell states, and let the agent annotate from the run itself. Split view with the s key; open full screen above. Sample cards open the Ren et al. 2023 / 10x sections at full resolution; their state labels are model-annotated and not independently validated.
          </p>
          <p className="mt-6 text-[15px] text-dim">
            All of this is one assay on one disease — the demo we lead with, not the edge of the map.
          </p>
        </div>
      </div>

    </section>
  );
}
