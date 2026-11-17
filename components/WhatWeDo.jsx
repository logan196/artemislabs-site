"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";

const SOURCES = ["GEO", "SRA", "gbmspace.org", "Allen MERFISH", "ENCODE"];

const BARS = [
  { name: "BANKSY", nmi: 0.37, swatch: "#56B4E9" },
  { name: "Position-only clustering", nmi: 0.14, swatch: "#E69F00" },
];

const TILES = [
  {
    k: "Ingest",
    t: "The GEO ledger",
    d: "300,683 public studies and 8,836,174 samples in NCBI GEO, counted 13 Nov 2026.",
  },
  {
    k: "Ingest",
    t: "Spatial series",
    d: "2,198 GEO series tagged spatial transcriptomics — the pool a new section is read against.",
  },
  {
    k: "Benchmark",
    t: "Same question, two methods",
    d: "On AT4-FO-2, BANKSY and position-only clustering are scored on the authors’ hypoxia zones.",
  },
  {
    k: "Benchmark",
    t: "Your cohort, beside theirs",
    d: "A public run and yours, same plots. The comparison is scoped with you — this page does not invent a score.",
  },
];

function IngestStage() {
  const reduced = useReducedMotion();
  return (
    <div className="relative h-[280px] mt-6" aria-hidden={reduced ? undefined : true}>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 h-28 w-28 rounded-full border border-violet/50 bg-violet/10 flex items-center justify-center">
        <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-violet text-center leading-tight">into the<br />portal</span>
        {!reduced && <span className="ingest-ring" />}
      </div>
      {SOURCES.map((name, i) => (
        <motion.span
          key={name}
          className="absolute left-0 font-mono text-[12px] text-[#f7f4ea] border border-white/15 bg-black/50 rounded-full px-3 py-1"
          style={{ top: 16 + i * 50 }}
          animate={reduced ? undefined : { x: [0, 150, 230], opacity: [0, 1, 0] }}
          transition={reduced ? undefined : { duration: 3.4, delay: i * 0.45, repeat: Infinity, ease: "easeInOut" }}
        >
          {name}
        </motion.span>
      ))}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 280" preserveAspectRatio="none">
        {SOURCES.map((_, i) => (
          <line key={i} x1="70" y1={28 + i * 50} x2="300" y2="140" stroke="rgba(95,201,184,0.35)" strokeDasharray="4 6" />
        ))}
      </svg>
      {reduced && (
        <p className="sr-only">
          Public sources GEO, SRA, gbmspace.org, Allen MERFISH and ENCODE feed the portal.
        </p>
      )}
    </div>
  );
}

function BenchStage() {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const [on, setOn] = useState(!!reduced);
  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setOn(true); io.disconnect(); }
    }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);
  return (
    <div ref={ref} className="mt-6 space-y-5">
      {BARS.map((b) => (
        <div key={b.name}>
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[15px] text-[#f7f4ea]">{b.name}</p>
            <p className="font-mono text-[13px] text-violet tabular-nums">NMI {b.nmi.toFixed(2)}</p>
          </div>
          <div className="mt-2 h-3 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-[1400ms] ease-out"
              style={{ width: on ? `${(b.nmi / 0.5) * 100}%` : "0%", background: b.swatch }}
            />
          </div>
        </div>
      ))}
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[15px] text-[#f7f4ea]">Your method</p>
          <p className="font-mono text-[12px] text-dim">not scored here</p>
        </div>
        <div className="mt-2 h-3 rounded-full border border-dashed border-white/25" />
      </div>
      <p className="text-[13px] text-dim leading-relaxed">
        AT4-FO-2, 126,738 cells. BANKSY NMI 0.37 versus 0.14 for position-only clustering,
        against the authors’ hypoxia zones — the same comparison as the glioblastoma figure.
      </p>
    </div>
  );
}

export default function WhatWeDo() {
  return (
    <section id="whatwedo" className="relative px-6 md:px-14 py-20 md:py-28 max-w-7xl mx-auto">
      <Reveal>
        <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-violet">What we do</p>
        <h2 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl">
          Public NIH data in. <span className="text-violet">A benchmark back.</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-[#f7f4ea] leading-relaxed">
          Two jobs sit at the center of the work. We ingest the public NIH record your
          question already lives in, and we benchmark the method against that record
          before another section is cut.
        </p>
      </Reveal>

      <div className="grid lg:grid-cols-2 gap-5 mt-12">
        <Reveal>
          <article className="h-full rounded-[8px] border border-line bg-panel/80 p-6 md:p-7 overflow-hidden">
            <p className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-violet">Ingestion</p>
            <h3 className="mt-2 text-2xl text-[#f7f4ea]" style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
              Public NIH data, into the portal
            </h3>
            <p className="mt-3 text-[15px] text-dim leading-relaxed">
              GEO and SRA, plus the spatial cohorts already open on this site — Ren et al.
              2023, de Jong et al. 2026, the Allen whole-mouse MERFISH atlas. Packets in
              the animation are those sources, streaming toward one portal.
            </p>
            <IngestStage />
          </article>
        </Reveal>
        <Reveal delay={0.08}>
          <article className="h-full rounded-[8px] border border-line bg-panel/80 p-6 md:p-7">
            <p className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-violet">Benchmarking</p>
            <h3 className="mt-2 text-2xl text-[#f7f4ea]" style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
              Methods on the same footing
            </h3>
            <p className="mt-3 text-[15px] text-dim leading-relaxed">
              The bars are the hypoxia agreement already reported for AT4-FO-2. They are
              not a general leaderboard, and the empty row is intentional: your method is
              scored on your cohort, not invented on the homepage.
            </p>
            <BenchStage />
          </article>
        </Reveal>
      </div>

      <Reveal delay={0.05}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {TILES.map((c) => (
            <div key={c.t} className="lift-card rounded-[4px] border border-line bg-panel/70 p-5">
              <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-violet">{c.k}</p>
              <p className="mt-2 font-medium text-[17px] text-[#f7f4ea]">{c.t}</p>
              <p className="text-dim text-[14.5px] mt-1.5 leading-relaxed">{c.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-[13px] text-dim">
          GEO counts via NCBI eutils, accessed 2026-11-13.{" "}
          <a href="mailto:lbeharry@alumni.caltech.edu?subject=Artemis%20BioLabs%20%C2%B7%20NIH%20ingest" className="text-violet hover:text-snow underline underline-offset-4 transition-colors">
            Ask about an ingest →
          </a>
        </p>
      </Reveal>
    </section>
  );
}
