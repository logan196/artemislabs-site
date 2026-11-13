"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Dodecahedron from "./Dodecahedron";
import FounderLock from "./FounderLock";

// The hero figure is alive: raw H&E ⇄ annotated overlay, the analysis
// happening in front of the reader.
function LivingFigure() {
  const [annotated, setAnnotated] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAnnotated(true);
      return;
    }
    const t0 = setTimeout(() => setAnnotated(true), 2200);
    const iv = setInterval(() => setAnnotated((a) => !a), 4600);
    return () => { clearTimeout(t0); clearInterval(iv); };
  }, []);
  return (
    <motion.figure
      initial={{ opacity: 0, scale: 0.97, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1.1, delay: 0.3, ease: [0.21, 0.6, 0.27, 1] }}
      className="rounded-[4px] overflow-hidden border border-snow/60 shadow-[0_18px_50px_-22px_rgba(28,26,21,0.4)] bg-panel"
    >
      <a href="#gallery" title="GBM2 — the pipeline annotating a section" className="relative block aspect-[4/3.4] overflow-hidden">
        <img
          src="gbm/GBM2_he.jpg"
          alt="Glioblastoma Visium section, H&E histology"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <img
          src="gbm/GBM2_overlay.jpg"
          alt="The same section with BANKSY cell states overlaid"
          className="absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-[1800ms] ease-in-out"
          style={{ opacity: annotated ? 1 : 0 }}
        />
      </a>
      <figcaption className="border-t border-line bg-panel px-5 py-3 text-[13px] text-dim leading-relaxed">
        <span className="font-semibold text-snow">Fig. 1&nbsp;|</span>{" "}
        {annotated
          ? "The same section, annotated — BANKSY domains + LLM cell states."
          : "GBM2 · H&E histology, as the slide arrives."}
      </figcaption>
    </motion.figure>
  );
}

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[100svh] flex flex-col overflow-hidden">
      {/* aurora background */}
      <motion.div style={{ y: yBg }} className="absolute inset-0 -z-10">
        <div className="aurora absolute -top-1/4 left-1/2 h-[80vh] w-[80vw] -translate-x-1/2 rounded-full bg-violet-deep/15 blur-[140px]" />
        <div className="aurora absolute top-1/3 -left-40 h-[50vh] w-[40vw] rounded-full bg-magma/15 blur-[120px] [animation-delay:-9s]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,#f7f4ec_78%)]" />
        {/* spot grid suggestion */}
        <div className="absolute inset-0 opacity-[0.16] bg-[radial-gradient(circle_at_center,#0f766e_1px,transparent_1px)] [background-size:34px_34px]" />
      </motion.div>

      <nav className="flex items-center justify-between px-6 md:px-14 py-5">
        <a href="#" className="flex items-center gap-3">
          <img src="artemis_mark.svg" alt="" className="h-9 md:h-10" />
          <span className="leading-none">
            <span className="block font-semibold tracking-[0.18em] text-[17px]">ARTEMIS</span>
            <span className="block font-mono text-[10px] tracking-[0.42em] text-violet mt-1">BIOLABS</span>
          </span>
        </a>
        <div className="flex items-center gap-4 md:gap-8 text-sm text-dim">
          <div className="hidden md:flex items-center gap-8">
            <a href="#pipeline" className="hover:text-snow transition-colors">Pipeline</a>
            <a href="#banksy" className="hover:text-snow transition-colors">BANKSY</a>
            <a href="#gallery" className="hover:text-snow transition-colors">Glioblastoma</a>
            <a href="#copilot" className="hover:text-snow transition-colors">Copilot</a>
          </div>
          <a
            href="#contact"
            className="rounded-[3px] border border-snow/50 px-4 py-1.5 text-snow hover:border-violet hover:bg-violet/10 transition-all whitespace-nowrap"
          >
            Work with us
          </a>
          <FounderLock />
          <span className="hidden md:block">
            <Dodecahedron size={56} />
          </span>
        </div>
      </nav>

      <motion.div
        style={{ opacity: fade }}
        className="flex-1 grid lg:grid-cols-[1.05fr_1fr] items-center gap-10 px-6 md:px-14 max-w-7xl mx-auto w-full py-10"
      >
        <div className="text-center lg:text-left">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.21, 0.6, 0.27, 1] }}
            className="text-[2.6rem] leading-[1.05] sm:text-6xl xl:text-7xl font-semibold tracking-tight"
          >
            Drop in a dataset.<br />
            <span className="text-violet">Get a living atlas.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25 }}
            className="mt-6 max-w-xl mx-auto lg:mx-0 text-lg md:text-xl text-dim leading-relaxed"
          >
            Artemis BioLabs turns raw spatial transcriptomics into interactive atlases your
            whole lab can explore — with an AI copilot that can run entirely on your machine.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-4 font-mono text-[13px] text-dim"
          >
            Visium · Xenium · CODEX → BANKSY → annotated Vitessce portal
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5 }}
            className="mt-9 flex flex-col sm:flex-row items-center lg:items-start gap-4"
          >
            <a
              href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0FzlJl55WV52jaH-JEG8_xJLO5YLd20t2ksXikjwMfGnVQ-zLI4XUCAmHTFiLE1tnQgAIxBhjW"
              target="_blank"
              rel="noreferrer"
              className="rounded-[3px] bg-violet-deep text-ink px-7 py-3 font-medium hover:bg-violet transition-colors"
            >
              Book a demo
            </a>
            <a href="#gallery" className="rounded-[3px] border border-snow/50 px-7 py-3 text-dim hover:text-snow hover:border-violet transition-all">
              See the glioblastoma demo
            </a>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 1 }}
            className="hidden sm:block mt-10 font-mono text-[13px] text-dim whitespace-nowrap overflow-x-auto"
          >
            $ python run_pipeline.py --input tumor.h5ad --tissue-context glioblastoma
          </motion.p>
        </div>

        <LivingFigure />
      </motion.div>

      {/* mobile section nav — the md:flex links vanish on phones */}
      <div className="md:hidden flex justify-center gap-5 pb-3 text-[13px] text-dim">
        <a href="#pipeline" className="underline-offset-4 hover:text-snow">Pipeline</a>
        <a href="#banksy" className="underline-offset-4 hover:text-snow">BANKSY</a>
        <a href="#gallery" className="underline-offset-4 hover:text-snow">Demo</a>
        <a href="#catalog" className="underline-offset-4 hover:text-snow">Catalog</a>
      </div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.2 }}
        className="pb-6 text-center text-dim text-xl"
        aria-hidden
      >
        ↓
      </motion.div>
    </section>
  );
}
