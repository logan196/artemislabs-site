"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/**
 * Option B, the editorial treatment.
 *
 * Where Option A halftones the section into an instrument readout, this one
 * leaves it photographic and grades it. The H&E stays a photograph of real
 * tissue; a mix-blend-mode: color pass pulls its magenta into the brand's
 * teal-indigo without touching luminance, so the specimen's own structure
 * still carries the image. Type is a serif display against mono figure
 * labels, an editorial voice rather than a technical one.
 *
 * Layout is asymmetric and left-aligned on purpose: a centred stack of
 * decreasing type sizes is the shape every generated hero has.
 */

const SRC = "/dejong/AT14-BRA-4-FO-2_1_he.jpg";

const MARKERS = [
  { x: 0.30, y: 0.26, label: "tumour core" },
  { x: 0.64, y: 0.44, label: "infiltrating margin" },
  { x: 0.42, y: 0.74, label: "necrosis" },
];

export default function HeroEditorial() {
  const ref = useRef(null);
  const shouldReduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", shouldReduce ? "0%" : "14%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[94svh] overflow-clip">
      {/* the specimen, graded rather than redrawn */}
      <motion.div style={{ y: imgY }} className="absolute inset-0 z-0">
        <img
          src={SRC}
          alt=""
          aria-hidden
          className="h-full w-full object-cover object-[50%_28%] opacity-100 contrast-[1.15] saturate-[1.1]"
        />
        {/* colour-only blend: hue and chroma are replaced, luminance survives,
            so the tissue's structure is untouched */}
        <div
          className="absolute inset-0 mix-blend-color"
          style={{ background: "linear-gradient(145deg,#0d3b4f 0%,#14b8a6 45%,#1b2a6b 100%)" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(7,6,11,0.93)_0%,rgba(7,6,11,0.62)_40%,rgba(7,6,11,0.08)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(7,6,11,0.92)_0%,transparent_30%)]" />
      </motion.div>

      {MARKERS.map((m, i) => (
        <motion.div
          key={m.label}
          initial={shouldReduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={shouldReduce ? { duration: 0 } : { duration: 0.6, delay: 0.9 + i * 0.16 }}
          className="pointer-events-none absolute z-10 hidden md:flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#9db3b8]"
          style={{ left: `${m.x * 100}%`, top: `${m.y * 100}%` }}
          aria-hidden
        >
          <span className="block h-[9px] w-[9px] rounded-full border border-violet/90" />
          {m.label}
        </motion.div>
      ))}

      <motion.div
        style={{ opacity: fade }}
        className="relative z-20 flex min-h-[94svh] flex-col justify-center px-6 md:px-14"
      >
        <motion.p
          initial={shouldReduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduce ? { duration: 0 } : { duration: 0.7, delay: 0.15 }}
          className="font-mono text-[11px] uppercase tracking-[0.34em] text-violet"
        >
          Artemis BioLabs
        </motion.p>

        <motion.h1
          initial={shouldReduce ? false : { opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            shouldReduce ? { duration: 0 } : { type: "spring", stiffness: 58, damping: 17, mass: 1.1, delay: 0.3 }
          }
          className="mt-5 max-w-[16ch] text-[clamp(2.9rem,8.2vw,7.6rem)] leading-[0.94] tracking-[-0.02em] text-snow"
          style={{ fontFamily: "var(--font-editorial), ui-serif, Georgia, serif" }}
        >
          We read the tissue
          <span className="block italic text-violet">your core can&rsquo;t.</span>
        </motion.h1>

        <motion.p
          initial={shouldReduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduce ? { duration: 0 } : { duration: 0.8, delay: 0.62 }}
          className="mt-8 max-w-[46ch] text-lg leading-relaxed text-snow/85 md:text-xl"
        >
          Spatial and single-cell analysis run by computational biologists, every figure reproducible, every call traceable to the data that made it.
        </motion.p>

        <motion.div
          initial={shouldReduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduce ? { duration: 0 } : { duration: 0.8, delay: 0.78 }}
          className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
        >
          <a
            href="#contact"
            className="rounded-[3px] bg-violet-deep px-7 py-3 font-medium text-ink transition-colors hover:bg-violet"
          >
            Book a demo
          </a>
          <span className="font-mono text-[12.5px] text-dim">The first analysis is on us.</span>
        </motion.div>
      </motion.div>

      <div className="pointer-events-none absolute bottom-5 right-5 z-20 hidden text-right font-mono text-[10.5px] leading-relaxed tracking-[0.1em] text-[#93a7ad] sm:block">
        AT14-BRA-4-FO-2_1 &middot; glioblastoma &middot; H&amp;E
        <br />
        de Jong et al. 2026 &middot; gbmspace.org
      </div>
    </section>
  );
}
