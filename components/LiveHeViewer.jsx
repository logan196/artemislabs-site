"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";
import ArrowUpRight from "./ArrowUpRight";
import { ArrowRight } from "./ArrowUpRight";

// Phones get the same section as a still that fades between the H&E and the
// cell-state overlay; the full viewer needs a wider screen than 390px.
function PhonePoster() {
  const [states, setStates] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let iv;
    const io = new IntersectionObserver(([e]) => {
      clearInterval(iv);
      if (e.isIntersecting) iv = setInterval(() => setStates((v) => !v), 3200);
    }, { threshold: 0.3 });
    if (ref.current) io.observe(ref.current);
    return () => { io.disconnect(); clearInterval(iv); };
  }, []);
  return (
    <a
      ref={ref}
      href="live/explore/index.html"
      target="_blank"
      rel="noreferrer"
      className="md:hidden mt-5 block rounded-[4px] border border-snow/60 bg-[#f3efe4] overflow-hidden"
    >
      <span className="relative block aspect-[2000/1781]">
        <img src="live/explore/he.jpg" alt="AT15 glioblastoma section, H&E stain" className="absolute inset-0 w-full h-full object-contain" />
        <img
          src="live/explore/states.png"
          alt="The same section with mapped cell states overlaid"
          className="absolute inset-0 w-full h-full object-contain transition-opacity duration-[1400ms] ease-in-out"
          style={{ opacity: states ? 1 : 0 }}
        />
        <span className="absolute top-2 left-2 font-mono text-[10.5px] text-ink bg-violet-deep/95 rounded-[3px] px-2 py-0.5">
          {states ? "cell states" : "H&E"}
        </span>
      </span>
      <span className="block bg-ink border-t border-line px-4 py-3 text-[14px] text-violet font-medium">
        Open the live viewer <ArrowUpRight className="ml-1" />
        <span className="block font-mono text-[11px] text-dim font-normal mt-0.5">works best on a laptop or tablet</span>
      </span>
    </a>
  );
}

// Restored from the embedded Artemis Explore viewer in GbmGallery.jsx
// (4534ff0, live on artemislabs.bio Nov 13). The iframe is the real viewer
// served from /live/explore/, not a screenshot.
export default function LiveHeViewer() {
  return (
    <section id="viewer" className="relative px-6 md:px-14 py-20 md:py-28 max-w-7xl mx-auto">
      <Reveal>
        <p className="font-mono text-xs text-violet tracking-wide mb-4">LIVE VIEWER · IN THE BROWSER</p>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl">
          Pan the H&amp;E. <span className="text-violet">Turn on the cell states.</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-dim leading-relaxed">
          This is Artemis Explore running on a public glioblastoma section. Drag and
          scroll to move around the histology, blend in marker channels, and switch
          the mapped cell states on and off.
        </p>
      </Reveal>

      <Reveal delay={0.08}>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a
            href="live/explore/index.html"
            target="_blank"
            rel="noreferrer"
            className="rounded-[3px] bg-violet-deep text-ink px-5 py-2 text-[15px] font-medium hover:bg-violet transition-colors"
          >
            Open full screen <ArrowUpRight className="ml-1" />
          </a>
          <a
            href="live/GBM3/portal.html"
            target="_blank"
            rel="noreferrer"
            className="rounded-[3px] border border-snow/50 px-5 py-2 text-[15px] text-dim hover:text-snow hover:border-violet transition-all"
          >
            GBM3 portal <ArrowRight className="ml-1" />
          </a>
        </div>
        <PhonePoster />
        <div className="hidden md:block mt-5 relative overflow-hidden rounded-[4px] bg-ink border border-snow/60">
          <iframe
            src="live/explore/index.html"
            title="Artemis Explore: live glioblastoma section viewer with H&E, marker channels and cell states"
            className="w-full h-[720px] border-0 block"
            loading="lazy"
          />
          <span className="absolute top-3 right-3 font-mono text-[11px] text-ink bg-violet-deep/95 rounded-[3px] px-2.5 py-1 pointer-events-none">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-ink mr-1.5 align-middle" />live · the viewer, not a screenshot
          </span>
        </div>
        <p className="mt-4 text-[13.5px] text-dim leading-relaxed max-w-4xl">
          <span className="font-semibold text-snow">Live viewer&nbsp;|</span> AT15, a
          Visium glioblastoma section from de Jong et al., <i>Nature</i> 2026
          (gbmspace.org): 10,356 spots, eight expression-derived marker channels, and
          66 cell states estimated with cell2location.
        </p>
      </Reveal>
    </section>
  );
}
