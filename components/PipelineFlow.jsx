"use client";

import Reveal, { Stagger, item } from "./Reveal";
import { motion } from "framer-motion";

const STAGES = [
  { n: "01", name: "Load + preprocess", detail: "Any .h5ad or 10x Xenium folder. Counts detected, normalized, log1p — spatial coordinates verified.", mono: "load_h5ad(input)" },
  { n: "02", name: "BANKSY clustering", detail: "Each spot is embedded with its neighborhood — clusters follow tissue architecture, not just expression.", mono: "λ=0.2 · k=15 · Leiden" },
  { n: "03", name: "Cell-state annotation", detail: "Controlled-vocabulary marker agent — Claude in the cloud, or Qwen3 running fully local.", mono: "Neftel GBM states" },
  { n: "04", name: "Vitessce portal", detail: "Chunk-optimized zarr + an interactive portal: spatial view, UMAP, heatmap, marker search.", mono: "portal.html + data.zarr" },
  { n: "05", name: "Live analysis + copilot", detail: "On-demand differential expression, composition, Moran's I — and a grounded chat on your data.", mono: "DE · Moran's I · chat" },
];

export default function PipelineFlow() {
  return (
    <section id="pipeline" className="relative px-6 md:px-14 py-28 md:py-40 max-w-7xl mx-auto">
      <Reveal>
        <p className="font-mono text-sm text-violet mb-4">01 · THE PIPELINE</p>
        <h2 className="text-4xl md:text-6xl font-semibold tracking-tight max-w-3xl">
          One command, <span className="text-gradient">five stages</span>, zero notebooks.
        </h2>
      </Reveal>
      <Stagger className="mt-16 grid gap-4">
        {STAGES.map((s, i) => (
          <motion.div
            key={s.n}
            variants={item}
            className="group relative grid md:grid-cols-[90px_260px_1fr_auto] items-baseline gap-3 md:gap-8 rounded-2xl border border-line bg-panel/60 px-6 py-6 md:py-7 hover:border-violet/50 hover:bg-panel transition-all"
          >
            <span className="font-mono text-sm text-violet/70">{s.n}</span>
            <h3 className="text-lg font-medium">{s.name}</h3>
            <p className="text-dim leading-relaxed text-[15px]">{s.detail}</p>
            <span className="font-mono text-xs text-dim/70 group-hover:text-violet transition-colors">{s.mono}</span>
            {i < STAGES.length - 1 && (
              <span className="absolute left-[33px] -bottom-4 h-4 w-px bg-line hidden md:block" aria-hidden />
            )}
          </motion.div>
        ))}
      </Stagger>
    </section>
  );
}
