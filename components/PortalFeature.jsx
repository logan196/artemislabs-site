"use client";

import { useState } from "react";
import Reveal from "./Reveal";

// Static Hugging Face Space (the bare .hf.space host 404s for static Spaces).
// nointro skips the portal opening sequence; #wb lands on the Vitessce workbench.
// The desktop frame is 980px tall because that is the height at which the Space's
// own hash scroll holds the workbench under its sticky nav after layout.
const SPACE_SRC =
  "https://logan-9726-artemis-gudjonsson-skin-xenium.static.hf.space/index.html?nointro=1#wb";
const SPACE_OPEN =
  "https://huggingface.co/spaces/logan-9726/artemis-gudjonsson-skin-xenium";

function LiveExplorer() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="rounded-lg border border-snow/60 overflow-hidden shadow-[0_24px_60px_-28px_rgba(28,26,21,0.45)] bg-[#0b0c12]">
      <div className="px-4 py-3 border-b border-line bg-panel flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13.5px] text-dim leading-relaxed">
          19,383 cells, 10x Xenium, morbilliform drug eruption, lasso to link the panels.
        </p>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {!loaded && (
            <button
              type="button"
              onClick={() => setLoaded(true)}
              className="rounded-[3px] bg-violet-deep text-ink px-5 py-2 text-sm font-medium hover:bg-violet transition-colors"
            >
              Load the live explorer
            </button>
          )}
          <a
            href={SPACE_OPEN}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[13.5px] text-violet hover:text-snow transition-colors"
          >
            Open the full explorer
          </a>
        </div>
      </div>
      <div className="relative w-full bg-[#0b0c12] h-[min(70svh,640px)] md:h-[980px]">
        {loaded ? (
          <iframe
            id="live-portal-explorer"
            src={SPACE_SRC}
            title="Live Gudjonsson Lab skin Xenium explorer: linked UMAP, spatial scatter, tissue, heatmap and gene list"
            className="absolute inset-0 w-full h-full block"
            style={{ border: 0, background: "#0b0c12" }}
            allow="fullscreen; clipboard-write"
            referrerPolicy="strict-origin-when-cross-origin"
            tabIndex={0}
          />
        ) : (
          <button
            type="button"
            onClick={() => setLoaded(true)}
            className="absolute inset-0 w-full h-full group cursor-pointer text-left"
            aria-label="Load the live Gudjonsson Lab Xenium explorer"
          >
            <picture>
              <source
                media="(max-width: 760px)"
                srcSet="demo/gudjonsson_portal_poster_small.webp"
              />
              <img
                src="demo/gudjonsson_portal_poster.webp"
                alt="Linked UMAP and spatial scatterplots of MDE1, coloured by CXCL9 on a plasma colormap"
                className="absolute inset-0 w-full h-full object-contain"
                width={1864}
                height={824}
                decoding="async"
              />
            </picture>
            <span
              className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors"
              aria-hidden
            />
          </button>
        )}
      </div>
    </div>
  );
}

export default function PortalFeature() {
  return (
    <section id="portal" className="relative px-6 md:px-14 py-24 md:py-32 max-w-7xl mx-auto">
      <Reveal>
        <p className="font-mono text-sm text-violet mb-4">LIVE PORTAL</p>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl">
          One selection, every view.
        </h2>
        <p className="mt-5 max-w-2xl text-lg text-dim leading-relaxed">
          Lasso a region on the tissue and the same cells light up in UMAP, the heatmap
          and the gene list. This is the live Gudjonsson Lab explorer, a Vitessce
          workbench over public 10x Xenium data, in the browser, with no install.
        </p>
      </Reveal>
      <Reveal delay={0.08} className="mt-10">
        <LiveExplorer />
      </Reveal>
      <Reveal delay={0.12} className="mt-8 grid sm:grid-cols-3 gap-4">
        {[
          ["Drop-in ingest", "Any .h5ad or 10x Xenium folder. Counts detected, coordinates verified, portal out."],
          ["Linked exploration", "Spatial ⇄ UMAP ⇄ heatmap ⇄ gene list share one selection and one color encoding."],
          ["Ask the section", "The copilot rail answers grounded questions, and can run with a local model through Ollama."],
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
