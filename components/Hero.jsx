"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import BioDodecahedron from "./BioDodecahedron";
import FounderLock from "./FounderLock";
import Decode from "./Decode";

const BOOKING =
  "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0FzlJl55WV52jaH-JEG8_xJLO5YLd20t2ksXikjwMfGnVQ-zLI4XUCAmHTFiLE1tnQgAIxBhjW";

const NAV = [
  ["#banksy", "BANKSY"],
  ["#pipeline", "Pipeline"],
  ["#gallery", "Glioblastoma"],
  ["#whatwedo", "What we do"],
  ["#benchmark", "Benchmarking"],
];

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

  return (
    <section ref={ref} className="relative min-h-[100svh] flex flex-col overflow-hidden">
      <a
        href="#pipeline"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:bg-panel focus:border focus:border-violet focus:px-3 focus:py-1.5 focus:rounded-[3px]"
      >
        Skip to content
      </a>
      <div className="absolute inset-0 -z-10">
        <div className="aurora absolute -top-1/4 left-1/2 h-[80vh] w-[80vw] -translate-x-1/2 rounded-full bg-violet-deep/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,#f7f4ec_78%)]" />
      </div>

      <nav className="flex items-center justify-between px-5 md:px-14 py-4 md:py-5">
        <a href="#" aria-label="Artemis BioLabs — top of page">
          <img src="artemis_lockup.svg" alt="Artemis BioLabs" className="h-8 md:h-11 w-auto" />
        </a>
        <div className="flex items-center gap-3 md:gap-8 text-[14.5px] text-snow">
          <div className="hidden md:flex items-center gap-8 font-medium">
            {NAV.map(([href, label]) => (
              <a key={href} href={href} className="hover:text-violet focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet rounded-sm transition-colors">
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
            Book a demo
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

      {/* THE OPENING: the moving dodecahedron introduces the company */}
      <motion.div style={{ opacity: fade }} className="flex-1 flex flex-col items-center justify-center px-6 text-center relative">
        <motion.div style={{ scale }} className="relative w-full max-w-[560px] -mb-10 md:-mb-14" aria-hidden>
          <BioDodecahedron size={400} labels={false} helix />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.21, 0.6, 0.27, 1] }}
          className="relative"
        >
          <h1
            className="text-[2.5rem] leading-[1.04] sm:text-6xl xl:text-[5rem] font-semibold tracking-[0.015em]"
            style={{ fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif" }}
          >
            <Decode text="ARTEMIS" delay={500} />{" "}
            <Decode text="BIOLABS" delay={1200} className="text-violet" />
          </h1>
          <p className="mt-4 font-mono text-[13px] tracking-[0.35em] text-dim uppercase">
            computational biology, accelerated.
          </p>
          <p className="mt-6 max-w-xl mx-auto text-lg md:text-xl text-snow leading-relaxed">
            Every core your biotech would build or rent.
            <br className="hidden sm:block" />
            <span className="text-dim"> One AI-powered team.</span>
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={BOOKING}
              target="_blank"
              rel="noreferrer"
              className="rounded-[3px] bg-violet-deep text-ink px-7 py-3 font-medium hover:bg-violet focus-visible:outline focus-visible:outline-2 focus-visible:outline-snow transition-colors"
            >
              Book a demo
            </a>
            <a
              href="live/brain/index.html"
              target="_blank"
              rel="noreferrer"
              className="rounded-[3px] border border-snow/50 px-7 py-3 text-dim hover:text-snow hover:border-violet focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet transition-all"
            >
              3.9M cells, one mouse brain — explore it live →
            </a>
          </div>
          <p className="mt-4 font-mono text-[12.5px] text-dim">
            The first analysis is on us.
          </p>
        </motion.div>
      </motion.div>

      <div className="md:hidden flex justify-center gap-5 pb-3 text-[13px] text-dim">
        <a href="#pipeline" className="hover:text-snow">Pipeline</a>
        <a href="#gallery" className="hover:text-snow">Demo</a>
        <a href="#benchmark" className="hover:text-snow">Benchmarking</a>
      </div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.2 }}
        className="pb-5 text-center text-dim text-xl"
        aria-hidden
      >
        ↓
      </motion.div>
    </section>
  );
}
