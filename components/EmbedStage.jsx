"use client";

// The fable stage alone — full-bleed, obsidian, replay in the corner.
// Served at /fable-embed/ for iframe embedding on the main site.
import FableStage from "./FableStage";

export default function EmbedStage() {
  const replay = () => window.dispatchEvent(new CustomEvent("artemis-salute"));
  return (
    <div className="relative w-full h-[100svh] overflow-hidden bg-[#090A0B]">
      <FableStage />
      <button
        type="button"
        onClick={replay}
        className="absolute bottom-4 right-4 z-10 rounded-[3px] border border-snow/25 bg-[#090A0B]/80 backdrop-blur-sm px-3.5 py-1.5 font-mono text-[11px] tracking-[0.14em] text-snow hover:border-violet hover:text-violet transition-all"
      >
        ↻ REPLAY
      </button>
    </div>
  );
}
