"use client";

import Reveal, { Stagger, item } from "./Reveal";
import { motion } from "framer-motion";
import BioDodecahedron from "./BioDodecahedron";

const TOOLS = [
  { name: "banksy-pipeline", kind: "agent", desc: "Spatially-aware clustering — BANKSY λ=0.2, 50 PCs, Leiden over the neighborhood-augmented embedding." },
  { name: "marker-annotator", kind: "agent", desc: "Controlled-vocabulary cell-state calling (AC / MES / NPC / OPC-like + brain TME) from top cluster markers. Claude or local Qwen3." },
  { name: "vitessce-forge", kind: "tool", desc: "Any .h5ad or Xenium folder → chunk-optimized zarr + interactive Vitessce portal. One command." },
  { name: "live-analysis", kind: "api", desc: "On-demand differential expression, composition shifts, and Moran's I spatial autocorrelation." },
  { name: "research-copilot", kind: "agent", desc: "Chat grounded in your portal's facts — clusters, selections, logged DE runs. Runs on Claude, or fully local on qwen3:8b." },
  { name: "paper-scout", kind: "agent", desc: "PubMed retrieval tuned to your clusters and markers — returns real PMIDs via NCBI E-utilities." },
  { name: "abstract-artist", kind: "agent", desc: "One-command graphical abstracts straight from pipeline results." },
  { name: "lead-engine", kind: "agent", desc: "Finds labs whose published work matches the pipeline — then drafts a grounded intro." },
];

export default function ToolsGrid() {
  return (
    <section className="relative bg-ink-2/60 border-y border-line">
      <div className="px-6 md:px-14 py-20 md:py-28 max-w-7xl mx-auto">
        <Reveal>
          <p className="font-mono text-sm text-violet mb-4">07 · THE STACK</p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl">
            Eight capabilities, one stack.
          </h2>
        </Reveal>

        <Reveal delay={0.05} className="mt-6">
          <BioDodecahedron size={440} />
          <p className="text-center text-[13.5px] text-dim leading-relaxed mt-4">
            <span className="font-semibold text-snow">Fig. 5&nbsp;|</span> The dodecahedron of bioinformatics — twenty vertices of the stack, thirty edges connecting them.
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

        <Reveal delay={0.1} className="mt-12 max-w-4xl mx-auto">
          <div className="rounded-lg border border-snow/60 overflow-hidden">
            <div className="flex items-center gap-1.5 bg-ink-2 border-b border-line px-4 py-2.5" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-line" />
              <span className="h-2.5 w-2.5 rounded-full bg-line" />
              <span className="h-2.5 w-2.5 rounded-full bg-line" />
              <span className="ml-3 font-mono text-[12px] text-dim">artemis — zsh</span>
            </div>
            <img src="artemis_cli.png" alt="Artemis BioLabs CLI showing the spatial transcriptomics agent stack" className="w-full max-h-[420px] object-cover object-top" />
          </div>
          <p className="mt-3 text-[13.5px] text-dim text-center leading-relaxed">
            <span className="font-semibold text-snow">Fig. 6&nbsp;|</span> The stack, from the terminal.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
