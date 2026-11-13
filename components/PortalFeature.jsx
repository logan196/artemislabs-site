"use client";

import Reveal from "./Reveal";

// LatchBio-style product block: real UI screenshot carrying the section.
export default function PortalFeature() {
  return (
    <section id="portal" className="relative px-6 md:px-14 py-24 md:py-32 max-w-7xl mx-auto">
      <Reveal>
        <p className="font-mono text-sm text-violet mb-4">THE PORTAL</p>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl">
          One selection, every view.
        </h2>
        <p className="mt-5 max-w-2xl text-lg text-dim leading-relaxed">
          Lasso a region on the tissue and the same cells light up in UMAP, the heatmap
          and the gene list — Vitessce linked views over a chunk-optimized zarr, in the
          browser, no install.
        </p>
      </Reveal>
      <Reveal delay={0.08} className="mt-10">
        <div className="rounded-lg border border-snow/60 overflow-hidden shadow-[0_24px_60px_-28px_rgba(28,26,21,0.45)]">
          <img
            src="demo/still_GBM1_portal.png"
            alt="Artemis BioLabs portal: GBM1 open with linked UMAP and spatial scatterplots, cell-set controls, gene list, Moran's heatmap and the copilot rail"
            className="w-full"
          />
        </div>
        <p className="mt-3 text-[13.5px] text-dim leading-relaxed">
          <span className="font-semibold text-snow">Fig. 6&nbsp;|</span> The portal as captured during the demo recording — GBM1 (4,764 spots) with UMAP + spatial linked views, cell sets, markers and the copilot rail.
        </p>
      </Reveal>
      <Reveal delay={0.12} className="mt-8 grid sm:grid-cols-3 gap-4">
        {[
          ["Drop-in ingest", "Any .h5ad or 10x Xenium folder — counts detected, coordinates verified, portal out."],
          ["Linked exploration", "Spatial ⇄ UMAP ⇄ heatmap ⇄ gene list share one selection and one color encoding."],
          ["Ask the section", "The copilot rail answers grounded questions — and can run with a local model through Ollama."],
        ].map(([t, d]) => (
          <div key={t} className="rounded-[4px] border border-line bg-panel/70 p-5">
            <p className="font-medium text-[16px]">{t}</p>
            <p className="text-dim text-[14.5px] mt-1.5 leading-relaxed">{d}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
