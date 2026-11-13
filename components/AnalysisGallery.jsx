"use client";

import Reveal from "./Reveal";
import GrnConcept from "./GrnConcept";

const FIGS = [
  {
    src: "analysis/GBM1_umap_pair.jpg",
    alt: "GBM1: UMAP of the BANKSY embedding beside the spatial section, both colored by putative cell state",
    cap: "GBM1 — the BANKSY-embedding UMAP beside the tissue, one color per putative cell state.",
    tag: "a",
  },
  {
    src: "analysis/TenX_GBM_umap_pair.jpg",
    alt: "10x GBM section: UMAP beside spatial coordinates, colored by putative cell state",
    cap: "10x GBM — same pairing on the fresh-frozen reference section.",
    tag: "b",
  },
  {
    src: "analysis/TenX_GBM_dpt_pair.jpg",
    alt: "10x GBM section: diffusion pseudotime shown on UMAP and on the tissue",
    cap: "10x GBM — diffusion pseudotime (scanpy DPT, rooted at the SOX2-max spot), on UMAP and on tissue. Exploratory: Visium spots mix cells, so read as a gradient, not a lineage.",
    tag: "c",
  },
  {
    src: "analysis/morphology_strip.jpg",
    alt: "Histological morphology of two glioma sections at three zoom levels",
    cap: "Morphology up close — the same H&E sections at three zoom levels (top: AT15, de Jong et al.; bottom: GBM2, Ren et al.). Staining density varies with cellularity.",
    tag: "d",
  },
];

export default function AnalysisGallery() {
  return (
    <section id="analysis" className="relative px-6 md:px-14 pb-24 md:pb-32 max-w-7xl mx-auto">
      <Reveal>
        <h3 className="text-2xl md:text-3xl font-semibold tracking-tight max-w-3xl">
          More ways to read a section.
        </h3>
        <p className="mt-4 max-w-2xl text-lg text-dim leading-relaxed">
          Every portal carries the embeddings with it — UMAP beside tissue, gradients like
          diffusion pseudotime on demand. All computed from the runs shown above.
        </p>
      </Reveal>
      {/* museum placards — plain-language concepts, clearly not data */}
      <Reveal className="mt-10 grid md:grid-cols-2 gap-5">
        <div className="rounded-[4px] border border-line bg-panel/80 p-6">
          <p className="font-mono text-[11px] tracking-[0.25em] text-violet uppercase mb-3">What's a UMAP?</p>
          <p className="text-[15.5px] leading-relaxed text-snow/90">
            A tissue section measures thousands of genes in every spot — far too many
            dimensions to look at. UMAP folds that space down to two, keeping neighbors
            close: spots with similar expression land near each other, and the clusters
            you see are real subpopulations. Some detail is always lost in the fold —
            which is why every UMAP on this page sits beside the tissue it came from.
          </p>
        </div>
        <div className="rounded-[4px] border border-line bg-panel/80 p-6">
          <p className="font-mono text-[11px] tracking-[0.25em] text-violet uppercase mb-3">Regulatory networks, next</p>
          <GrnConcept height={220} />
          <p className="mt-3 text-[13px] text-dim leading-relaxed">
            Concept sketch — gene-regulatory-network inference (after Kamimoto et al. 2020):
            expression + chromatin in, transcription-factor modules out. Illustration, not data.
          </p>
        </div>
      </Reveal>

      <div className="mt-8 grid gap-6">
        {FIGS.map((f) => (
          <Reveal key={f.src}>
            <a href={f.src} target="_blank" rel="noreferrer" className="block rounded-lg border border-snow/60 overflow-hidden bg-panel cursor-zoom-in">
              <img src={f.src} alt={f.alt} className="w-full" />
            </a>
            <p className="mt-2.5 text-[13.5px] text-dim leading-relaxed">
              <span className="font-semibold text-snow">Fig. 7{f.tag}&nbsp;|</span> {f.cap}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
