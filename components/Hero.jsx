"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import FounderLock from "./FounderLock";
import TickField from "./TickField";
import SplitText from "./SplitText";

const BOOKING =
  "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0FzlJl55WV52jaH-JEG8_xJLO5YLd20t2ksXikjwMfGnVQ-zLI4XUCAmHTFiLE1tnQgAIxBhjW";

const NAV = [
  ["#banksy", "BANKSY"],
  ["#pipeline", "Pipeline"],
  ["#gallery", "Glioblastoma"],
  ["#whatwedo", "What we do"],
];

/**
 * Callouts pinned into the tissue scene, each anchored near a niche centre in
 * TickField. They name what actually happens to the sample, in pipeline order,
 * so the hero reads as an annotated figure rather than decoration.
 */
const CALLOUTS = [
  { x: 0.185, y: 0.235, label: "Segment cells", at: 0.80 },
  { x: 0.625, y: 0.175, label: "Call spatial niches", at: 0.95 },
  { x: 0.135, y: 0.66, label: "Annotate cell states", at: 1.10 },
  { x: 0.70, y: 0.70, label: "Map expression gradients", at: 1.25 },
];

export default function Hero() {
  const ref = useRef(null);
  const [saluting, setSaluting] = useState(false);
  const [lit, setLit] = useState(false);
  // initial={false} tells framer-motion to mount at the animate values, so a
  // reduced-motion visitor gets the finished hero instead of a moving one.
  const shouldReduce = useReducedMotion();
  const saluteTimer = useRef(null);

  useEffect(() => () => clearTimeout(saluteTimer.current), []);

  // the field sweeps in first; type and callouts follow it
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => setLit(true), reduced ? 0 : 300);
    return () => clearTimeout(t);
  }, []);

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
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const fieldFade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  // Scroll-coupled translation is the classic vestibular trigger (WCAG 2.3.3);
  // every other animation here honors the setting, so this must too.
  const fieldLift = useTransform(scrollYProgress, [0, 1], [0, shouldReduce ? 0 : -60]);

  return (
    <section ref={ref} className="relative min-h-[92svh] md:min-h-[96svh] flex flex-col overflow-hidden">
      <a
        href="#pipeline"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:bg-panel focus:border focus:border-violet focus:px-3 focus:py-1.5 focus:rounded-[3px]"
      >
        Skip to content
      </a>

      {/* THE OPENING: a tissue section resolves out of a field of line glyphs */}
      <div className="absolute inset-0 -z-10">
        <div className="aurora absolute -top-1/4 left-1/2 h-[80vh] w-[80vw] -translate-x-1/2 rounded-full bg-violet-deep/10 blur-[140px]" />
        <motion.div style={{ opacity: fieldFade, y: fieldLift }} className="absolute inset-0">
          <TickField className="absolute inset-0 h-full w-full" />
          {CALLOUTS.map((c) => (
            <motion.div
              key={c.label}
              initial={shouldReduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={shouldReduce ? { duration: 0 } : { duration: 0.5, delay: c.at, ease: [0.21, 0.6, 0.27, 1] }}
              className="absolute hidden md:flex items-center gap-2 font-mono text-[10.5px] tracking-[0.18em] uppercase text-dim"
              style={{ left: `${c.x * 100}%`, top: `${c.y * 100}%` }}
              aria-hidden
            >
              <span className="h-[5px] w-[5px] rounded-full bg-violet shadow-[0_0_8px_rgba(20,184,166,0.9)]" />
              {c.label}
            </motion.div>
          ))}
        </motion.div>
        {/* Scrim, not a blackout: dark enough behind the headline to keep it
            legible over the densest part of the core, but transparent through
            the mid-field so the scene actually reads, with a soft rim falloff. */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(7,6,11,0.72)_0%,rgba(7,6,11,0.34)_36%,rgba(7,6,11,0.08)_62%,rgba(7,6,11,0.58)_100%)]" />
        {/* The densest part of the scene sits directly under the headline and
            tagline. A band confined to the text column protects that copy
            without flattening the rest of the field. */}
        <div className="absolute inset-x-0 top-[20%] h-[46%] bg-[linear-gradient(to_bottom,transparent_0%,rgba(7,6,11,0.58)_34%,rgba(7,6,11,0.58)_66%,transparent_100%)]" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-5 md:px-14 py-4 md:py-5">
        <a href="#" aria-label="Artemis BioLabs — top of page" onClick={salute}>
          <img
            src="artemis_lockup.svg"
            alt="Artemis BioLabs"
            className={`h-8 md:h-11 w-auto transition-all duration-300 ${
              saluting ? "scale-105 [filter:drop-shadow(0_0_9px_rgba(15,118,110,0.75))]" : ""
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

      <motion.div style={{ opacity: fade }} className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h1
          aria-label="Artemis BioLabs"
          className="text-[2.5rem] leading-[1.04] sm:text-6xl xl:text-[5.25rem] font-semibold tracking-[-0.018em]"
          style={{ fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif" }}
        >
          <SplitText text="ARTEMIS" as="span" className="inline-block" start={lit} delay={0} />{" "}
          <SplitText
            text="BIOLABS"
            as="span"
            className="inline-block text-violet"
            start={lit}
            delay={0.12}
          />
        </h1>

        <motion.p
          initial={shouldReduce ? false : { opacity: 0 }}
          animate={{ opacity: lit ? 1 : 0 }}
          transition={shouldReduce ? { duration: 0 } : { duration: 0.7, delay: 0.42 }}
          className="mt-5 font-mono text-[13px] tracking-[0.35em] text-dim uppercase"
        >
          computational biology, accelerated.
        </motion.p>

        <motion.div
          initial={shouldReduce ? false : { opacity: 0, y: 14 }}
          animate={lit ? { opacity: 1, y: 0 } : {}}
          transition={shouldReduce ? { duration: 0 } : { duration: 0.7, delay: 0.58, ease: [0.21, 0.6, 0.27, 1] }}
        >
          <p className="mt-6 max-w-xl mx-auto text-lg md:text-xl text-snow leading-relaxed">
            Every core service your lab needs.
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
          </div>
          <p className="mt-4 font-mono text-[12.5px] text-dim">
            The first analysis is on us.
          </p>
        </motion.div>
      </motion.div>

      <div className="relative z-10 md:hidden flex justify-center gap-5 pb-3 text-[13px] text-dim">
        <a href="#pipeline" className="hover:text-snow">Pipeline</a>
        <a href="#gallery" className="hover:text-snow">Demo</a>
      </div>

      <motion.div
        animate={shouldReduce ? { y: 0 } : { y: [0, 8, 0] }}
        transition={shouldReduce ? { duration: 0 } : { repeat: Infinity, duration: 2.2 }}
        className="relative z-10 pb-5 text-center text-dim text-xl"
        aria-hidden
      >
        ↓
      </motion.div>
    </section>
  );
}
