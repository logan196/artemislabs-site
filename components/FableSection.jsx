"use client";

// ABOUT ARTEMIS · THE FABLE, the origin story as a framed, replayable stage.
// Self-contained: drop <FableSection /> under any About/team section (it only
// needs FableStage + Decode). The stage is the same sequence as the hero, // the huntress constructed by code, the long parabola, the crystal of twelve.
import FableStage from "./FableStage";

export default function FableSection() {
  const replay = () => window.dispatchEvent(new CustomEvent("artemis-salute"));

  return (
    <section id="fable" aria-label="About Artemis, the fable" className="px-6 md:px-14 py-24 md:py-32">
      <div className="max-w-6xl mx-auto">
        <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-violet mb-3">
          About Artemis · why Artemis
        </p>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
          One pass from raw counts to spatial structure.
        </h2>
        <p className="max-w-2xl text-[15.5px] text-dim leading-relaxed mb-8">
          A spatial transcriptomics run starts as millions of unmapped reads and a
          noisy expression matrix. In four seconds, an autonomous agent loop ingests
          the coordinates, runs neighborhood-aware clustering, and resolves distinct
          tumor states, turning a raw <code className="font-mono text-[13.5px] text-snow/80">.h5ad</code> file
          into a live, queryable tissue portal.
        </p>

        <div className="relative h-[520px] md:h-[600px] rounded-[6px] border border-line overflow-hidden bg-[#090A0B]">
          <FableStage />
          <button
            type="button"
            onClick={replay}
            className="absolute bottom-4 right-4 z-10 rounded-[3px] border border-snow/25 bg-[#090A0B]/80 backdrop-blur-sm px-3.5 py-1.5 font-mono text-[11px] tracking-[0.14em] text-snow hover:border-violet hover:text-violet transition-all"
          >
            ↻ REPLAY THE FABLE
          </button>
        </div>

        <p className="mt-4 font-mono text-[11px] text-dim/70">
          The sequence is drawn live: SVG monoline engraving over a canvas crystal,
          no video. Click the lockup anywhere on the page to fire it again.
        </p>
        <p className="mt-3 text-[15px]">
          <a href="/delivered" className="text-violet underline underline-offset-4 hover:text-snow">
            What if your data were delivered alive?
          </a>
        </p>
      </div>
    </section>
  );
}
