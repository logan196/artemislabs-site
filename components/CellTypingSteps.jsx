"use client";

import { useEffect, useRef, useState } from "react";

// How one GBM3 spot got its label, step by step, from the real run:
// public/plots/umap_params.json (spot 43, log-normalized markers) and
// public/live/GBM3/context.txt (BANKSY lambda=0.2, 50 PCs, Leiden -> 15
// domains; Wilcoxon top markers; label proposed by qwen3:8b from markers).
// Microglia/TAMs maps to exactly one domain (7, 97 spots), so this spot's
// domain is known.
const SPOT = 43;
const TAM = 5; // index of "microglia/TAMs" in umap_params.domains
const TAM_COLOR = "#E69F00";
const STEP_MS = 3200;

const STEPS = [
  {
    k: "01",
    t: "Read the spot",
    d: "Each Visium spot is a small patch of tissue with counts for 1,969 genes. Three of them for this spot, log-normalized:",
  },
  {
    k: "02",
    t: "Group it with its neighbors",
    d: "BANKSY mixes each spot's expression with that of the spots around it (lambda 0.2, 50 PCs). Leiden clustering then splits the 1,775 spots into 15 domains. This spot lands in domain 7, with 96 others.",
  },
  {
    k: "03",
    t: "Rank what sets the domain apart",
    d: "A Wilcoxon rank-sum test compares domain 7 with the rest. Its top five genes:",
  },
  {
    k: "04",
    t: "Name it and color it",
    d: "A language model running locally (Qwen3 8B) reads those markers and proposes a cell type for the domain: microglia / tumor-associated macrophages. Every spot in the domain takes that color on the tissue.",
  },
];

const TOP = ["C3", "IGFBP7", "FN1", "HLA-DRB1", "MMP9"];

export default function CellTypingSteps() {
  const [data, setData] = useState(null);
  const [step, setStep] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [inView, setInView] = useState(false);
  const wrap = useRef(null);
  const cv = useRef(null);

  useEffect(() => {
    const r = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(r);
    if (r) setStep(3);
    fetch("plots/umap_params.json").then((x) => (x.ok ? x.json() : null)).then(setData).catch(() => {});
  }, []);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || !inView) return;
    const iv = setInterval(() => setStep((s) => (s + 1) % STEPS.length), STEP_MS);
    return () => clearInterval(iv);
  }, [reduced, inView]);

  // tissue map: all spots grey; domain 7 outlined from step 2; colored at step 4
  useEffect(() => {
    const c = cv.current;
    if (!c || !data) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = c.clientWidth, h = c.clientHeight;
    c.width = w * dpr; c.height = h * dpr;
    const ctx = c.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const xs = data.settings[0].x, ys = data.settings[0].y, L = data.labels;
    const pad = 10, s = Math.min(w, h) - pad * 2, ox = (w - s) / 2, oy = (h - s) / 2;
    const r = Math.max(1.6, s / 150);
    let raf = 0;
    const t0 = performance.now();
    const frame = (now) => {
      const k = reduced ? 1 : Math.min(1, (now - t0) / 700);
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < L.length; i++) {
        const x = ox + xs[i] * s, y = oy + (1 - ys[i]) * s;
        const inDom = L[i] === TAM;
        let col = "rgba(241,237,226,0.16)";
        if (inDom && step >= 1) col = step >= 3 ? TAM_COLOR : `rgba(241,237,226,${0.16 + 0.5 * (step === 1 ? k : 1)})`;
        if (inDom && step >= 3) ctx.globalAlpha = 0.25 + 0.75 * (step === 3 ? k : 1);
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
        ctx.globalAlpha = 1;
      }
      const x = ox + xs[SPOT] * s, y = oy + (1 - ys[SPOT]) * s;
      ctx.strokeStyle = "#f1ede2"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, y, r + 5 + (reduced ? 0 : 2 * Math.sin(now / 300)), 0, 6.283); ctx.stroke();
      if (k < 1) raf = requestAnimationFrame(frame);
      else if (!reduced) raf = requestAnimationFrame(frame); // keep the ring breathing
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [data, step, reduced, inView]);

  const mk = data ? ["EGFR", "SOX2", "CD68"].map((g) => [g, data.markers[g][SPOT], data._max ?? Math.max(...data.markers[g])]) : [];

  return (
    <div id="cell-typing" ref={wrap} className="mt-10 rounded-[4px] border border-line bg-panel p-5 md:p-8">
      <p className="text-[13px] text-dim">How each spot gets its cell type</p>
      <h3 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight">One spot, four steps.</h3>
      <div className="mt-6 grid md:grid-cols-[1fr_minmax(0,22rem)] gap-8 items-start">
        <ol className="space-y-2">
          {STEPS.map((s, i) => {
            const on = i === step, done = i < step;
            return (
              <li key={s.k}>
                <button
                  onClick={() => setStep(i)}
                  className={`w-full text-left rounded-[4px] border px-4 py-3 transition-colors cursor-pointer ${
                    on ? "border-violet/50 bg-white/[0.03]" : "border-transparent hover:border-line"
                  }`}
                  aria-current={on ? "step" : undefined}
                >
                  <span className="flex items-baseline gap-3">
                    <span className={`font-mono text-[12px] tabular-nums ${on || done ? "text-violet" : "text-dim"}`}>{s.k}</span>
                    <span className={`text-[16px] ${on ? "text-snow" : "text-snow/70"}`}>{s.t}</span>
                  </span>
                  <span
                    className="grid transition-[grid-template-rows,opacity] duration-500 ease-out"
                    style={{ gridTemplateRows: on || reduced ? "1fr" : "0fr", opacity: on || reduced ? 1 : 0 }}
                  >
                    <span className="overflow-hidden">
                      <span className="block pl-8 pt-2 text-[14px] text-dim leading-relaxed">{s.d}</span>
                      {i === 0 && (
                        <span className="block pl-8 pt-3 space-y-2">
                          {mk.map(([g, v]) => (
                            <span key={g} className="grid grid-cols-[3.5rem_1fr_2.5rem] items-center gap-3 text-[12.5px]">
                              <span className="font-mono text-snow/85">{g}</span>
                              <span className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <span
                                  className="block h-full rounded-full bg-violet transition-[width] duration-700 ease-out"
                                  style={{ width: on || reduced ? `${(v / 1.6) * 100}%` : "0%" }}
                                />
                              </span>
                              <span className="font-mono tabular-nums text-dim text-right">{v.toFixed(2)}</span>
                            </span>
                          ))}
                          <span className="block text-[12px] text-dim">Clustering uses all 1,969 genes, not just these three.</span>
                        </span>
                      )}
                      {i === 2 && (
                        <span className="flex flex-wrap gap-x-4 gap-y-1 pl-8 pt-3 font-mono text-[13px] text-snow/85">
                          {TOP.map((g) => <span key={g}>{g}</span>)}
                        </span>
                      )}
                      {i === 3 && (
                        <span className="flex items-center gap-2 pl-8 pt-3 text-[13.5px] text-snow">
                          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: TAM_COLOR }} />
                          microglia/TAMs <span className="text-dim">· 97 spots</span>
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <figure>
          <canvas ref={cv} className="w-full aspect-square block" aria-label="GBM3 tissue section: the selected spot is ringed; its domain lights up and takes the microglia/TAMs color" role="img" />
          <figcaption className="mt-2 text-[12.5px] text-dim leading-relaxed">
            GBM3 (Ren et al. 2023, GSE194329), spot positions on the tissue. Labels
            come from a model reading marker genes and have not been independently
            validated.
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
