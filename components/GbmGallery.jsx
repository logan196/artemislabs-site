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
        <h2 className="text-4xl md:text-6xl font-semibold tracking-tight max-w-3xl">
          Five sections, one afternoon.
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-dim leading-relaxed">
          Five public glioma Visium sections — four adult high-grade gliomas from the
          Ren&nbsp;et&nbsp;al. 2023 cohort (GSE194329; two IDH-wildtype GBM, two IDH-mutant
          secondary), one glioblastoma from 10x Genomics — dropped into the pipeline
          unmodified. BANKSY domains, putative cell states, and marker maps, each with
          its own interactive Vitessce portal.
        </p>
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
            <div className="flex gap-2 flex-wrap">
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setView(v.id)}
                  className={`rounded-full px-4 py-1.5 text-sm font-mono transition-all ${
                    view === v.id ? "bg-violet-deep text-snow" : "text-dim hover:text-snow border border-line"
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
          <p className="mt-4 font-mono text-xs text-dim/70">
            High-res H&E with BANKSY domains and cell states called by a local Qwen3-8B agent (the same pipeline runs on Claude when egress is fine) — click any view for full resolution. Public data: GSE194329 (Ren et al., Nat Commun 2023), 10x Genomics Parent Visium.
          </p>
        </div>
      </div>

      <Reveal delay={0.1} className="mt-14">
        <div className="rounded-3xl border border-line overflow-hidden glow-ring bg-ink">
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
        <p className="mt-3 text-center font-mono text-xs text-dim/60">
          the live portal — three tumors and a local-LLM question, recorded headless in one take
        </p>
      </Reveal>
    </section>
  );
}
