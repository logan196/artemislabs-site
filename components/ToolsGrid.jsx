"use client";

import Reveal, { Stagger, item } from "./Reveal";
import { motion } from "framer-motion";

const TOOLS = [
  { name: "banksy-pipeline", kind: "agent", desc: "Spatially-aware clustering — BANKSY λ=0.2, 50 PCs, Leiden over the neighborhood-augmented embedding." },
  { name: "marker-annotator", kind: "agent", desc: "Controlled-vocabulary cell-state calling. Neftel GBM states, tissue-family aware. Claude or local Qwen3." },
  { name: "vitessce-forge", kind: "tool", desc: "Any .h5ad or Xenium folder → chunk-optimized zarr + interactive Vitessce portal. One command." },
  { name: "live-analysis", kind: "api", desc: "On-demand differential expression, composition shifts, and Moran's I spatial autocorrelation." },
  { name: "research-copilot", kind: "agent", desc: "Grounded chat on your dataset — viewport-aware, citation-ready, 100% local on qwen3:8b." },
  { name: "paper-scout", kind: "agent", desc: "PubMed retrieval tuned to your clusters and markers — literature that actually matches the biology." },
  { name: "abstract-artist", kind: "agent", desc: "One-command graphical abstracts straight from pipeline results." },
  { name: "lead-engine", kind: "agent", desc: "Research-signal mining → verified contact → grounded outreach drafts. How we found you, probably." },
];

export default function ToolsGrid() {
  return (
    <section className="relative px-6 md:px-14 py-28 md:py-40 max-w-7xl mx-auto">
      <Reveal>
        <p className="font-mono text-sm text-violet mb-4">05 · THE STACK</p>
        <h2 className="text-4xl md:text-6xl font-semibold tracking-tight max-w-3xl">
          Eight agents, <span className="text-gradient">one CLI.</span>
        </h2>
      </Reveal>

      <Stagger className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TOOLS.map((t) => (
          <motion.div
            key={t.name}
            variants={item}
            whileHover={{ y: -4 }}
            className="rounded-2xl border border-line bg-panel/60 p-5 hover:border-violet/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-sm text-violet">{t.name}</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-mint">● {t.kind}</span>
            </div>
            <p className="text-dim text-sm leading-relaxed">{t.desc}</p>
          </motion.div>
        ))}
      </Stagger>

      <Reveal delay={0.1} className="mt-12">
        <div className="rounded-3xl border border-line overflow-hidden glow-ring">
          <img src="artemis_cli.gif" alt="Artemis Labs CLI showing the spatial transcriptomics agent stack" className="w-full" />
        </div>
        <p className="mt-3 text-center font-mono text-xs text-dim/60">the stack, live from the terminal</p>
      </Reveal>
    </section>
  );
}
