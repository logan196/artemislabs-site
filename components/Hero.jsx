"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import FounderLock from "./FounderLock";
import HeroCloud from "./HeroCloud";
import Decode from "./Decode";
import { BOOKING } from "./AccessForms";

export const NAV = [
  ["#banksy", "BANKSY"],
  ["#pipeline", "Pipeline"],
  ["#gallery", "Glioblastoma"],
  ["#whatwedo", "What we do"],
  ["#team", "Team"],
];

export default function Hero() {
  const ref = useRef(null);
  const [saluting, setSaluting] = useState(false);
  const saluteTimer = useRef(null);
  useEffect(() => () => clearTimeout(saluteTimer.current), []);
  const onState = useCallback(() => {}, []);
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

      {/* dimmed 3D UMAP — kept from the redesign, behind the Nov 13 typographic open */}
      <div className="absolute inset-0 -z-0">
        <div className="absolute inset-0 opacity-70"><HeroCloud onState={onState} /></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.42)_48%,transparent_78%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink" />
      </div>

      <nav className="relative z-20 flex items-center justify-between px-5 md:px-14 py-4 md:py-5">
        <a href="#" aria-label="Artemis BioLabs — top of page" onClick={salute} className="flex items-center gap-3">
          <img
            src="artemis_mark.svg"
            alt=""
            className={`h-8 w-8 md:h-9 md:w-9 transition-all duration-300 ${saluting ? "scale-110 [filter:drop-shadow(0_0_9px_rgba(111,216,200,0.85))]" : ""}`}
          />
          <span className="font-semibold tracking-[0.18em] text-[13px] md:text-[14px] text-snow">
            ARTEMIS <span className="font-mono text-violet tracking-[0.3em] text-[11px]">BIOLABS</span>
          </span>
        </a>
        <div className="flex items-center gap-3 md:gap-8 text-[14.5px] text-snow">
          <div className="hidden lg:flex items-center gap-8 font-medium">
            {NAV.map(([href, label]) => (
              <a key={href} href={href} className="whitespace-nowrap text-snow/80 hover:text-violet focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet rounded-sm transition-colors">
                {label}
              </a>
            ))}
          </div>
          <a
            href={BOOKING}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline text-snow/80 hover:text-snow whitespace-nowrap"
          >
            Book a call
          </a>
          <a
            href="#early-access"
            className="rounded-[3px] bg-snow text-ink px-4 py-1.5 font-medium hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet transition-colors whitespace-nowrap"
          >
            Request early access
          </a>
          <FounderLock />
          <details className="relative lg:hidden">
            <summary className="list-none cursor-pointer rounded-[3px] border border-white/20 px-3 py-1.5 text-snow select-none" aria-label="Open navigation menu">
              Menu
            </summary>
            <div className="absolute right-0 top-11 z-50 w-48 rounded-[4px] border border-line bg-panel/95 backdrop-blur shadow-xl p-2 flex flex-col">
              {NAV.map(([href, label]) => (
                <a key={href} href={href} className="px-3 py-2 rounded-sm hover:bg-white/5 text-snow">{label}</a>
              ))}
              <a href="#collaborate" className="px-3 py-2 rounded-sm hover:bg-white/5 text-snow">Suggest a collaboration</a>
              <a href={BOOKING} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-sm hover:bg-white/5 text-violet font-medium">Book a call ↗</a>
            </div>
          </details>
        </div>
      </nav>

      <motion.div style={{ opacity: fade }} className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.21, 0.6, 0.27, 1] }}
          className="relative"
        >
          <h1
            className="text-[2.5rem] leading-[1.04] sm:text-6xl xl:text-[5rem] tracking-[0.015em]"
            style={{ fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", fontWeight: 600 }}
          >
            <Decode text="ARTEMIS" delay={500} />{" "}
            <Decode text="BIOLABS" delay={1200} className="text-violet" />
          </h1>
          <p className="mt-4 font-mono text-[13px] tracking-[0.35em] text-dim uppercase">
            computational biology, accelerated.
          </p>
          <p className="mt-6 max-w-xl mx-auto text-lg md:text-xl text-snow leading-relaxed">
            Every core service your lab needs.
            <br className="hidden sm:block" />
            <span className="text-dim"> One AI-powered team.</span>
          </p>
          <p className="mt-4 max-w-lg mx-auto text-[15.5px] text-snow/70 leading-relaxed">
            Spatial, single-cell and genomics analysis for labs without a bioinformatics core.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#early-access"
              className="rounded-[3px] bg-snow text-ink px-7 py-3 font-medium hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet transition-colors"
            >
              Request early access
            </a>
            <a
              href={BOOKING}
              target="_blank"
              rel="noreferrer"
              className="rounded-[3px] border border-white/40 px-7 py-3 text-snow/90 hover:border-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet transition-all"
            >
              Book a 30-min call
            </a>
          </div>
          <p className="mt-6">
            <a
              href="live/brain/index.html"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-[14.5px] text-snow/80 hover:text-snow transition-colors"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
              3.9M cells, one mouse brain — explore it live →
            </a>
          </p>
        </motion.div>
      </motion.div>

      <div className="relative z-10 px-6 md:px-14 pb-5 flex flex-col items-center gap-3">
        <p className="max-w-2xl text-center text-[11.5px] leading-relaxed text-dim/80">
          Background: 3D UMAP of 120,000 cells from the Allen Brain Cell Atlas MERFISH mouse brain
          (Yao et al., <i>Nature</i> 2023), computed by Artemis; cells drift to their positions in the brain and back.
        </p>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.2 }}
          className="text-dim text-xl"
          aria-hidden
        >
          ↓
        </motion.div>
      </div>
    </section>
  );
}
