"use client";

// Closing demo: real analysis excerpts for public Xenium section AT4-FO-2
// (de Jong et al., Nature 2026). Numbers come from the BANKSY viewer export
// (banksy/workspace/vit/index.json) and section coordinates
// (site/data/v3/sections/AT4-FO-2.json). Domain "top" strings are author-type
// composition from that run, not Wilcoxon gene markers.
import { useEffect, useRef, useState } from "react";

const CMD = 'adata = sc.read_h5ad("AT4-FO-2.h5ad")';

const STEPS = [
  {
    id: "load",
    after: 0,
    lines: [
      "# de Jong et al., Nature 2026 · Xenium · AT4-FO-2 · gbmspace.org",
      "# source: BANKSY viewer export · banksy/workspace/vit/index.json",
      ">>> adata.n_obs",
      "126738",
    ],
  },
  {
    id: "qc",
    after: 1600,
    lines: [
      "",
      ">>> int(adata.n_obs)",
      "126738",
      ">>> float(adata.obs[\"total_counts\"].median())",
      "232.0",
      "# 50,000 cells shown in the source viewer; 2,500 plotted here",
    ],
  },
  {
    id: "banksy",
    after: 3200,
    lines: [
      "",
      ">>> adata.obs[\"banksy_domain\"].nunique()",
      "8",
      ">>> adata.obs[\"banksy_domain\"].value_counts()",
      "D5 Cellular tumour    39397",
      "D2 Hypoxic core       31935",
      "D1 Infiltrated        19285",
      "D0 Infiltrated        15223",
      "D6 Cellular tumour    10153",
      "D7 Infiltrated         4317",
      "D4 Non-malignant       3399",
      "D3 Non-malignant       3029",
    ],
  },
  {
    id: "labels",
    after: 5000,
    lines: [
      "",
      "# domain labels from the run export, with % malignant",
      "D2 Hypoxic core        31,935  ·  92.1%",
      "D5 Cellular tumour     39,397  ·  89.0%",
      "D6 Cellular tumour     10,153  ·  82.3%",
      "D1 Infiltrated         19,285  ·  49.1%",
    ],
  },
  {
    id: "composition",
    after: 6800,
    lines: [
      "",
      "# top author cell-type composition per domain (not gene DE)",
      "D2  Hypoxic 49%, Gliosis-like 8%, AC-gliosis-like 7%",
      "D5  OPC-like 20%, AC-progenitor-like 18%, Proliferative 17%",
      "D4  Oligodendrocytes 88%, Gliosis-like 4%, Lymphocytes 4%",
      "D3  Macrophages 89%, Lymphocytes 6%, OPC-NPC-like 1%",
    ],
  },
  {
    id: "portal",
    after: 8600,
    lines: [
      "",
      "portal ready",
      "AT4-FO-2  ·  8 BANKSY domains  ·  126,738 cells",
    ],
  },
];

function hexToRgb(hex) {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

function CellField({ step, reduced, data }) {
  const ref = useRef(null);
  const stepRef = useRef(step);
  stepRef.current = step;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !data) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    const reducedMotion = reduced || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pal = {};
    const labels = {};
    for (const d of data.domains) {
      pal[d.id] = hexToRgb(d.color);
      labels[d.id] = d;
    }
    const pts = data.points;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const [x, y] of pts) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }

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

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) loop(performance.now());
    });
    io.observe(canvas);
    const ro = new ResizeObserver(() => {
      fit();
      if (visible && !raf) loop(performance.now());
    });
    ro.observe(canvas);
    fit();

    function loop(now) {
      raf = 0;
      if (disposed || !visible) return;
      const dt = Math.min(40, now - last);
      last = now;
      t += dt / 1000;
      fit();
      const w = cssW, h = cssH;
      const pad = 16;
      const sx = (x) => pad + ((x - minX) / (maxX - minX || 1)) * (w - pad * 2);
      const sy = (y) => pad + ((y - minY) / (maxY - minY || 1)) * (h - pad * 2);
      ctx.fillStyle = "#07080a";
      ctx.fillRect(0, 0, w, h);
      const s = stepRef.current;
      for (let i = 0; i < pts.length; i++) {
        const [x, y, d] = pts[i];
        const [r, g, b] = pal[d] || [180, 180, 180];
        const breathe = reducedMotion ? 0 : Math.sin(t * 1.2 + i * 0.015) * 0.6;
        const px = sx(x) + breathe;
        const py = sy(y) + breathe * 0.5;
        const colored = s >= 2;
        const rad = s >= 2 ? 2.4 : 2.15;
        ctx.beginPath();
        ctx.arc(px, py, rad, 0, Math.PI * 2);
        ctx.fillStyle = colored
          ? `rgba(${r},${g},${b},0.95)`
          : "rgba(230,226,214,0.9)";
        ctx.fill();
      }
      if (s >= 3) {
        ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
        const used = new Set();
        for (const d of data.domains) {
          if (used.has(d.cls) && (d.id !== 2 && d.id !== 5 && d.id !== 4 && d.id !== 3 && d.id !== 1 && d.id !== 0)) continue;
          // place a label near the first preview point of this domain
          let accX = 0, accY = 0, n = 0;
          for (const [x, y, id] of pts) {
            if (id !== d.id) continue;
            accX += sx(x);
            accY += sy(y);
            n += 1;
            if (n > 80) break;
          }
          if (!n) continue;
          used.add(d.id);
          const lx = accX / n;
          const ly = accY / n;
          const [r, g, b] = pal[d.id];
          ctx.fillStyle = `rgba(${r},${g},${b},0.95)`;
          ctx.fillText(d.cls, lx - 22, ly);
        }
      }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [reduced, data]);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" style={{ width: "100%", height: "100%" }} aria-hidden />;
}

function toneLine(ln) {
  if (!ln) return "text-snow/75";
  if (ln.startsWith(">>>") || ln.startsWith("portal ready")) return "text-[#7eefe0]";
  if (ln.startsWith("#")) return "text-dim";
  return "text-snow/80";
}

export default function CloseRun() {
  const rootRef = useRef(null);
  const [typed, setTyped] = useState("");
  const [step, setStep] = useState(-1);
  const [log, setLog] = useState([]);
  const [done, setDone] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch("dejong/at4_fo2_preview.json")
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setPreview(d); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setTyped(CMD);
      setLog(STEPS.flatMap((s) => s.lines));
      setStep(STEPS.length - 1);
      setDone(true);
      return;
    }
    const TYPE_DELAY = 400;
    const typedAt = new Array(CMD.length + 1);
    typedAt[0] = 0;
    typedAt[1] = TYPE_DELAY;
    for (let i = 2; i <= CMD.length; i++) {
      typedAt[i] = typedAt[i - 1] + 16 + (CMD[i - 2] === " " ? 24 : 0);
    }
    const typedDone = typedAt[CMD.length];
    const stepAt = STEPS.map((s) => typedDone + 700 + s.after);
    const CYCLE = stepAt[stepAt.length - 1] + 4800;
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

  const caption = [
    "cells · AT4-FO-2 coordinates",
    "QC · 126,738 cells · median 232",
    "BANKSY · 8 domains",
    "domains labeled",
    "author-type composition",
    "portal · 8 domains",
  ];

  return (
    <div id="sample-run" ref={rootRef} className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 border border-white/10 rounded-[4px] overflow-hidden">
        <div className="bg-[#0b0c0f] border-b md:border-b-0 md:border-r border-white/10">
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/10" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="ml-3 font-mono text-[11px] tracking-[0.14em] uppercase text-dim">
              python · AT4-FO-2
            </span>
          </div>
          <pre
            className="px-5 py-4 font-mono text-[12.5px] leading-[1.65] text-snow/85 overflow-x-auto min-h-[300px] md:min-h-[400px]"
            aria-label="Real analysis excerpts on public Xenium section AT4-FO-2 from de Jong et al., Nature 2026. Numbers from the BANKSY run export: 126,738 cells, median 232 transcripts, 8 domains."
          >
            <div>
              <span className="text-[#7eefe0]">{">>> "}</span>
              {typed}
              {step < 0 && (
                <span className="inline-block w-[7px] h-[13px] ml-0.5 bg-[#7eefe0] align-[-1px] animate-pulse" />
              )}
            </div>
            {log.length > 0 && (
              <div className="mt-3">
                {log.map((ln, i) => (
                  <div key={i} className={toneLine(ln)}>
                    {ln || "\u00a0"}
                  </div>
                ))}
                {done && <div className="text-[#7eefe0] mt-1">{"\u2713"} sample complete</div>}
              </div>
            )}
          </pre>
        </div>
        <div className="relative min-h-[260px] md:min-h-[400px] bg-[#07080a]">
          {preview && <CellField step={Math.max(0, step)} reduced={false} data={preview} />}
          <div className="absolute left-3 bottom-3 font-mono text-[10.5px] tracking-[0.12em] uppercase text-dim/90 pointer-events-none">
            {caption[Math.max(0, step)] || caption[0]}
          </div>
        </div>
      </div>
      <p className="mt-3 text-[12.5px] text-dim leading-relaxed">
        Public Xenium section AT4-FO-2 from de Jong et al., <i>Nature</i> 2026 (gbmspace.org).
        Counts and domain composition are from the BANKSY viewer export
        (<span className="font-mono text-[11.5px]">banksy/workspace/vit/index.json</span>);
        coordinates from the v3 section JSON. 2,500 of 50,000 displayed cells are plotted.
        Domain “top” lines are author cell-type composition from that run, not gene markers.
      </p>
    </div>
  );
}
