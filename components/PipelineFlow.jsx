"use client";

import Reveal, { Stagger, item } from "./Reveal";
import { motion } from "framer-motion";
import DataMorph from "./DataMorph";

const STAGES = [
  { name: "Load + preprocess", detail: "Any .h5ad or 10x Xenium folder. Counts detected, normalized, log1p — spatial coordinates verified.", mono: "load_h5ad(input)" },
  { name: "BANKSY clustering", detail: "Each spot is embedded with its neighborhood — clusters follow tissue architecture, not just expression.", mono: "λ=0.2 · k=15 · Leiden" },
  { name: "Cell-state annotation", detail: "Controlled-vocabulary marker agent — a frontier model in the cloud, or a local model through Ollama.", mono: "AC·MES·NPC·OPC-like vocab" },
  { name: "Vitessce portal", detail: "Chunk-optimized zarr + an interactive portal: spatial view, UMAP, heatmap, marker search.", mono: "portal.html + data.zarr" },
  { name: "Live analysis + copilot", detail: "On-demand differential expression, composition, Moran's I — and a grounded chat on your data.", mono: "DE · Moran's I · chat" },
];

export default function PipelineFlow() {
  return (
    <section id="pipeline" className="relative px-6 md:px-14 py-24 md:py-36 max-w-7xl mx-auto">
      <Reveal>
        <p className="font-mono text-sm text-violet mb-4">01 · PIPELINE</p>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl">
          One command, <span className="text-violet">five stages</span>, zero notebooks.
        </h2>
      </Reveal>
      <Reveal delay={0.05} className="mt-8">
        <DataMorph height={400} />
        <p className="text-center text-[13px] text-dim mt-1">
          Raw reads in, atlas out — the glyph stream is animation; the section it becomes is the real GBM1 data.
        </p>
      </Reveal>

      <Stagger className="mt-12 relative">
        <span className="absolute left-[7px] top-3 bottom-3 w-px bg-line hidden md:block" aria-hidden />
        {STAGES.map((s, i) => (
          <motion.div
            key={s.name}
            variants={item}
            className="group relative md:pl-12 py-5 md:py-6 border-b border-line/60 last:border-b-0 grid md:grid-cols-[250px_1fr_auto] items-baseline gap-2 md:gap-8"
          >
            <span
              className="absolute left-0 top-[1.85rem] h-[15px] w-[15px] rounded-full border-2 border-violet bg-ink hidden md:block group-hover:bg-violet transition-colors"
              aria-hidden
            />
            <h3 className="text-lg font-medium">
              <span className="font-mono text-[13px] text-violet mr-3 md:hidden">{i + 1}</span>
              {s.name}
            </h3>
            <p className="text-dim leading-relaxed text-[15px]">{s.detail}</p>
            <span className="font-mono text-[13px] text-dim group-hover:text-violet transition-colors rounded-md border border-line px-2.5 py-1 justify-self-start md:justify-self-end">
              {s.mono}
            </span>
          </motion.div>
        ))}
      </Stagger>
    </section>
  );
}
