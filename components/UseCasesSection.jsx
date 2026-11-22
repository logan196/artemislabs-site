"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Reveal from "./Reveal";

// Three use cases, each fronted by a wireframe dodecahedron in its own accent
// color. Scrolling through the section "lights up" the case nearest the middle
// of the viewport (IntersectionObserver only — normal page scroll untouched).

function buildDodecahedron() {
  const phi = (1 + Math.sqrt(5)) / 2;
  const a = 1, b = 1 / phi, c = phi;
  const verts = [];
  for (const x of [-a, a]) for (const y of [-a, a]) for (const z of [-a, a]) verts.push([x, y, z]);
  for (const s of [-1, 1]) for (const t of [-1, 1]) {
    verts.push([0, s * b, t * c]);
    verts.push([s * b, t * c, 0]);
    verts.push([s * c, 0, t * b]);
  }
  const edges = [];
  const target = 2 / phi; // minimal vertex distance = an edge
  for (let i = 0; i < verts.length; i++)
    for (let j = i + 1; j < verts.length; j++) {
      const d = Math.hypot(
        verts[i][0] - verts[j][0],
        verts[i][1] - verts[j][1],
        verts[i][2] - verts[j][2],
      );
      if (Math.abs(d - target) < 1e-6) edges.push([i, j]);
    }
  return { verts, edges };
}

function CaseDodeca({ rgb, seed = 0, active = false, geom, size = 160 }) {
  const ref = useRef(null);
  const activeRef = useRef(active);
  activeRef.current = active;
  const redrawRef = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const { verts, edges } = geom;

    let raf = 0;
    let running = false;
    let glow = activeRef.current ? 1 : 0; // eased 0..1 brightness/speed
    let angle = 0; // accumulated rotation — speed changes stay smooth
    let lastNow = 0;
    const t0 = performance.now();

    const frame = (now, step) => {
      // first rAF timestamp can precede the performance.now() captured above
      const t = Math.max(0, now - t0) / 1000;
      const dt = step ? Math.min(50, Math.max(0, now - lastNow)) : 0;
      lastNow = now;

      const targetGlow = activeRef.current ? 1 : 0;
      if (step) glow += (targetGlow - glow) * Math.min(1, dt / 240);
      else glow = targetGlow;
      if (step && !reduced) angle += (dt / 1000) * (0.3 + 0.6 * glow);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      const rx = angle * 0.92 + seed;
      const ry = angle * 0.61 + seed * 1.7;
      const cosx = Math.cos(rx), sinx = Math.sin(rx);
      const cosy = Math.cos(ry), siny = Math.sin(ry);
      const pts = verts.map(([x, y, z]) => {
        const y1 = y * cosx - z * sinx, z1 = y * sinx + z * cosx;
        const x2 = x * cosy + z1 * siny, z2 = -x * siny + z1 * cosy;
        const s = size * 0.22 * (3.2 / (3.2 + z2)); // mild perspective
        return [size / 2 + x2 * s, size / 2 + y1 * s, z2];
      });

      const pulse = reduced ? 0.85 : 0.75 + 0.25 * Math.sin(t * (1.1 + 0.7 * glow) + seed);
      ctx.lineCap = "round";
      ctx.lineWidth = 1.1 + 0.35 * glow;
      for (const [i, j] of edges) {
        const near = 1 - ((pts[i][2] + pts[j][2]) / 2 + 1.7) / 3.4;
        const alpha = (0.14 + 0.2 * glow) + (0.28 + 0.34 * glow) * near * pulse;
        ctx.strokeStyle = `rgba(${rgb}, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(pts[i][0], pts[i][1]);
        ctx.lineTo(pts[j][0], pts[j][1]);
        ctx.stroke();
      }
      for (const [x, y, z] of pts) {
        const near = 1 - (z + 1.7) / 3.4;
        ctx.beginPath();
        ctx.arc(x, y, 1.2 + 1.1 * near, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, ${(0.2 + 0.6 * near * (0.4 + 0.6 * glow)).toFixed(3)})`;
        ctx.fill();
      }
    };

    const loop = (now) => {
      frame(now, true);
      if (running) raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduced) return;
      running = true;
      lastNow = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    redrawRef.current = () => frame(performance.now(), false);

    // pause offscreen; reduced motion renders static frames only
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (reduced) redrawRef.current?.();
          else start();
        } else stop();
      },
      { rootMargin: "80px" },
    );
    io.observe(canvas);

    frame(performance.now(), false); // never a blank canvas before the loop

    return () => {
      stop();
      io.disconnect();
      redrawRef.current = null;
    };
  }, [geom, rgb, seed, size]);

  // reduced motion: repaint the static frame when the active case changes
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) redrawRef.current?.();
  }, [active]);

  return (
    <canvas
      ref={ref}
      style={{ width: size, height: size }}
      className="pointer-events-none select-none"
      aria-hidden
    />
  );
}

const CASES = [
  {
    id: "gbm",
    tag: "VISIUM · GLIOBLASTOMA",
    title: "Spatial domains in resected GBM",
    body: "10x Visium glioblastoma sections run through the BANKSY pipeline: spatial domains segmented on tissue, tumor cell states annotated against the literature, and the whole section explorable in a live Vitessce portal.",
    stats: "1,775 spots · 15 BANKSY domains · 1,969 genes",
    href: "live/GBM3/portal.html",
    linkLabel: "Open the live GBM portal",
    hex: "#2dd4bf",
    rgb: "45, 212, 191",
    seed: 0.6,
  },
  {
    id: "seqfish",
    tag: "SEQFISH+ · MOUSE BRAIN",
    title: "Single-molecule cortex, rebuilt live",
    body: "The Eng et al. 2019 Cai-lab seqFISH+ dataset (mouse cortex, SVZ and choroid plexus) served as a live portal: cell types on tissue, UMAP and expression heatmap side by side, with the original segmentation staining underneath.",
    stats: "913 cells × 10,000 genes · Eng et al. 2019",
    href: "live/seqfish/portal.html",
    linkLabel: "Open the live seqFISH+ portal",
    hex: "#fbbf24",
    rgb: "251, 191, 36",
    seed: 2.3,
  },
  {
    id: "dti",
    tag: "DTI · RADIOMICS",
    title: "A diffusion-MRI cohort, browsable",
    body: "A longitudinal mouse-brain DTI cohort browser for a preclinical study: FA mosaics and fiber-orientation maps registered to the Allen atlas, with in-browser 3D volumes and per-region statistics in the full tool.",
    stats: "15 animals × 3 timepoints · CCFv3-registered",
    href: "demo/dti_demo.mp4",
    linkLabel: "Watch the 20-second replay",
    hex: "#818cf8",
    rgb: "129, 140, 248",
    seed: 4.1,
  },
];

export default function UseCasesSection() {
  const geom = useMemo(buildDodecahedron, []);
  const [active, setActive] = useState(0);
  const cardRefs = useRef([]);

  // The card crossing the middle band of the viewport becomes the active case.
  // Plain IntersectionObserver — the page keeps scrolling normally.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const idx = Number(entry.target.dataset.case);
          if (!Number.isNaN(idx)) setActive(idx);
        }
      },
      { rootMargin: "-42% 0px -42% 0px", threshold: 0 },
    );
    for (const el of cardRefs.current) if (el) io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="usecases" className="relative px-6 md:px-14 py-24 md:py-36 max-w-7xl mx-auto">
      <Reveal>
        <p className="font-mono text-sm text-violet mb-4">04 · USE CASES</p>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl">
          Real datasets, <span className="text-violet">live in the browser.</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-dim leading-relaxed">
          Each of these is an analysis we ran end to end, served as an interactive
          portal or replay you can open now.
        </p>
      </Reveal>

      <div className="mt-12 flex flex-col gap-4">
        {CASES.map((c, i) => {
          const isActive = active === i;
          return (
            <Reveal key={c.id} delay={0.06 * i}>
              <article
                ref={(el) => { cardRefs.current[i] = el; }}
                data-case={i}
                onMouseEnter={() => setActive(i)}
                className="group grid gap-6 md:grid-cols-[200px_1fr] md:items-center rounded-[4px] border bg-panel/70 p-6 md:p-8 transition-[border-color,opacity,box-shadow] duration-500"
                style={{
                  borderColor: isActive ? `rgba(${c.rgb}, 0.4)` : "rgba(255, 255, 255, 0.12)",
                  opacity: isActive ? 1 : 0.6,
                  boxShadow: isActive ? `0 0 48px -20px rgba(${c.rgb}, 0.45)` : "none",
                }}
              >
                <div className="flex items-center justify-center">
                  <CaseDodeca rgb={c.rgb} seed={c.seed} active={isActive} geom={geom} size={170} />
                </div>
                <div>
                  <p className="font-mono text-xs tracking-[0.18em]" style={{ color: c.hex }}>
                    {c.tag}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight">{c.title}</h3>
                  <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-dim">{c.body}</p>
                  <p className="mt-4 font-mono text-[12.5px] text-dim">{c.stats}</p>
                  <a
                    href={c.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-2 font-medium transition-opacity hover:opacity-80"
                    style={{ color: c.hex }}
                  >
                    {c.linkLabel}
                    <span
                      className="transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden
                    >
                      →
                    </span>
                  </a>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
