"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Dodecahedron from "./Dodecahedron";
import FounderLock from "./FounderLock";

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[100svh] flex flex-col overflow-hidden">
      {/* aurora background */}
      <motion.div style={{ y: yBg }} className="absolute inset-0 -z-10">
        <div className="aurora absolute -top-1/4 left-1/2 h-[80vh] w-[80vw] -translate-x-1/2 rounded-full bg-violet-deep/30 blur-[140px]" />
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
            className="rounded-full border border-line px-4 py-1.5 text-snow hover:border-violet hover:bg-violet/10 transition-all whitespace-nowrap"
          >
            Work with us
          </a>
          <FounderLock />
          <Dodecahedron size={56} />
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
            <span className="text-gradient">Get a living atlas.</span>
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
            <a href="#gallery" className="rounded-full bg-violet-deep px-7 py-3 font-medium hover:bg-violet transition-colors glow-ring">
              See the glioblastoma demo
            </a>
            <a href="#pipeline" className="rounded-full border border-line px-7 py-3 text-dim hover:text-snow hover:border-violet/60 transition-all">
              How it works
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

        <motion.a
          href="#gallery"
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.3, ease: [0.21, 0.6, 0.27, 1] }}
          className="relative block rounded-3xl overflow-hidden border border-line glow-ring max-h-[62vh]"
          title="GBM1 — BANKSY cell states on the H&E section"
        >
          <img
            src="gbm/GBM1_overlay.jpg"
            alt="Glioblastoma Visium section: H&E histology with BANKSY cell states overlaid"
            className="w-full h-full object-cover object-top"
          />
          <span className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-ink/90 to-transparent px-5 pt-10 pb-4 font-mono text-[12px] text-snow/90">
            GBM1 · BANKSY cell states on H&E · annotated by a local LLM
          </span>
        </motion.a>
      </motion.div>

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
