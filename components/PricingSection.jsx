"use client";

import Reveal from "./Reveal";

const BOOKING =
  "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0FzlJl55WV52jaH-JEG8_xJLO5YLd20t2ksXikjwMfGnVQ-zLI4XUCAmHTFiLE1tnQgAIxBhjW";

const MODALITIES = [
  ["Single-cell & single-nucleus", "scRNA/snRNA-seq (10x, Smart-seq), scATAC, multiome, CITE-seq — annotation, trajectories, DE, pathways, cell–cell communication."],
  ["Epigenetics & chromatin", "Bulk and single-cell ATAC, CUT&RUN, CUT&Tag, ChIP-seq, WGBS/EM-seq, methylation arrays, Hi-C and chromatin conformation."],
  ["Spatial omics & imaging", "Xenium, MERFISH, CosMx, seqFISH+, Visium & Visium HD, Slide-seq, CODEX/PhenoCycler, spatial ATAC & CUT&Tag — segmentation to niches to interactive portals."],
  ["Bulk & functional genomics", "Bulk RNA-seq and GSEA, ribosome profiling, CRISPR/Perturb-seq screens, TCR/BCR repertoires, Nanopore & PacBio long reads, SVs, WGS/WES annotation."],
];

const INCLUDED = [
  "Unlimited analysis requests and scientific support",
  "Pipeline setup, execution, QC and troubleshooting",
  "Publication-ready figures, tables and statistics",
  "Biological interpretation, grounded in the literature",
  "Reanalysis of public cohorts (GEO, CELLxGENE, ARCHS4) beside your data",
  "Reproducible workflows with documented parameters and provenance",
  "Interactive portals for spatial and high-dimensional datasets",
  "Regular working sessions with the computational team",
];

export default function PricingSection() {
  return (
    <section id="engagement" className="relative px-6 md:px-14 py-24 md:py-32 max-w-7xl mx-auto">
      <Reveal>
        <p className="font-mono text-sm text-violet mb-4">09 · THE ENGAGEMENT</p>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl">
          An embedded bioinformatics team.
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-dim leading-relaxed">
          Artemis BioLabs gives your lab an on-demand computational biology group and AI
          analysis platform for <span className="text-snow font-medium">$3,000–$5,000 per month</span>,
          scaled by data volume, complexity and infrastructure — with unlimited ongoing
          analysis and support, not per-dataset or per-figure billing. Assay-agnostic: one
          engagement covers every modality below, our agents working alongside a PhD
          bioinformatics team.
        </p>
      </Reveal>

      <Reveal delay={0.06} className="mt-10 grid sm:grid-cols-2 gap-4">
        {MODALITIES.map(([t, d]) => (
          <div key={t} className="rounded-[4px] border border-line bg-panel/70 p-5">
            <p className="font-medium text-[16px]">{t}</p>
            <p className="text-dim text-[14.5px] mt-1.5 leading-relaxed">{d}</p>
          </div>
        ))}
      </Reveal>

      <Reveal delay={0.1} className="mt-10 grid lg:grid-cols-[1fr_320px] gap-8 items-start">
        <div>
          <p className="font-mono text-[12px] tracking-[0.2em] text-violet uppercase mb-3">A typical engagement includes</p>
          <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-[15px] text-dim leading-relaxed list-disc pl-5">
            {INCLUDED.map((x) => <li key={x}>{x}</li>)}
          </ul>
        </div>
        <div className="rounded-[4px] border border-snow/60 bg-panel p-6">
          <p className="font-mono text-[12px] tracking-[0.2em] text-violet uppercase">Tiers</p>
          <p className="mt-3 text-[15px] leading-relaxed">
            <span className="font-semibold">$3,000/mo</span>
            <span className="text-dim"> — standard ongoing support</span>
          </p>
          <p className="mt-2 text-[15px] leading-relaxed">
            <span className="font-semibold">$5,000/mo</span>
            <span className="text-dim"> — high-volume, multimodal, spatial or infrastructure-heavy work</span>
          </p>
          <p className="mt-4 text-[14px] text-dim leading-relaxed">
            We set the tier together after a short conversation about your assays, data
            volume and priorities.
          </p>
          <a
            href={BOOKING}
            target="_blank"
            rel="noreferrer"
            className="mt-5 block text-center rounded-[3px] bg-violet-deep text-ink px-5 py-2.5 font-medium hover:bg-violet transition-colors"
          >
            Book 20–30 minutes
          </a>
        </div>
      </Reveal>
    </section>
  );
}
