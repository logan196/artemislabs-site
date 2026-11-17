"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import FounderLock from "./FounderLock";
import HeroCloud from "./HeroCloud";
import { BOOKING } from "./AccessForms";

export const NAV = [
  ["#loop", "Process"],
  ["#gallery", "Glioblastoma"],
  ["#whatwedo", "What we do"],
  ["#team", "Team"],
  ["#stack", "Stack"],
];

const STATE_LABEL = {
  noise: "state 0 · unordered expression",
  umap: "state 1 · 3D UMAP — cells grouped by what they express",
  tissue: "state 2 · the same cells at their measured positions in the brain",
};

export default function Hero() {
  const ref = useRef(null);
  const [saluting, setSaluting] = useState(false);
  const [cloudState, setCloudState] = useState("noise");
  const saluteTimer = useRef(null);
  useEffect(() => () => clearTimeout(saluteTimer.current), []);
  const onState = useCallback((s) => setCloudState((p) => (p === s ? p : s)), []);
  const salute = (e) => {
    e.preventDefault();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    window.dispatchEvent(new CustomEvent("artemis-salute"));
    setSaluting(true);
    clearTimeout(saluteTimer.current);
    saluteTimer.current = setTimeout(() => setSaluting(false), 1200);
  };
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[100svh] flex flex-col overflow-hidden bg-ink">
      <a
        href="#banksy"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:bg-panel focus:border focus:border-violet focus:px-3 focus:py-1.5 focus:rounded-[3px]"
      >
        Skip to content
      </a>

      {/* background: real 3D UMAP point cloud */}
      <div className="absolute inset-0 -z-0">
        <div className="absolute inset-0 opacity-70"><HeroCloud onState={onState} /></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_55%,rgba(0,0,0,0.86)_0%,rgba(0,0,0,0.45)_45%,transparent_75%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink" />
      </div>

      <nav className="relative z-20 flex items-center justify-between px-5 md:px-12 py-4 border-b border-white/[0.06] bg-ink/40 backdrop-blur-md">
        <a href="#" aria-label="Artemis BioLabs — top of page" onClick={salute} className="flex items-center gap-3">
          <img
            src="artemis_mark.svg"
            alt=""
            className={`h-8 w-8 transition-all duration-300 ${saluting ? "scale-110 [filter:drop-shadow(0_0_9px_rgba(111,216,200,0.85))]" : ""}`}
          />
          <span className="text-[16px] font-semibold tracking-[0.02em] text-snow">Artemis BioLabs</span>
        </a>
        <div className="flex items-center gap-3 md:gap-7 text-[14px] text-snow">
          <div className="hidden lg:flex items-center gap-7">
            {NAV.map(([href, label]) => (
              <a key={href} href={href} className="hair-link whitespace-nowrap text-snow/75 hover:text-snow focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet rounded-sm transition-colors">
                {label}
              </a>
            ))}
          </div>
          <a
            href={BOOKING}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline hair-link text-snow/75 hover:text-snow whitespace-nowrap"
          >
            Book a call
          </a>
          <a
            href="#early-access"
            className="rounded-full bg-snow text-ink px-4 py-1.5 font-medium hover:bg-violet focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet transition-colors whitespace-nowrap"
          >
            Request early access
          </a>
          <FounderLock />
          <details className="relative lg:hidden">
            <summary className="list-none cursor-pointer rounded-full border border-white/20 px-3 py-1.5 text-snow select-none" aria-label="Open navigation menu">
              Menu
            </summary>
            <div className="absolute right-0 top-11 z-50 w-48 rounded-[6px] border border-line bg-panel/95 backdrop-blur shadow-xl p-2 flex flex-col">
              {NAV.map(([href, label]) => (
                <a key={href} href={href} className="px-3 py-2 rounded-sm hover:bg-white/5 text-snow">{label}</a>
              ))}
              <a href="#collaborate" className="px-3 py-2 rounded-sm hover:bg-white/5 text-snow">Suggest a collaboration</a>
              <a href={BOOKING} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-sm hover:bg-white/5 text-violet font-medium">Book a call ↗</a>
            </div>
          </details>
        </div>
      </nav>

      <motion.div style={{ opacity: fade }} className="relative z-10 flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-20 max-w-7xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="max-w-3xl"
        >
          <h1 className="text-[2.3rem] sm:text-5xl xl:text-[3.6rem] text-snow">
            Spatial, single-cell and genomics analysis for labs without a bioinformatics core.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-snow/75 leading-relaxed">
            Send us your data or point us at your GEO series. We run the pipelines, compare
            methods, review the results and hand back figures, code and a live portal you
            can share.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a href="#early-access" className="rounded-full bg-snow text-ink px-6 py-2.5 font-medium hover:bg-white transition-colors">
              Request early access
            </a>
            <a href={BOOKING} target="_blank" rel="noreferrer" className="rounded-full border border-white/20 px-6 py-2.5 text-snow/90 hover:border-white/50 transition-colors">
              Book a 30-min call
            </a>
          </div>
          <p className="mt-6 text-[14px] text-dim">
            See it on real data:{" "}
            <a href="live/brain/index.html" target="_blank" rel="noreferrer" className="hair-link text-snow/85 hover:text-snow">3.9M-cell mouse brain atlas ↗</a>
            {" · "}
            <a href="#gallery" className="hair-link text-snow/85 hover:text-snow">glioblastoma spatial programs</a>
          </p>
        </motion.div>
      </motion.div>

      <div className="relative z-10 px-6 md:px-12 pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <p className="max-w-xl text-[11.5px] leading-relaxed text-dim/80">
          Background: 3D UMAP of 120,000 cells from the Allen Brain Cell Atlas MERFISH mouse brain
          (Yao et al., <i>Nature</i> 2023), computed by Artemis; cells drift to their positions in the brain and back.
        </p>
      </div>
    </section>
  );
}
