"use client";

import { useRef } from "react";
import AssayMini from "./AssayMini";
import Reveal, { Stagger } from "./Reveal";
import { MAILTO } from "@/lib/links";

const CORES = [
  { n: "01", name: "Single-cell", desc: "Raw reads to annotated atlases, including iPSC benchmarking.", kind: "singlecell" },
  { n: "02", name: "Spatial transcriptomics", desc: "Every cell mapped back onto the tissue.", kind: "spatial" },
  { n: "03", name: "CUT&Tag and chromatin", desc: "Peaks, tracks, and differential binding.", kind: "chromatin" },
  { n: "04", name: "Long-read sequencing", desc: "Isoforms, structural variants, and methylation.", kind: "longread" },
  { n: "05", name: "Radiomics and imaging", desc: "Segmentation through outcome models.", kind: "radiomics" },
  { n: "06", name: "Calcium imaging", desc: "Wave detection without hand scoring.", kind: "calcium" },
  { n: "07", name: "Clinical data", desc: "Cohorts, trials, and survival models.", kind: "clinical" },
  { n: "08", name: "DNA Studio", desc: "Plasmid maps from SnapGene files.", kind: "dna" },
];

function LitCard({ children }) {
  const ref = useRef(null);
  const move = (e) => {
    const node = ref.current;
    if (!node) return;
    const r = node.getBoundingClientRect();
    node.style.setProperty("--mx", `${e.clientX - r.left}px`);
    node.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <article
      ref={ref}
      onMouseMove={move}
      className="reveal lit-card relative overflow-hidden rounded-2xl border border-line bg-panel/80 p-4"
    >
      {children}
    </article>
  );
}

export default function WhatWeDo() {
  return (
    <section id="services" className="relative mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
      <Reveal>
        <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-violet">Services</p>
        <h2 className="font-display mt-4 max-w-3xl text-4xl text-snow md:text-6xl">
          Eight cores. One team.
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-dim">
          Study design, the analysis, and a result the people in the lab can actually use.
        </p>
      </Reveal>

      <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CORES.map((c) => (
          <LitCard key={c.name}>
            <div className="relative z-10">
              <div className="mb-4 overflow-hidden rounded-xl bg-[#f4efe4]">
                <AssayMini kind={c.kind} height={108} />
              </div>
              <p className="font-mono text-[11px] tracking-[0.16em] text-violet">{c.n}</p>
              <h3 className="mt-2 text-[18px] font-medium text-snow">{c.name}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-dim">{c.desc}</p>
            </div>
          </LitCard>
        ))}
      </Stagger>

      <Reveal delay={0.05}>
        <p className="mt-8 max-w-3xl text-[15px] leading-relaxed text-dim">
          Also bulk RNA-seq, variants, proteomics, metabolomics, cytometry, and microbiome.{" "}
          <a href={MAILTO} className="text-violet underline decoration-violet/40 underline-offset-4 hover:text-snow">
            Ask for a sample report
          </a>
        </p>
      </Reveal>
    </section>
  );
}
