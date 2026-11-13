"use client";

import Reveal from "./Reveal";

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
