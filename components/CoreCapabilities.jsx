"use client";

import Reveal from "./Reveal";
import AssayMini from "./AssayMini";
import { CONTACT } from "./AccessForms";

// Restored from the "Eight cores" grid (WhatWeDo.jsx, 4534ff0 / cc87d05).
// Same eight cores and descriptions; each card keeps its AssayMini animation.
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

export default function CoreCapabilities() {
  return (
    <section id="cores" className="relative px-6 md:px-14 py-20 md:py-28 max-w-7xl mx-auto">
      <Reveal>
        <p className="font-mono text-xs text-violet tracking-wide mb-4">CORE CAPABILITIES</p>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl">
          Eight cores. <span className="text-violet">One embedded team.</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-dim leading-relaxed">
          The glioblastoma run above is one of them. The others work the same way:
          a real pipeline, a portal you can open, and a report you can hand a reviewer.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          {CORES.map((c) => (
            <div key={c.name} className="rounded-[4px] border border-line bg-panel/70 p-5">
              <div className="rounded-[3px] bg-white/[0.03] mb-3 overflow-hidden">
                <AssayMini kind={c.kind} height={110} />
              </div>
              <p className="font-medium text-[17px]">{c.name}</p>
              <p className="text-dim text-[14.5px] mt-1.5">{c.desc}</p>
              {c.live ? (
                <a href="#viewer" className="mt-3 inline-block text-violet font-medium hover:underline text-[14px]">
                  Live demo ↑
                </a>
              ) : (
                <p className="mt-3 font-mono text-[11.5px] text-dim">demo on request</p>
              )}
            </div>
          ))}
        </div>
        <p className="mt-6 text-[15px] text-dim">
          Also bulk RNA-seq, variants, proteomics, metabolomics, cytometry and microbiome.{" "}
          <a
            href={`mailto:${CONTACT}?subject=Artemis%20BioLabs%20%C2%B7%20sample%20report`}
            className="text-violet hover:text-snow underline underline-offset-4 transition-colors"
          >
            Request a sample report →
          </a>
        </p>
      </Reveal>
    </section>
  );
}
