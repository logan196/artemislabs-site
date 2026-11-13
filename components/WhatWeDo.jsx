"use client";

import Reveal from "./Reveal";
import AssayMini from "./AssayMini";

const CORES = [
  { name: "Single-cell", desc: "Raw reads to annotated atlases · iPSC benchmarking", kind: "singlecell" },
  { name: "Spatial transcriptomics", desc: "Every cell mapped on tissue", live: true, kind: "spatial" },
  { name: "CUT&Tag and chromatin", desc: "Peaks, tracks, differential binding", kind: "chromatin" },
  { name: "Long-read sequencing", desc: "Isoforms, SVs and methylation", kind: "longread" },
  { name: "Radiomics and imaging", desc: "Segmentation to outcome models", kind: "radiomics" },
  { name: "Calcium imaging", desc: "Wave detection without hand scoring", kind: "calcium" },
  { name: "Clinical data and biostatistics", desc: "Cohorts, trials, survival models", kind: "clinical" },
  { name: "Custom apps: DNA Studio", desc: "Plasmid maps from SnapGene files", kind: "dna" },
];

export default function WhatWeDo() {
  return (
    <section id="whatwedo" className="relative px-6 md:px-14 py-24 md:py-36 max-w-7xl mx-auto">
      <Reveal>
        <p className="font-mono text-sm text-violet mb-4">06 · WHAT WE DO</p>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl">
          Every core your biotech would build or rent.
        </h2>
        <p className="text-4xl md:text-5xl font-semibold tracking-tight text-violet">
          One AI-powered team.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          {CORES.map((c) => (
            <div key={c.name} className="rounded-[4px] border border-line bg-panel/70 p-5">
              <div className="rounded-[3px] bg-[#efeadd66] mb-3 overflow-hidden">
                <AssayMini kind={c.kind} height={110} />
              </div>
              <p className="font-medium text-[17px]">{c.name}</p>
              <p className="text-dim text-[14.5px] mt-1.5">{c.desc}</p>
              {c.live ? (
                <a
                  href="live/explore/index.html"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-violet font-medium hover:underline text-[14px]"
                >
                  Live demo →
                </a>
              ) : (
                <p className="mt-3 font-mono text-[11.5px] text-dim">demo on request</p>
              )}
            </div>
          ))}
        </div>
        <p className="mt-6 text-[15px] text-dim">
          Also bulk RNA-seq, variants, proteomics, metabolomics, cytometry and microbiome.
        </p>
      </Reveal>
    </section>
  );
}
