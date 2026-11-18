"use client";

import Reveal from "./Reveal";
import AssayMini from "./AssayMini";
import { CONTACT } from "./AccessForms";
import { ArrowRight } from "./ArrowUpRight";

// Restored from the "Eight cores" grid (WhatWeDo.jsx, 4534ff0 / cc87d05), each
// card with its AssayMini animation. In/out lines restate the original one-liners;
// tools are named only where this page shows them in use.
const CORES = [
  { name: "Single-cell", kind: "singlecell", desc: "Raw reads to annotated atlases, including iPSC benchmarking.",
    io: ["Reads or count matrices", "QC'd, clustered, annotated atlas"], tools: "Scanpy, Leiden" },
  { name: "Spatial transcriptomics", kind: "spatial", desc: "Every cell or spot mapped back onto the tissue.",
    io: ["Visium, Xenium, MERFISH or seqFISH sections", "Domains, cell-state maps, a live portal"], tools: "BANKSY, cell2location, Vitessce",
    link: ["#viewer", "Open the live viewer"] },
  { name: "Chromatin accessibility and binding", kind: "chromatin", desc: "Open chromatin and protein–DNA contacts, bulk or single-cell.",
    io: ["ATAC-Seq, scATAC-Seq, ChIP-Seq, CUT&Tag or CUT&RUN reads", "Peak calls, bigWig tracks, differential binding, per-cell accessibility"], tools: "igv.js for review",
    link: ["#genomics", "See the SOX2 browser"] },
  { name: "DNA methylation", kind: "methylation", desc: "Global 5mC, plus the modifications short reads cannot see.",
    io: ["WGBS, EM-seq or PacBio HiFi reads", "5mC calls; 6mA and 4mC with haplotype-phased marks"],
    link: ["#genomics", "See HiFi reads at SOX2"] },
  { name: "Long-read sequencing", kind: "longread", desc: "Isoforms, structural variants and phased assemblies.",
    io: ["PacBio HiFi or nanopore reads", "Isoforms, SVs, phased assemblies"],
    link: ["#genomics", "See HiFi reads at SOX2"] },
  { name: "Radiomics and imaging", kind: "radiomics", desc: "From segmentation to outcome models.",
    io: ["Scans and annotations", "Segmentations, image features, outcome models"] },
  { name: "Calcium imaging", kind: "calcium", desc: "Wave detection without hand scoring.",
    io: ["Calcium imaging recordings", "Detected waves and events, per cell"] },
  { name: "Clinical data and biostatistics", kind: "clinical", desc: "Cohorts, trials and survival models.",
    io: ["Cohort or trial tables", "Cohort summaries, survival models"] },
  { name: "Custom apps: DNA Studio", kind: "dna", desc: "Plasmid maps from SnapGene files.",
    io: ["SnapGene .dna files", "Annotated plasmid maps"] },
];

export default function CoreCapabilities() {
  return (
    <section id="cores" className="relative px-6 md:px-14 py-20 md:py-28 max-w-7xl mx-auto">
      <Reveal>
        <p className="font-mono text-xs text-violet tracking-wide mb-4">CORE CAPABILITIES</p>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl">
          Nine cores. <span className="text-violet">One embedded team.</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-dim leading-relaxed">
          The glioblastoma run above is one of them. The others work the same way:
          a real pipeline, a portal you can open, and a report you can hand a reviewer.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
          {CORES.map((c) => (
            <div key={c.name} className="flex flex-col rounded-[4px] border border-line bg-panel/70 p-5">
              <div className="rounded-[3px] bg-white/[0.03] mb-4 overflow-hidden">
                <AssayMini kind={c.kind} height={120} />
              </div>
              <p className="font-medium text-[17px] leading-snug">{c.name}</p>
              <p className="text-dim text-[14px] mt-1.5 leading-relaxed">{c.desc}</p>
              <dl className="mt-4 space-y-1.5 text-[13px] leading-snug">
                <div className="grid grid-cols-[2.6rem_1fr] gap-2">
                  <dt className="text-dim">In</dt>
                  <dd className="text-snow/85">{c.io[0]}</dd>
                </div>
                <div className="grid grid-cols-[2.6rem_1fr] gap-2">
                  <dt className="text-dim">Out</dt>
                  <dd className="text-snow/85">{c.io[1]}</dd>
                </div>
                {c.tools && (
                  <div className="grid grid-cols-[2.6rem_1fr] gap-2">
                    <dt className="text-dim">Tools</dt>
                    <dd className="text-snow/85">{c.tools}</dd>
                  </div>
                )}
              </dl>
              {c.link && (
                <a href={c.link[0]} className="mt-auto pt-4 inline-flex items-center gap-1.5 text-[13.5px] text-violet hover:text-snow transition-colors">
                  {c.link[1]} <ArrowRight />
                </a>
              )}
            </div>
          ))}
        </div>
        <p className="mt-6 text-[15px] text-dim">
          Demos for the other cores are available on request. We also handle bulk RNA-seq,
          variants, proteomics, metabolomics, cytometry and microbiome.{" "}
          <a
            href={`mailto:${CONTACT}?subject=Artemis%20BioLabs%20%C2%B7%20sample%20report`}
            className="text-violet hover:text-snow underline underline-offset-4 transition-colors"
          >
            Request a sample report
          </a>
        </p>
      </Reveal>
    </section>
  );
}
