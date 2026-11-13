"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";

// All counts real: NCBI GEO eutils esearch, accessed 2026-11-13.
// gse[entry type] = 300,683 · gsm[entry type] = 8,836,174 ·
// "spatial transcriptomics" AND gse[entry type] = 2,198.
const STATS = [
  [300683, "public studies in NCBI GEO"],
  [8836174, "deposited samples"],
  [2198, "spatial-transcriptomics series"],
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

// Questions we mine the archives for — asks, not claims.
const QUERIES = [
  "how does my hypoxia program compare to Ren 2023?",
  "which markers do public GBM panels agree on?",
  "how many sections do I need to see this effect?",
];

function CountUp({ value, duration = 1400 }) {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const [n, setN] = useState(reduced ? value : 0);

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    let raf;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        obs.disconnect();
        let t0;
        const tick = (now) => {
          if (t0 === undefined) t0 = now;
          const p = Math.min(1, Math.max(0, now - t0) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setN(Math.round(value * eased));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [value, duration, reduced]);

  return (
    <span ref={ref} className="tabular-nums">
      {n.toLocaleString("en-US")}
    </span>
  );
}

function TypedQuery() {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const [text, setText] = useState(reduced ? QUERIES[0] : "");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setStarted(true);
          obs.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [reduced]);

  useEffect(() => {
    if (!started || reduced) return;
    let qi = 0;
    let ci = 0;
    let deleting = false;
    let timer;
    const step = () => {
      const q = QUERIES[qi % QUERIES.length];
      if (!deleting) {
        ci += 1;
        setText(q.slice(0, ci));
        if (ci >= q.length) {
          deleting = true;
          timer = setTimeout(step, 2400); // hold the finished question
          return;
        }
        timer = setTimeout(step, 34);
      } else {
        ci -= 3;
        if (ci <= 0) {
          ci = 0;
          deleting = false;
          qi += 1;
          setText("");
          timer = setTimeout(step, 500);
          return;
        }
        setText(q.slice(0, ci));
        timer = setTimeout(step, 14);
      }
    };
    timer = setTimeout(step, 600);
    return () => clearTimeout(timer);
  }, [started, reduced]);

  return (
    <div ref={ref} className="flex items-center gap-2 font-mono text-[12.5px] md:text-[13px]">
      <span className="text-violet shrink-0">your question ›</span>
      <span className="text-snow truncate">{text}</span>
      {!reduced && (
        <motion.span
          className="inline-block h-[14px] w-[7px] bg-violet shrink-0"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          aria-hidden
        />
      )}
    </div>
  );
}

export default function BenchmarkSection() {
  const reduced = useReducedMotion();

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
                <p className="font-mono text-xl md:text-2xl font-semibold text-violet">
                  <CountUp value={n} />
                </p>
                <p className="mt-1 text-[12.5px] text-dim leading-snug">{label}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 font-mono text-[11.5px] text-dim">
            NCBI GEO, queried via eutils · accessed 2026-11-13
          </p>
        </Reveal>

        {/* the mining console — your question goes out, public cohorts stream back in */}
        <Reveal delay={0.1}>
          <div className="rounded-[6px] border border-line bg-panel/70 overflow-hidden glow-ring">
            <div className="flex items-center gap-2 border-b border-line bg-ground/60 px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-line" aria-hidden />
              <span className="h-2.5 w-2.5 rounded-full bg-line" aria-hidden />
              <span className="h-2.5 w-2.5 rounded-full bg-line" aria-hidden />
              <span className="ml-2 font-mono text-[11.5px] text-dim">artemis · benchmark</span>
            </div>
            <div className="border-b border-line px-4 py-3">
              <TypedQuery />
            </div>

            <div className="relative h-[340px]" aria-label="Your dataset connected to public cohorts">
              {/* your run, centered */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 rounded-[4px] bg-violet-deep text-ink font-mono text-[13px] px-4 py-2.5 shadow-lg">
                your_run.h5ad
              </div>

              {/* connection lines + inbound pulses */}
              <svg className="absolute inset-0 w-full h-full" aria-hidden>
                {ORBIT.map((label, i) => {
                  const ang = (i / ORBIT.length) * Math.PI * 2 - Math.PI / 2;
                  const x = 50 + Math.cos(ang) * 29;
                  const y = 50 + Math.sin(ang) * 35;
                  return (
                    <g key={label}>
                      <motion.line
                        x1="50%" y1="50%"
                        x2={`${x}%`} y2={`${y}%`}
                        stroke="#0f766e" strokeWidth="1" strokeDasharray="3 5"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 0.45 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.12 * i, duration: 0.6 }}
                      />
                      {!reduced && (
                        <motion.circle
                          r="3.5"
                          fill="#0f766e"
                          initial={{ cx: `${x}%`, cy: `${y}%`, opacity: 0 }}
                          animate={{
                            cx: [`${x}%`, "50%"],
                            cy: [`${y}%`, "50%"],
                            opacity: [0, 0.9, 0.9, 0],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 2.2,
                            delay: 1 + i * 0.7,
                            repeatDelay: ORBIT.length * 0.7 - 0.7,
                            ease: "easeIn",
                            times: [0, 0.15, 0.85, 1],
                          }}
                        />
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* public studies around the run — every chip is a study live on this page */}
              {ORBIT.map((label, i) => {
                const ang = (i / ORBIT.length) * Math.PI * 2 - Math.PI / 2;
                return (
                  <motion.div
                    key={label}
                    className="absolute -translate-x-1/2 -translate-y-1/2 font-mono text-[11px] md:text-[11.5px] text-dim border border-line bg-panel rounded-full px-3 py-1.5 whitespace-nowrap shadow-sm"
                    style={{ left: `${50 + Math.cos(ang) * 29}%`, top: `${50 + Math.sin(ang) * 35}%` }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.12 * i, duration: 0.5 }}
                  >
                    {label}
                  </motion.div>
                );
              })}
            </div>

            <p className="border-t border-line px-4 py-2.5 text-center font-mono text-[11.5px] text-dim">
              every chip is a public study already live on this page
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
