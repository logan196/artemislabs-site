"use client";

import Reveal, { Stagger, item } from "./Reveal";
import { motion } from "framer-motion";
import CodePanel from "./CodePanel";
import TerminalLive from "./TerminalLive";

const TOOLS = [
  { name: "banksy-pipeline", kind: "agent", desc: "Spatially-aware clustering — BANKSY λ=0.2, 50 PCs, Leiden over the neighborhood-augmented embedding." },
  { name: "marker-annotator", kind: "agent", desc: "Controlled-vocabulary cell-state calling (AC / MES / NPC / OPC-like + brain TME) from top cluster markers. Frontier or local models." },
  { name: "vitessce-forge", kind: "tool", desc: "Any .h5ad or Xenium folder → chunk-optimized zarr + interactive Vitessce portal. One command." },
  { name: "live-analysis", kind: "api", desc: "On-demand differential expression, composition shifts, and Moran's I spatial autocorrelation." },
  { name: "research-copilot", kind: "agent", desc: "Chat grounded in your portal's facts — clusters, selections, logged DE runs. Runs on a frontier model, or fully local on qwen3:8b." },
  { name: "paper-scout", kind: "agent", desc: "PubMed retrieval tuned to your clusters and markers — returns real PMIDs via NCBI E-utilities." },
  { name: "abstract-artist", kind: "agent", desc: "One-command graphical abstracts straight from pipeline results." },
  { name: "cohort-importer", kind: "tool", desc: "Imports published spatial cohorts with their annotations intact — states, niches, histopathology (see the de Jong section)." },
];

export default function ToolsGrid() {
  return (
    <section className="relative bg-ink-2/60 border-y border-line">
      <div className="px-6 md:px-14 py-20 md:py-28 max-w-7xl mx-auto">
        <Reveal>
          <p className="font-mono text-sm text-violet mb-4">11 · THE STACK</p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl">
            Eight capabilities, one stack.
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-dim leading-relaxed">
            Everything above — the domains, the labels, the portals, the copilot — came
            out of these eight pieces. Welcome to the machine room.
          </p>
        </Reveal>

        <Stagger className="mt-12 font-mono text-[14px]">
          {TOOLS.map((t) => (
            <motion.div
              key={t.name}
              variants={item}
              className="grid md:grid-cols-[190px_1fr_70px] items-baseline gap-2 md:gap-6 px-3 py-3.5 border-b border-line/60 last:border-b-0 hover:bg-panel rounded-lg transition-colors"
            >
              <span className="text-violet">{t.name}</span>
              <span className="text-dim font-sans text-[15px] leading-relaxed">{t.desc}</span>
              <span className="text-mint text-[12px] uppercase tracking-wider md:justify-self-end">[{t.kind}]</span>
            </motion.div>
          ))}
        </Stagger>

        <Reveal className="mt-12 max-w-4xl mx-auto">
          <CodePanel />
        </Reveal>

        <Reveal delay={0.1} className="mt-12 max-w-4xl mx-auto">
          <TerminalLive />
          <p className="mt-3 text-[13.5px] text-dim text-center leading-relaxed">
            <span className="font-semibold text-snow">Fig. 9&nbsp;|</span> The stack, from the terminal — a replay of the real GBM3 run.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
