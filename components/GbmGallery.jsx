"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Reveal, { Stagger, item } from "./Reveal";

const SAMPLES = [
  { id: "GBM1", title: "GBM1 · Ravi et al.", source: "GSE194329 · Visium" },
  { id: "GBM2", title: "GBM2 · Ravi et al.", source: "GSE194329 · Visium" },
  { id: "GBM3", title: "GBM3 · Ravi et al.", source: "GSE194329 · Visium" },
  { id: "GBM4", title: "GBM4 · Ravi et al.", source: "GSE194329 · Visium" },
  { id: "TenX_GBM", title: "GBM · 10x Genomics", source: "Parent Visium · fresh frozen" },
];

export default function GbmGallery() {
  const [meta, setMeta] = useState({});
  const [active, setActive] = useState("GBM1");
  const [view, setView] = useState("states");

  useEffect(() => {
    fetch("gbm/meta.json").then((r) => (r.ok ? r.json() : {})).then(setMeta).catch(() => {});
  }, []);

  const m = meta[active];

  return (
    <section id="gallery" className="relative px-6 md:px-14 py-28 md:py-40 max-w-7xl mx-auto">
      <Reveal>
        <p className="font-mono text-sm text-violet mb-4">03 · GLIOBLASTOMA, LIVE</p>
        <h2 className="text-4xl md:text-6xl font-semibold tracking-tight max-w-3xl">
          Five tumors, <span className="text-gradient">one afternoon.</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-dim leading-relaxed">
          Five public glioblastoma Visium sections — four from the Ravi&nbsp;et&nbsp;al. 2022
          cohort, one from 10x Genomics — dropped into the pipeline unmodified. BANKSY
          domains, Neftel cell states, and marker maps, each with its own interactive
          Vitessce portal.
        </p>
      </Reveal>

      <div className="mt-14 grid lg:grid-cols-[320px_1fr] gap-8">
        <Stagger className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-2">
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
            <div className="flex gap-2">
              {["states", "markers"].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`rounded-full px-4 py-1.5 text-sm font-mono transition-all ${
                    view === v ? "bg-violet-deep text-snow" : "text-dim hover:text-snow border border-line"
                  }`}
                >
                  {v === "states" ? "cell states" : "EGFR · SOX2 · GFAP · CD68"}
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
          <div className="relative aspect-square md:aspect-[4/3.4] overflow-hidden rounded-2xl bg-ink">
            <AnimatePresence mode="wait">
              <motion.img
                key={`${active}-${view}`}
                src={`gbm/${active}_${view}.png`}
                alt={`${active} ${view}`}
                className="absolute inset-0 w-full h-full object-contain"
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
              />
            </AnimatePresence>
          </div>
          <p className="mt-4 font-mono text-xs text-dim/70">
            Annotated fully locally — BANKSY (λ=0.2) + Qwen3-8B controlled-vocabulary cell-state calls. Public data: GSE194329 (Ravi et al. 2022), 10x Genomics.
          </p>
        </div>
      </div>

      <Reveal delay={0.1} className="mt-14">
        <div className="rounded-3xl border border-line overflow-hidden glow-ring bg-ink">
          <video
            src="demo/artemis_gbm_demo.mp4"
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
