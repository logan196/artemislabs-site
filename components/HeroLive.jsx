"use client";

import { motion, useReducedMotion } from "framer-motion";
import HeroAnalysis from "./HeroAnalysis";

/**
 * Option C, the hero is the work.
 *
 * The claim on the left is the one the data on the right actually supports,
 * and it is the lab's own hard case: GFAP stains reactive astrocytes and
 * astrocyte-like tumour the same, so a marker panel blurs them. The figure
 * shows that being undone on a real section.
 */
export default function HeroLive() {
  const shouldReduce = useReducedMotion();
  const step = (d) =>
    shouldReduce ? { duration: 0 } : { duration: 0.75, delay: d, ease: [0.21, 0.6, 0.27, 1] };
  const from = shouldReduce ? false : { opacity: 0, y: 16 };

  return (
    <section className="relative min-h-[94svh] overflow-clip">
      <div className="absolute inset-0 z-0">
        <HeroAnalysis className="absolute inset-0 h-full w-full" />
      </div>

      <div className="relative z-10 flex min-h-[94svh] flex-col justify-center px-6 md:px-14 lg:max-w-[52%]">
        <motion.p
          initial={from}
          animate={{ opacity: 1, y: 0 }}
          transition={step(0.1)}
          className="font-mono text-[11px] uppercase tracking-[0.32em] text-violet"
        >
          Artemis BioLabs
        </motion.p>

        <motion.h1
          initial={from}
          animate={{ opacity: 1, y: 0 }}
          transition={step(0.25)}
          className="mt-5 max-w-[15ch] text-[clamp(2.5rem,5.6vw,4.6rem)] font-semibold leading-[0.98] tracking-[-0.03em] text-snow"
        >
          We separate what your markers can&rsquo;t.
        </motion.h1>

        <motion.p
          initial={from}
          animate={{ opacity: 1, y: 0 }}
          transition={step(0.45)}
          className="mt-7 max-w-[52ch] text-[17px] leading-relaxed text-snow/80 md:text-lg"
        >
          GFAP lights up reactive astrocytes and astrocyte-like tumour alike, a marker
          panel reads them as one blur. Beside this, that section is being pulled apart
          into its domains, live, on the data itself.
        </motion.p>

        <motion.div
          initial={from}
          animate={{ opacity: 1, y: 0 }}
          transition={step(0.6)}
          className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
        >
          <a
            href="#contact"
            className="rounded-[3px] bg-violet-deep px-7 py-3 font-medium text-ink transition-colors hover:bg-violet"
          >
            Send us a section
          </a>
          <span className="font-mono text-[12.5px] text-dim">The first analysis is on us.</span>
        </motion.div>
      </div>
    </section>
  );
}
