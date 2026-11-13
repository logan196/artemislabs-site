"use client";

import { motion } from "framer-motion";
import Reveal from "./Reveal";

// All counts real: NCBI GEO eutils esearch, accessed 2026-11-13.
// gse[entry type] = 300,683 · gsm[entry type] = 8,836,174 ·
// "spatial transcriptomics" AND gse[entry type] = 2,198.
const STATS = [
  ["300,683", "public studies in NCBI GEO"],
  ["8,836,174", "deposited samples"],
  ["2,198", "spatial-transcriptomics series"],
];

// The public studies actually live on this page right now.
const ORBIT = [
  "GSE194329 · Ren 2023",
  "10x Parent Visium",
  "gbmspace.org · de Jong 2026",
  "Eng 2019 · mouse seqFISH+",
  "Yao 2023 · mouse · 3.9M cells",
  "ENCODE",
];

export default function BenchmarkSection() {
  return (
    <section id="benchmark" className="relative px-6 md:px-14 py-28 md:py-36 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-14 items-center">
        <Reveal>
          <p className="font-mono text-sm text-violet mb-4">09 · ARTEMIS BENCHMARKING</p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Optimize your next experiment <span className="text-violet">before you run it.</span>
          </h2>
          <p className="mt-6 text-lg text-dim leading-relaxed max-w-xl">
            The NIH&rsquo;s archives already hold millions of samples like yours. Before you
            commit a single section, we mine them — which markers to panel, which regions to
            expect, how many samples you actually need. Then your run lands beside the public
            cohorts that matter: <span className="text-snow">same pipeline, same plots, your
            tissue against the world&rsquo;s.</span>
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {STATS.map(([n, label]) => (
              <div key={label} className="rounded-[4px] border border-line bg-panel/80 px-4 py-3">
                <p className="font-mono text-xl md:text-2xl font-semibold text-violet tabular-nums">{n}</p>
                <p className="mt-1 text-[12.5px] text-dim leading-snug">{label}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 font-mono text-[11.5px] text-dim">
            NCBI GEO, queried via eutils · accessed 2026-11-13
          </p>
        </Reveal>

        <Reveal delay={0.1} className="relative h-[380px]" aria-label="Your dataset connected to public cohorts">
          {/* your run, centered */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 rounded-[4px] bg-violet-deep text-ink font-mono text-[13px] px-4 py-2.5 shadow-lg">
            your_run.h5ad
          </div>
          {/* public studies around the run — every chip is a study live on this page */}
          {ORBIT.map((label, i) => {
            const ang = (i / ORBIT.length) * Math.PI * 2 - Math.PI / 2;
            return (
              <motion.div
                key={label}
                className="absolute -translate-x-1/2 -translate-y-1/2 font-mono text-[11.5px] text-dim border border-line bg-panel rounded-full px-3 py-1.5 whitespace-nowrap shadow-sm"
                style={{ left: `${50 + Math.cos(ang) * 38}%`, top: `${50 + Math.sin(ang) * 36}%` }}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.12 * i, duration: 0.5 }}
              >
                {label}
              </motion.div>
            );
          })}
          {/* connection lines */}
          <svg className="absolute inset-0 w-full h-full" aria-hidden>
            {ORBIT.map((label, i) => {
              const ang = (i / ORBIT.length) * Math.PI * 2 - Math.PI / 2;
              return (
                <motion.line
                  key={label}
                  x1="50%" y1="50%"
                  x2={`${50 + Math.cos(ang) * 38}%`}
                  y2={`${50 + Math.sin(ang) * 36}%`}
                  stroke="#0f766e" strokeWidth="1" strokeDasharray="3 5"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 0.45 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 * i, duration: 0.6 }}
                />
              );
            })}
          </svg>
          <p className="absolute bottom-0 inset-x-0 text-center text-[12.5px] text-dim">
            Every chip above is a public study already live on this page.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
