"use client";

// Closing demo in the spirit of a living instrument: a sample Artemis run
// typed into a terminal, with a field of cells that scatter, pass QC, cluster
// and settle in sync. Public data only (de Jong et al. Xenium, AT4-FO-2).
// Not a product CLI, not an install command — a staged replay of a sample run.
import { useEffect, useRef, useState } from "react";

const CMD = "artemis run --assay xenium --section AT4-FO-2";

const STEPS = [
  { id: "load", after: 0,    lines: [
      "loading AT4-FO-2  ·  de Jong et al., Nature 2026  ·  gbmspace.org",
      "  50,000-cell subsample  ·  4,801 genes  ·  coordinates OK",
    ]},
  { id: "qc", after: 1400,   lines: [
      "",
      "QC",
      "  median transcripts / cell   187",
      "  cells passing filters    48,612",
    ]},
  { id: "banksy", after: 2800, lines: [
      "",
      "BANKSY  λ=0.2  ·  50 PCs",
      "  neighborhood graph built",
      "  spatially-aware embedding ready",
    ]},
  { id: "cluster", after: 4400, lines: [
      "",
      "Leiden clustering",
      "  14 domains",
    ]},
  { id: "annot", after: 5800, lines: [
      "",
      "cell-state annotation",
      "  AC-like  MES-like  NPC-like  OPC-like  ·  TME",
    ]},
  { id: "figures", after: 7200, lines: [
      "",
      "writing figures",
      "  domains.png  programs.png  overlay.png",
    ]},
  { id: "portal", after: 8600, lines: [
      "",
      "portal ready",
      "  AT4-FO-2  ·  14 domains  ·  open in browser",
    ]},
];

const COLORS = [
  [95, 201, 184],
  [217, 164, 91],
  [94, 180, 224],
  [224, 122, 122],
  [176, 140, 214],
  [90, 196, 130],
  [232, 186, 92],
  [120, 160, 220],
];

const STEP_INDEX = { load: 0, qc: 1, banksy: 2, cluster: 3, annot: 4, figures: 5, portal: 6 };

function CellField({ step, reduced }) {
  const ref = useRef(null);
  const stepRef = useRef(step);
  stepRef.current = step;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    const reducedMotion = reduced || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const N = 640;
    const K = 8;
    const cells = [];
    const rng = (s) => { s = Math.sin(s * 12.9898) * 43758.5453; return s - Math.floor(s); };

    for (let i = 0; i < N; i++) {
      const seed = i * 1.7 + 0.13;
      const cx = rng(seed), cy = rng(seed + 2);
      const ki = i % K;
      const ang = (ki / K) * Math.PI * 2 + rng(seed + 4) * 0.4;
      const rad = 0.22 + rng(seed + 5) * 0.16;
      cells.push({
        x: cx, y: cy,
        tx: cx, ty: cy,
        homeX: cx, homeY: cy,
        clx: 0.5 + Math.cos(ang) * rad,
        cly: 0.5 + Math.sin(ang) * rad * 0.85,
        jitter: rng(seed + 6),
        k: ki,
        fail: rng(seed + 8) < 0.05,
        a: 1,
      });
    }

    const setTargets = (s) => {
      for (const c of cells) {
        if (s <= 0) { c.tx = c.homeX; c.ty = c.homeY; c.a = 0.95; }
        else if (s === 1) { c.tx = c.homeX; c.ty = c.homeY; c.a = c.fail ? 0.12 : 1; }
        else if (s === 2) {
          c.tx = c.clx * 0.45 + c.homeX * 0.55;
          c.ty = c.cly * 0.45 + c.homeY * 0.55;
          c.a = c.fail ? 0.08 : 1;
        } else {
          const tight = s >= 5 ? 0.92 : s >= 3 ? 0.82 : 0.7;
          const j = (c.jitter - 0.5) * (1 - tight) * 0.18;
          c.tx = c.clx + j;
          c.ty = c.cly + j * 0.8;
          c.a = c.fail ? 0.06 : 1;
        }
      }
    };

    setTargets(reducedMotion ? 6 : 0);
    if (reducedMotion) for (const c of cells) { c.x = c.tx; c.y = c.ty; }

    let raf = 0, last = performance.now(), t = 0, disposed = false, visible = true;
    let cssW = 0, cssH = 0;
    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, canvas.clientWidth);
      const h = Math.max(1, canvas.clientHeight);
      if (w === cssW && h === cssH && canvas.width === Math.round(w * dpr)) return;
      cssW = w; cssH = h;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) loop(performance.now()); });
    io.observe(canvas);
    const ro = new ResizeObserver(() => { fit(); if (visible && !raf) loop(performance.now()); });
    ro.observe(canvas);
    fit();

    function loop(now) {
      raf = 0;
      if (disposed || !visible) return;
      const dt = Math.min(40, now - last); last = now; t += dt / 1000;
      fit();
      if (!reducedMotion) setTargets(stepRef.current);
      const w = cssW, h = cssH;
      ctx.fillStyle = "#07080a";
      ctx.fillRect(0, 0, w, h);
      for (const c of cells) {
        if (!reducedMotion) {
          c.x += (c.tx - c.x) * 0.05;
          c.y += (c.ty - c.y) * 0.05;
        }
        const breathe = reducedMotion ? 0 : Math.sin(t * 1.4 + c.jitter * 6) * 0.006;
        const px = (c.x + breathe) * w;
        const py = (c.y + breathe * 0.6) * h;
        const [r, g, b] = COLORS[c.k];
        const s = stepRef.current;
        const rad = 2.8 + (s >= 3 ? 0.6 : 0) + (s >= 5 ? 0.5 : 0);
        ctx.beginPath();
        ctx.arc(px, py, rad, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${c.a})`;
        ctx.fill();
        if (s >= 4 && c.a > 0.5) {
          ctx.beginPath();
          ctx.arc(px, py, rad * 2.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${0.16 * c.a})`;
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => { disposed = true; cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); };
  }, [reduced]);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" style={{ width: "100%", height: "100%" }} aria-hidden />;
}

export default function CloseRun() {
  const rootRef = useRef(null);
  const [typed, setTyped] = useState("");
  const [step, setStep] = useState(-1); // -1 typing, 0..6 running
  const [log, setLog] = useState([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setTyped(CMD);
      setLog(STEPS.flatMap((s) => s.lines));
      setStep(6);
      setDone(true);
      return;
    }

    // Wall-clock timeline from mount so a late scroll (or a throttled
    // headless tab) lands mid-cycle instead of restarting the type-out.
    const TYPE_DELAY = 400;
    const typedAt = new Array(CMD.length + 1);
    typedAt[0] = 0;
    typedAt[1] = TYPE_DELAY;
    for (let i = 2; i <= CMD.length; i++) {
      typedAt[i] = typedAt[i - 1] + 16 + (CMD[i - 2] === " " ? 24 : 0);
    }
    const typedDone = typedAt[CMD.length];
    const stepAt = STEPS.map((s) => typedDone + 700 + s.after);
    const CYCLE = stepAt[stepAt.length - 1] + 4200;
    const t0 = performance.now();
    let raf = 0;
    let lastKey = "";

    const derive = (elapsed) => {
      const t = elapsed % CYCLE;
      if (t < typedDone) {
        let n = 0;
        for (let i = 0; i <= CMD.length; i++) if (typedAt[i] <= t) n = i;
        return { typed: CMD.slice(0, n), step: -1, log: [], done: false };
      }
      let idx = -1;
      for (let i = 0; i < stepAt.length; i++) if (t >= stepAt[i]) idx = i;
      if (idx < 0) return { typed: CMD, step: -1, log: [], done: false };
      return {
        typed: CMD,
        step: idx,
        log: STEPS.slice(0, idx + 1).flatMap((s) => s.lines),
        done: idx === STEPS.length - 1,
      };
    };

    const tick = (now) => {
      const snap = derive(now - t0);
      const key = `${snap.typed}|${snap.step}|${snap.done}`;
      if (key !== lastKey) {
        lastKey = key;
        setTyped(snap.typed);
        setStep(snap.step);
        setLog(snap.log);
        setDone(snap.done);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div id="sample-run" ref={rootRef} className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 border border-white/10 rounded-[4px] overflow-hidden">
        <div className="bg-[#0b0c0f] border-b md:border-b-0 md:border-r border-white/10">
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/10" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="ml-3 font-mono text-[11px] tracking-[0.14em] uppercase text-dim">
              sample run · public data
            </span>
          </div>
          <pre
            className="px-5 py-4 font-mono text-[12.5px] leading-[1.65] text-snow/85 overflow-x-auto min-h-[280px] md:min-h-[340px]"
            aria-label="Sample Artemis run on public Xenium section AT4-FO-2 from de Jong et al., Nature 2026. Typed command, then QC, BANKSY, clustering, figures and a portal-ready line."
          >
            <div className="text-dim"># de Jong et al., Nature 2026 · Xenium · AT4-FO-2</div>
            <div className="text-dim"># 50,000-cell subsample · gbmspace.org</div>
            <div className="mt-2">
              <span className="text-violet">$ </span>
              {typed}
              {step < 0 && <span className="inline-block w-[7px] h-[13px] ml-0.5 bg-violet align-[-1px] animate-pulse" />}
            </div>
            {log.length > 0 && (
              <div className="mt-3 text-snow/75">
                {log.map((ln, i) => (
                  <div key={i} className={ln.startsWith("portal ready") || ln.trim() === "QC" || ln.startsWith("BANKSY") || ln.startsWith("Leiden") || ln.startsWith("cell-state") || ln.startsWith("writing") ? "text-violet" : ""}>
                    {ln || "\u00a0"}
                  </div>
                ))}
                {done && <div className="text-violet mt-1">{"\u2713"} sample complete</div>}
              </div>
            )}
          </pre>
        </div>
        <div className="relative min-h-[240px] md:min-h-[340px] bg-[#07080a]">
          <CellField step={Math.max(0, step)} reduced={false} />
          <div className="absolute left-3 bottom-3 font-mono text-[10.5px] tracking-[0.16em] uppercase text-dim/90 pointer-events-none">
            {step <= 0 && "cells · unordered"}
            {step === 1 && "QC · filters applied"}
            {step === 2 && "BANKSY · neighborhoods"}
            {step === 3 && "Leiden · 14 domains"}
            {step === 4 && "states · annotated"}
            {step >= 5 && "portal · figures ready"}
          </div>
        </div>
      </div>
      <p className="mt-3 text-[12.5px] text-dim leading-relaxed">
        A sample run on public data — Xenium section AT4-FO-2 from de Jong et al., <i>Nature</i> 2026 (gbmspace.org).
        Staged replay of an analysis we performed; not an installable command or a product release.
      </p>
    </div>
  );
}
