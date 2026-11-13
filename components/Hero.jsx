"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Dodecahedron from "./Dodecahedron";

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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,#050d0e_75%)]" />
        {/* spot grid suggestion */}
        <div className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(circle_at_center,#2dd4bf_1px,transparent_1px)] [background-size:34px_34px]" />
      </motion.div>

      <nav className="flex items-center justify-between px-6 md:px-14 py-5">
        <img src="artemis_logo_white.svg" alt="Artemis Labs" className="h-5 md:h-6" />
        <div className="flex items-center gap-8 text-sm text-dim">
          <div className="hidden md:flex items-center gap-8">
            <a href="#pipeline" className="hover:text-snow transition-colors">Pipeline</a>
            <a href="#banksy" className="hover:text-snow transition-colors">BANKSY</a>
            <a href="#gallery" className="hover:text-snow transition-colors">Glioblastoma</a>
            <a href="#copilot" className="hover:text-snow transition-colors">Local copilot</a>
            <a href="#contact" className="rounded-full border border-line px-4 py-1.5 text-snow hover:border-violet hover:bg-violet/10 transition-all">
              Work with us
            </a>
          </div>
          <Dodecahedron size={64} />
        </div>
      </nav>

      <motion.div style={{ opacity: fade }} className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.21, 0.6, 0.27, 1] }}
          className="mb-8"
        >
          <img src="artemis_icon.svg" alt="" className="h-16 w-16 rounded-2xl glow-ring" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.21, 0.6, 0.27, 1] }}
          className="max-w-4xl text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05]"
        >
          Drop in a dataset.<br />
          <span className="text-gradient">Get a living atlas.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="mt-6 max-w-2xl text-lg md:text-xl text-dim leading-relaxed"
        >
          Artemis Labs turns raw spatial transcriptomics — Visium, Xenium, CODEX — into
          interactive Vitessce portals with spatially-aware BANKSY clustering, expert
          cell-state annotation, and an AI copilot that runs entirely on your machine.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.45 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
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
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-12 font-mono text-xs text-dim/70"
        >
          $ artemis run --input tumor.h5ad --tissue-context glioblastoma
        </motion.p>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.2 }}
        className="pb-8 text-center text-dim/60 text-xl"
        aria-hidden
      >
        ↓
      </motion.div>
    </section>
  );
}
