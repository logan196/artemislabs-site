"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import FableStage from "./FableStage";
import FounderLock from "./FounderLock";
import Decode from "./Decode";

const BOOKING =
  "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0FzlJl55WV52jaH-JEG8_xJLO5YLd20t2ksXikjwMfGnVQ-zLI4XUCAmHTFiLE1tnQgAIxBhjW";

const NAV = [
  ["#banksy", "BANKSY"],
  ["#pipeline", "Pipeline"],
  ["#gallery", "Glioblastoma"],
  ["#whatwedo", "What we do"],
];

// copy settles in after the arrow lands (beat 05 · living state)
const SETTLE = 2.3;

export default function Hero() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const [saluting, setSaluting] = useState(false);
  const saluteTimer = useRef(null);
  useEffect(() => () => clearTimeout(saluteTimer.current), []);
  const salute = (e) => {
    e.preventDefault();
    const reducedNow = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reducedNow ? "auto" : "smooth" });
    window.dispatchEvent(new CustomEvent("artemis-salute")); // replays the fable
    setSaluting(true);
    clearTimeout(saluteTimer.current);
    saluteTimer.current = setTimeout(() => setSaluting(false), 1200);
  };
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  // initial must not branch on `reduced` — the server can't know it, and a
  // mismatch breaks hydration. Reduced motion zeroes the transition instead.
  const settle = {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: reduced
      ? { duration: 0 }
      : { duration: 0.9, delay: SETTLE, ease: [0.21, 0.6, 0.27, 1] },
  };

  return (
    <section ref={ref} className="relative min-h-[92svh] md:min-h-[96svh] flex flex-col overflow-hidden">
      <a
        href="#pipeline"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:bg-panel focus:border focus:border-violet focus:px-3 focus:py-1.5 focus:rounded-[3px]"
      >
        Skip to content
      </a>
      <div className="absolute inset-0 -z-10">
        <div className="aurora absolute -top-1/4 left-1/2 h-[80vh] w-[80vw] -translate-x-1/2 rounded-full bg-violet-deep/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,#07060b_80%)]" />
      </div>

      {/* the fable — wilderness, the draw, the shot, the crystal of twelve */}
      <motion.div style={{ opacity: fade }} className="absolute inset-0">
        <FableStage />
      </motion.div>

      <nav className="relative z-10 flex items-center justify-between px-5 md:px-14 py-4 md:py-5">
        <a href="#" aria-label="Artemis BioLabs — top of page (replays the opening)" onClick={salute}>
          <img
            src="artemis_lockup.svg"
            alt="Artemis BioLabs"
            className={`h-8 md:h-11 w-auto transition-all duration-300 ${
              saluting ? "scale-105 [filter:drop-shadow(0_0_9px_rgba(45,212,191,0.75))]" : ""
            }`}
          />
        </a>
        <div className="flex items-center gap-3 md:gap-8 text-[14.5px] text-snow">
          <div className="hidden md:flex items-center gap-8 font-medium">
            {NAV.map(([href, label]) => (
              <a key={href} href={href} className="whitespace-nowrap hover:text-violet focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet rounded-sm transition-colors">
                {label}
              </a>
            ))}
          </div>
          <a
            href={BOOKING}
            target="_blank"
            rel="noreferrer"
            className="rounded-[3px] border border-snow/50 px-4 py-1.5 text-snow hover:border-violet hover:bg-violet/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet transition-all whitespace-nowrap"
          >
            Book a call
          </a>
          <FounderLock />
          <details className="relative md:hidden">
            <summary className="list-none cursor-pointer rounded-[3px] border border-snow/50 px-3 py-1.5 text-snow select-none" aria-label="Open navigation menu">
              Menu
            </summary>
            <div className="absolute right-0 top-11 z-50 w-44 rounded-[4px] border border-line bg-panel shadow-xl p-2 flex flex-col">
              {NAV.map(([href, label]) => (
                <a key={href} href={href} className="px-3 py-2 rounded-sm hover:bg-ink-2 text-snow">{label}</a>
              ))}
              <a href="#contact" className="px-3 py-2 rounded-sm hover:bg-ink-2 text-violet font-medium">Work with us</a>
            </div>
          </details>
        </div>
      </nav>

      {/* typography settles into focus once the shot lands */}
      <motion.div
        style={{ opacity: fade }}
        className="relative z-10 flex-1 flex flex-col items-center justify-end px-6 pb-[7vh] text-center pointer-events-none"
      >
        <div className="relative max-w-3xl mx-auto">
          <div
            className="absolute -inset-x-24 -inset-y-10 -z-10"
            style={{ background: "radial-gradient(ellipse at center, rgba(9,10,11,0.82) 30%, transparent 72%)" }}
            aria-hidden
          />
          <motion.p {...settle} className="font-mono text-[11.5px] tracking-[0.32em] uppercase text-[#2DD4BF] mb-5">
            <Decode text="BIOINFORMATICS, REIMAGINED" delay={reduced ? 0 : SETTLE * 1000 + 100} />
          </motion.p>
          <motion.h1
            {...settle}
            className="text-[2.4rem] leading-[1.08] sm:text-5xl xl:text-[4.2rem] font-normal tracking-tight text-[#F3EFE6]"
            style={{ fontFamily: "'New York', ui-serif, Georgia, 'Times New Roman', serif" }}
          >
            What if your data were delivered alive?
          </motion.h1>
          <motion.p {...settle} className="mt-6 max-w-2xl mx-auto text-base md:text-lg text-[#F3EFE6]/75 leading-relaxed font-light">
            A living, breathing portal built for inquiry across your entire team. Spatial,
            single-cell, and multi-omic analysis — delivered as an interactive scientific
            instrument, not a static PDF.
          </motion.p>

          <motion.div {...settle} className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto">
            <a
              href="#contact"
              className="w-full sm:w-auto rounded-[3px] bg-[#F3EFE6] text-[#090A0B] px-7 py-3.5 text-sm font-medium hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet transition-colors"
            >
              Submit a biological challenge →
            </a>
            <a
              href={BOOKING}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto rounded-[3px] border border-snow/25 bg-[#090A0B]/70 backdrop-blur-sm px-7 py-3.5 text-sm text-snow hover:border-violet focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet transition-all"
            >
              Book a 30-min call
            </a>
          </motion.div>

          <motion.p {...settle} className="mt-4 font-mono text-[12px] text-dim">
            Send a raw dataset or an unsolved question — we reply with a scoped pipeline and an interactive prototype.
          </motion.p>

          <motion.p {...settle} className="mt-5 text-[13px] text-[#F3EFE6]/60 pointer-events-auto">
            <span className="text-[#2DD4BF]">●</span> 3.9M cells, one mouse brain.{" "}
            <a href="live/brain/index.html" className="text-snow underline decoration-[#2DD4BF]/50 underline-offset-4 hover:decoration-[#2DD4BF] transition-colors">
              Explore it live →
            </a>
            <span className="text-[#F3EFE6]/40"> · Built on peer-reviewed methods.</span>
          </motion.p>
        </div>
      </motion.div>

      <div className="relative z-10 md:hidden flex justify-center gap-5 pb-3 text-[13px] text-dim">
        <a href="#pipeline" className="hover:text-snow">Pipeline</a>
        <a href="#gallery" className="hover:text-snow">Demo</a>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: reduced ? 0 : [0, 8, 0] }}
        transition={reduced ? { duration: 0 } : { opacity: { delay: SETTLE + 0.6 }, y: { repeat: Infinity, duration: 2.2 } }}
        className="relative z-10 pb-5 text-center text-dim text-xl"
        aria-hidden
      >
        ↓
      </motion.div>
    </section>
  );
}
