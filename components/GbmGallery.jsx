"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Reveal, { Stagger, item } from "./Reveal";

const SAMPLES = [
  { id: "GBM1", title: "GBM1 · Ren et al. 2023", source: "GSE194329 · Visium · IDH-mut, secondary" },
  { id: "GBM2", title: "GBM2 · Ren et al. 2023", source: "GSE194329 · Visium · IDH-wt, recurrent" },
  { id: "GBM3", title: "GBM3 · Ren et al. 2023", source: "GSE194329 · Visium · IDH-wt, primary" },
  { id: "GBM4", title: "GBM4 · Ren et al. 2023", source: "GSE194329 · Visium · IDH-mut, secondary" },
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
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAnnotated(true);
      return;
    }
    const t0 = setTimeout(() => setAnnotated(true), 2000);
    const iv = setInterval(() => setAnnotated((a) => !a), 4600);
    return () => { clearTimeout(t0); clearInterval(iv); };
  }, []);
  return (
    <figure className="mt-12 rounded-[4px] overflow-hidden border border-snow/60 shadow-[0_18px_50px_-22px_rgba(28,26,21,0.4)] bg-panel">
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
        <span className="font-semibold text-snow">Fig. 1&nbsp;|</span>{" "}
        {annotated
          ? "The same section, annotated — cell2location states from de Jong et al., Nature 2026."
          : "AT15 · H&E histology, as the slide arrives. Public data: gbmspace.org."}
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
          Five public glioma Visium sections — four adult high-grade gliomas from the
          Ren&nbsp;et&nbsp;al. 2023 cohort (GSE194329; two IDH-wildtype GBM, two IDH-mutant
          secondary), one glioblastoma from 10x Genomics — dropped into the pipeline
          unmodified. BANKSY domains, putative cell states, and marker maps, each with
          its own interactive Vitessce portal.
        </p>
        <LivingFigure />
      </Reveal>

      <div className="mt-14 flex flex-col gap-6">
        <Stagger className="flex gap-3 overflow-x-auto pb-2">
          {SAMPLES.map((s) => (
            <motion.button
              key={s.id}
              variants={item}
              onClick={() => setActive(s.id)}
              className={`text-left shrink-0 rounded-2xl border px-5 py-4 transition-all ${
                active === s.id
                  ? "border-violet bg-violet/10 glow-ring"
                  : "border-line bg-panel/60 hover:border-violet/40"
              }`}
            >
              <p className="font-medium">{s.title}</p>
              <p className="font-mono text-xs text-dim mt-1">{s.source}</p>
              {meta[s.id] && (
                <p className="font-mono text-xs text-violet/80 mt-2">
                  {meta[s.id].n_spots.toLocaleString()} spots · {meta[s.id].n_clusters} domains
                </p>
              )}
            </motion.button>
          ))}
        </Stagger>

        <div className="rounded-3xl border border-line bg-panel/60 p-5 md:p-8">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
            <a
              href="live/GBM3/portal.html"
              target="_blank"
              rel="noreferrer"
              className="order-last w-full sm:w-auto sm:order-none rounded-[3px] border border-snow/50 px-5 py-2 text-[15px] text-dim hover:text-snow hover:border-violet transition-all text-center"
            >
              GBM3 portal, live →
            </a>
            <a
              href="live/brain/index.html"
              target="_blank"
              rel="noreferrer"
              className="order-last w-full sm:w-auto sm:order-none rounded-[3px] bg-violet-deep text-ink px-5 py-2 text-[15px] font-medium hover:bg-violet transition-colors text-center"
            >
              Artemis Brain — 3.9M-cell MERFISH atlas, live →
            </a>
            <div className="flex gap-2 flex-wrap">
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setView(v.id)}
                  className={`rounded-full px-4 py-1.5 text-sm font-mono transition-all ${
                    view === v.id ? "bg-violet-deep text-ink" : "text-dim hover:text-snow border border-line"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
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
          <a
            href={`gbm/${active}_${view}.jpg`}
            target="_blank"
            rel="noreferrer"
            title="Open full resolution"
            className="block overflow-hidden rounded-2xl bg-ink cursor-zoom-in"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={`${active}-${view}`}
                src={`gbm/${active}_${view}.jpg`}
                alt={`${active} — ${view} on the H&E section`}
                className="w-full max-h-[84vh] object-contain"
                initial={{ opacity: 0, scale: 1.015 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
              />
            </AnimatePresence>
          </a>
          <p className="mt-4 text-[13.5px] text-dim leading-relaxed">
            <span className="font-semibold text-snow">Fig. 2&nbsp;|</span> High-resolution H&E with BANKSY domains and cell states called by a local Qwen3-8B agent (the same pipeline runs on a frontier cloud model when egress is fine) — click any view for full resolution. Public data: GSE194329 (Ren et al., <i>Nat Commun</i> 2023); 10x Genomics Parent Visium. Cell-state labels are model-annotated and not independently validated.
          </p>
        </div>
      </div>

      <Reveal delay={0.1} className="mt-14">
        <div className="rounded-lg border border-snow/60 overflow-hidden bg-[#0e0a1a]">
          <video
            src="demo/artemis_gbm_demo.mp4"
            poster="demo/poster.png"
            autoPlay
            muted
            loop
            playsInline
            controls
            className="w-full"
          />
        </div>
        <p className="mt-3 text-[13.5px] text-dim text-center leading-relaxed">
          <span className="font-semibold text-snow">Fig. 3&nbsp;|</span> The live portal — three tumors and a local-LLM question, recorded headless in one take.
        </p>
      </Reveal>
    </section>
  );
}
