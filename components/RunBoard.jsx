"use client";

import { useEffect, useRef } from "react";

/*
 * RunBoard — the pipeline as a colorful mermaid-style flowchart in a
 * VS Code-dark editor panel.
 *
 * A condensed, deterministic REPLAY of the real Artemis spatial runs:
 * the five GBM datasets (GSE194329 GBM1–4 + the 10x public GBM section)
 * flowing through the real five stages of run_pipeline.py.
 *
 * Every name and number on the board is real:
 *   - stage names    = STAGE_NAMES in run_pipeline.py (verbatim)
 *   - spot counts    = n_spots in public/gbm/meta.json
 *   - domain counts  = n_clusters in public/gbm/meta.json
 *   - gene counts    = n_genes in output/manifest.json (post-filter)
 *   - stages 4–5     = genuinely SKIPPED in the shipped runs
 *                      (manifest: analysis_json = null for all five);
 *                      the skip messages quoted are the pipeline's own.
 *   - lane order     = the real run order by manifest run_at
 *                      (GBM1 → GBM2 → GBM4 → TenX_GBM → GBM3)
 * No durations are shown anywhere: the real runs logged none, so the
 * replay pacing is presentation-only and never printed as a time.
 *
 * Rendering: React paints the static structure once; a single rAF clock
 * writes straight to DOM nodes via refs (textContent / transform /
 * opacity / class) with a change-cache, so there are no per-frame React
 * re-renders. Flow dots ride the connector beziers via getPointAtLength,
 * driven only by the same deterministic clock (no Math.random, no
 * Date.now). IntersectionObserver starts the clock; prefers-reduced-motion
 * renders the completed state statically with no flow dots.
 */

// ---------------------------------------------------------------- real data
// STAGE_NAMES from run_pipeline.py, verbatim.
const STAGES = [
  { no: 1, name: "Load + preprocess", out: "preprocessed.h5ad" },
  { no: 2, name: "Marker report", out: "report.md · clusters.csv" },
  { no: 3, name: "Interactive viewer", out: "portal.html · data.zarr" },
  { no: 4, name: "AI analysis", out: "analysis.json", skipped: true, why: "--use-llm not set" },
  { no: 5, name: "Paper retrieval", out: "paper_cache.json", skipped: true, why: "no literature_queries" },
];

// Per-dataset numbers from public/gbm/meta.json (spots, clusters) and
// output/manifest.json (genes). `start` staggers lanes in the REAL run
// order by manifest run_at: GBM1, GBM2, GBM4, TenX_GBM, GBM3.
const DATASETS = [
  { id: "GBM1", spots: 4764, clusters: 14, genes: 1801, start: 0 },
  { id: "GBM2", spots: 2891, clusters: 20, genes: 2902, start: 1600 },
  { id: "GBM3", spots: 1775, clusters: 15, genes: 1969, start: 6400 },
  { id: "GBM4", spots: 2540, clusters: 19, genes: 3327, start: 3200 },
  { id: "TenX_GBM", spots: 3468, clusters: 22, genes: 2703, start: 4800 },
];

const TOTAL_SPOTS = DATASETS.reduce((a, d) => a + d.spots, 0); // 15,438
const TOTAL_DOMAINS = DATASETS.reduce((a, d) => a + d.clusters, 0); // 90

// ---------------------------------------------------------------- timeline
// Replay pacing only — the shipped runs logged no per-stage durations, so
// none are claimed. Windows are relative to each dataset's lane start.
const WIN = [
  { a: 0, b: 6000 }, // 1 Load + preprocess
  { a: 6000, b: 11000 }, // 2 Marker report
  { a: 11000, b: 15000 }, // 3 Interactive viewer
  { a: 15000, b: 15600 }, // 4 AI analysis   -> skipped
  { a: 15600, b: 16200 }, // 5 Paper retrieval -> skipped
];
const LANE_END = WIN[4].b; // 16,200 per lane
const COMPLETE_AT = 6400 + LANE_END + 300; // last lane (GBM3) + beat = 22,900
const TOTAL = 28000; // ~23s run + ~5s hold at COMPLETE, then loop
const FINAL_T = COMPLETE_AT + 100; // static state for reduced motion
const DOT_LOOP = 800; // ms for a flow dot to ride a connector once

// Footer log schedule — only real values (meta.json / manifest.json), and
// the pipeline's own skip messages.
const EVENTS = [];
for (const d of DATASETS) {
  const f = (n) => n.toLocaleString("en-US");
  EVENTS.push(
    { at: d.start + WIN[0].b, text: `${d.id} · load + preprocess → ${f(d.spots)} spots × ${f(d.genes)} genes` },
    { at: d.start + WIN[1].b, text: `${d.id} · marker report → ${d.clusters} spatial domains` },
    { at: d.start + WIN[2].b, text: `${d.id} · interactive viewer → output/${d.id}/portal.html` },
    { at: d.start + WIN[3].b, text: `${d.id} · ai analysis → skipped (--use-llm not set)` },
    { at: d.start + WIN[4].b, text: `${d.id} · paper retrieval → skipped (no literature_queries)` }
  );
}
// in-silico bench humor between real events — clearly whimsy, never data
const VERBS = [
  "⌁ titrating λ=0.2…",
  "⌁ hybridizing the neighborhood graph…",
  "⌁ annealing azimuthal gradients…",
  "⌁ eluting marker genes…",
  "⌁ spinning down barcodes…",
  "⌁ blocking nonspecific clusters…",
];
for (let i = 0; i < VERBS.length; i++) {
  EVENTS.push({ at: 2600 + i * 3400, text: VERBS[i] });
}
EVENTS.sort((x, y) => x.at - y.at);
const COMPLETE_LINE = `✓︎ 5 datasets · ${TOTAL_SPOTS.toLocaleString("en-US")} spots · ${TOTAL_DOMAINS} spatial domains · 5 portals shipped`;

// ---------------------------------------------------------------- palette
// Mermaid-on-VS-Code-dark status hues.
const DONE = "#2dd4bf"; // done   — teal
const RUN = "#fbbf24"; // running — amber
const SKIP = "#6b7280"; // skipped — muted slate
const FAIL = "#f87171"; // failed  — red (unused in the shipped runs, styled anyway)
const EDGE_ON = "#4b5563"; // settled connector stroke
const EDGE_OFF = "#2f2d3d"; // not-yet-travelled connector stroke
const INK = "#efeef8";
const SOFT = "#d6d3cb";
const DIM = "#8b87a0";
const FAINT = "#565666";

// Okabe–Ito dataset accents (colorblind-safe), one per lane.
const DS_COLOR = {
  GBM1: "#0072B2",
  GBM2: "#009E73",
  GBM3: "#D55E00",
  GBM4: "#CC79A7",
  TenX_GBM: "#E69F00",
};

// Mermaid-node treatment per aggregate stage status: strong 3px left
// border + soft tinted fill (skipped nodes get a dashed outline).
const NODE = {
  pending: { left: "#34323f", border: "#2a2838", bg: "#1a1826", dash: "solid" },
  running: { left: RUN, border: "#4a3d1c", bg: "rgba(251,191,36,0.08)", dash: "solid" },
  done: { left: DONE, border: "#1d4a44", bg: "rgba(45,212,191,0.08)", dash: "solid" },
  skipped: { left: SKIP, border: "#3a3d44", bg: "rgba(107,114,128,0.06)", dash: "dashed" },
  failed: { left: FAIL, border: "#52262b", bg: "rgba(248,113,113,0.08)", dash: "solid" },
};

// ---------------------------------------------------------------- geometry
const CARD_W = 190;
const CARD_H = 252;
const HEAD_H = 98;
const ROW_H = 28;
const EDGE_W = 44;
const rowY = (i) => HEAD_H + 10 + i * ROW_H + ROW_H / 2;
const MID_Y = CARD_H / 2;

// Mermaid-like bezier connector: lanes pinch toward the card midline then
// fan back out into the next node's rows.
const edgePath = (i) => {
  const y = rowY(i);
  return `M0,${y} C17,${y} 17,${MID_Y} ${EDGE_W / 2},${MID_Y} C${EDGE_W - 17},${MID_Y} ${EDGE_W - 17},${y} ${EDGE_W},${y}`;
};

const ease = (p) => 1 - Math.pow(1 - p, 3);
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const fmt = (n) => Math.round(n).toLocaleString("en-US");

// Status of dataset d at stage s (0-indexed) at replay time t.
function statusOf(d, s, t) {
  const rel = t - d.start;
  if (rel < WIN[s].a) return "pending";
  if (rel < WIN[s].b) return "running";
  return STAGES[s].skipped ? "skipped" : "done";
}

const CHIP_BASE =
  "inline-flex items-center gap-1 rounded-full border px-2 py-[1px] font-mono text-[9.5px] uppercase tracking-[0.08em]";
const CHIP = {
  pending: { text: "pending", cls: CHIP_BASE, style: { color: `${DIM}99`, borderColor: "#2e2c3a", background: "transparent" } },
  running: { text: "● running", cls: `${CHIP_BASE} rb-pulse`, style: { color: RUN, borderColor: "#78350f", background: "rgba(251,191,36,0.08)" } },
  done: { text: "✓︎ done", cls: CHIP_BASE, style: { color: DONE, borderColor: "#134e4a", background: "rgba(45,212,191,0.08)" } },
  skipped: { text: "– skipped", cls: CHIP_BASE, style: { color: "#9ca3af", borderColor: SKIP, background: "rgba(107,114,128,0.08)", borderStyle: "dashed" } },
  failed: { text: "✗︎ failed", cls: CHIP_BASE, style: { color: FAIL, borderColor: "#7f1d1d", background: "rgba(248,113,113,0.08)" } },
};

const DOT = {
  pending: { ch: "○", color: `${DIM}66`, cls: "" },
  running: { ch: "●", color: RUN, cls: "rb-pulse" },
  done: { ch: "✓︎", color: DONE, cls: "" },
  skipped: { ch: "–", color: "#9ca3af", cls: "" },
  failed: { ch: "✗︎", color: FAIL, cls: "" },
};

export default function RunBoard() {
  const rootRef = useRef(null);
  const nodes = useRef(new Map());
  const cache = useRef({});
  const lens = useRef({}); // connector path lengths, measured once

  // ref-callback registry: reg("key") attaches the node under that key
  const reg = (key) => (el) => {
    if (el) nodes.current.set(key, el);
  };

  useEffect(() => {
    const get = (k) => nodes.current.get(k);
    const put = (k, prop, val) => {
      const ck = k + " " + prop;
      if (cache.current[ck] === val) return;
      cache.current[ck] = val;
      const el = get(k);
      if (!el) return;
      if (prop === "text") el.textContent = val;
      else if (prop === "class") el.className = val;
      else if (prop === "xform") el.setAttribute("transform", val);
      else el.style[prop] = val;
    };

    // one deterministic frame: derive the whole board from t
    const apply = (t, motion) => {
      const complete = t >= COMPLETE_AT;

      // --- header strip
      put("hdr-status", "text", complete ? "✓︎ COMPLETE" : "● RUNNING");
      put("hdr-status", "color", complete ? DONE : RUN);
      put("hdr-status", "class", complete ? "font-mono text-[12px] font-bold tracking-[0.12em]" : "font-mono text-[12px] font-bold tracking-[0.12em] rb-pulse");
      let nDone = 0;
      let nSkip = 0;
      let nRun = 0;
      for (const d of DATASETS)
        for (let s = 0; s < 5; s++) {
          const st = statusOf(d, s, t);
          if (st === "done") nDone++;
          else if (st === "skipped") nSkip++;
          else if (st === "running") nRun++;
        }
      put("hdr-tasks", "text", `tasks ${nDone + nSkip} / 25 · ${nDone} done · ${nSkip} skipped · 0 failed`);
      // fake-refresh shimmer sweeping the header at each loop start
      const sh = t < 900 ? t / 900 : 1;
      put("hdr-shimmer", "transform", `translateX(${-110 + sh * 240}%)`);
      put("hdr-shimmer", "opacity", t < 900 ? "1" : "0");

      // --- stage nodes (mermaid boxes)
      for (let s = 0; s < 5; s++) {
        const stage = STAGES[s];
        const sts = DATASETS.map((d) => statusOf(d, s, t));
        const doneN = sts.filter((x) => x === "done" || x === "skipped").length;
        const anyRun = sts.includes("running");
        const agg = doneN === 5 ? (stage.skipped ? "skipped" : "done") : anyRun ? "running" : "pending";
        const chip = CHIP[agg];
        put(`chip-${s}`, "text", chip.text);
        put(`chip-${s}`, "class", chip.cls);
        put(`chip-${s}`, "color", chip.style.color);
        put(`chip-${s}`, "borderColor", chip.style.borderColor);
        put(`chip-${s}`, "background", chip.style.background);
        put(`chip-${s}`, "borderStyle", chip.style.borderStyle || "solid");

        // node tint + 3px status edge (left border stays solid; the
        // outline dashes for skipped, mermaid-style)
        const nd = NODE[agg];
        put(`card-${s}`, "borderTopColor", nd.border);
        put(`card-${s}`, "borderRightColor", nd.border);
        put(`card-${s}`, "borderBottomColor", nd.border);
        put(`card-${s}`, "borderLeftColor", nd.left);
        put(`card-${s}`, "borderTopStyle", nd.dash);
        put(`card-${s}`, "borderRightStyle", nd.dash);
        put(`card-${s}`, "borderBottomStyle", nd.dash);
        put(`card-${s}`, "background", nd.bg);

        // stage counter + progress bar
        let frac = doneN / 5;
        if (s === 0) {
          let spots = 0;
          for (const d of DATASETS) spots += d.spots * ease(clamp01((t - d.start - WIN[0].a) / (WIN[0].b - WIN[0].a)));
          put(`cnt-${s}`, "text", `${fmt(spots)} / ${fmt(TOTAL_SPOTS)} spots`);
          frac = spots / TOTAL_SPOTS;
        } else if (s === 1) {
          let dom = 0;
          for (const d of DATASETS) dom += d.clusters * ease(clamp01((t - d.start - WIN[1].a) / (WIN[1].b - WIN[1].a)));
          put(`cnt-${s}`, "text", `${Math.round(dom)} / ${TOTAL_DOMAINS} domains`);
          frac = dom / TOTAL_DOMAINS;
        } else if (s === 2) {
          put(`cnt-${s}`, "text", `${doneN} / 5 portals`);
        } else {
          put(`cnt-${s}`, "text", `${doneN} / 5 · ${stage.why}`);
        }
        put(`bar-${s}`, "transform", `scaleX(${frac})`);
        put(`bar-${s}`, "background", stage.skipped ? `${SKIP}66` : frac >= 0.999 ? DONE : RUN);

        // dataset mini-rows
        for (let i = 0; i < DATASETS.length; i++) {
          const d = DATASETS[i];
          const st = sts[i];
          const dot = DOT[st];
          put(`dot-${s}-${i}`, "text", dot.ch);
          put(`dot-${s}-${i}`, "color", dot.color);
          put(`dot-${s}-${i}`, "class", `w-3 shrink-0 text-center ${dot.cls}`);
          put(`rown-${s}-${i}`, "color", st === "pending" ? `${DIM}77` : st === "running" ? INK : SOFT);
          put(`tick-${s}-${i}`, "opacity", st === "pending" ? "0.35" : "1");

          let detail = "";
          let dColor = FAINT;
          if (st === "running") {
            const p = ease(clamp01((t - d.start - WIN[s].a) / (WIN[s].b - WIN[s].a)));
            if (s === 0) detail = fmt(d.spots * p);
            else if (s === 1) detail = `${Math.round(d.clusters * p)} dom`;
            else detail = "…";
            dColor = RUN;
          } else if (st === "done") {
            if (s === 0) detail = fmt(d.spots);
            else if (s === 1) detail = `${d.clusters} dom`;
            else detail = "portal.html";
            dColor = s === 2 ? `${DONE}cc` : SOFT;
          } else if (st === "skipped") {
            detail = "skipped";
            dColor = `${DIM}99`;
          }
          put(`det-${s}-${i}`, "text", detail);
          put(`det-${s}-${i}`, "color", dColor);
        }
      }

      // --- connectors: edge c-i is active while lane i runs stage c+1;
      // a flow dot (Okabe–Ito lane color) rides the bezier meanwhile.
      for (let c = 0; c < 4; c++) {
        for (let i = 0; i < DATASETS.length; i++) {
          const d = DATASETS[i];
          const h = d.start + WIN[c].b; // hand-off moment = next stage start
          const end = d.start + WIN[c + 1].b; // next stage settles
          const active = t >= h && t < end;
          const past = t >= end;
          put(`edge-${c}-${i}`, "stroke", active ? RUN : past ? EDGE_ON : EDGE_OFF);
          put(`edge-${c}-${i}`, "opacity", active ? "1" : past ? "0.9" : "0.55");

          if (active && motion) {
            const path = get(`edge-${c}-${i}`);
            if (path) {
              const key = `${c}-${i}`;
              if (lens.current[key] == null) lens.current[key] = path.getTotalLength();
              const prog = (Math.max(0, t - h) % DOT_LOOP) / DOT_LOOP;
              const pt = path.getPointAtLength(prog * lens.current[key]);
              put(`fdot-${c}-${i}`, "xform", `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
              put(`fdot-${c}-${i}`, "opacity", "1");
            }
          } else {
            put(`fdot-${c}-${i}`, "opacity", "0");
          }
        }
      }

      // --- footer log line
      let line = "waiting for first hand-off …";
      let lColor = FAINT;
      if (complete) {
        line = COMPLETE_LINE;
        lColor = DONE;
      } else {
        for (let i = EVENTS.length - 1; i >= 0; i--) {
          if (t >= EVENTS[i].at) {
            line = EVENTS[i].text;
            lColor = SOFT;
            break;
          }
        }
      }
      put("log", "text", line);
      put("log", "color", lColor);
    };

    // reduced motion → static completed board, no clock, no flow dots
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply(FINAL_T, false);
      return;
    }

    let raf = 0;
    let started = false;
    const io = new IntersectionObserver(
      (e) => {
        if (!e[0].isIntersecting || started) return;
        started = true;
        io.disconnect();
        const t0 = performance.now();
        const step = (now) => {
          apply(Math.max(0, now - t0) % TOTAL, true);
          raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.35 }
    );
    apply(0, true); // paint the initial pending board deterministically
    if (rootRef.current) io.observe(rootRef.current);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <figure className="m-0" ref={rootRef}>
      <style>{`
        @keyframes rb-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
        .rb-pulse { animation: rb-pulse 1.3s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .rb-pulse { animation: none; } }
      `}</style>

      <div
        className="rounded-lg border overflow-hidden shadow-sm"
        style={{ background: "#12101d", borderColor: "#2a2838" }}
        role="img"
        aria-label="Run board: the five public glioma datasets (GSE194329 GBM1 to GBM4 plus the 10x public GBM section) replayed through the real five-stage Artemis pipeline — Load + preprocess, Marker report, Interactive viewer, then AI analysis and Paper retrieval, which the shipped runs skipped. 15,438 spots processed into 90 spatial domains and 5 portals."
      >
        {/* ------------------------------------------------ editor title bar */}
        <div
          className="flex items-end gap-2.5 border-b px-3 pt-2"
          style={{ background: "#0d0b16", borderColor: "#2a2838" }}
          aria-hidden
        >
          <span className="mb-2 flex items-center gap-1.5">
            <span className="h-[9px] w-[9px] rounded-full" style={{ background: "#6e4a4f" }} />
            <span className="h-[9px] w-[9px] rounded-full" style={{ background: "#6e6144" }} />
            <span className="h-[9px] w-[9px] rounded-full" style={{ background: "#44604e" }} />
          </span>
          <span
            className="inline-flex items-center gap-1.5 rounded-t-md border border-b-0 px-3 py-[5px] font-mono text-[10.5px]"
            style={{ background: "#12101d", borderColor: "#2a2838", color: SOFT }}
          >
            <span className="h-[7px] w-[7px] rounded-[2px]" style={{ background: RUN }} />
            run_pipeline.py
          </span>
        </div>

        {/* ------------------------------------------------ header strip */}
        <div
          className="relative overflow-hidden border-b px-4 py-3"
          style={{ background: "#15121f", borderColor: "#2a2838" }}
          aria-hidden
        >
          {/* fake-refresh shimmer (honest: the label below says replay) */}
          <div
            ref={reg("hdr-shimmer")}
            className="pointer-events-none absolute inset-y-0 w-1/3"
            style={{
              background: "linear-gradient(105deg, transparent, rgba(251,191,36,0.07), transparent)",
              transform: "translateX(-110%)",
              opacity: 0,
              willChange: "transform",
            }}
          />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span ref={reg("hdr-status")} className="font-mono text-[12px] font-bold tracking-[0.12em]" style={{ color: RUN }}>
              ● RUNNING
            </span>
            <span className="font-mono text-[11.5px]" style={{ color: SOFT }}>
              artemis spatial pipeline · 5 datasets · GSE194329 + 10x
            </span>
            <span ref={reg("hdr-tasks")} className="font-mono text-[11px]" style={{ color: DIM }}>
              tasks 0 / 25 · 0 done · 0 skipped · 0 failed
            </span>
            <span
              className="ml-auto rounded border px-2 py-[2px] font-mono text-[10px]"
              style={{ color: DIM, borderColor: "#34323f", background: "#0d0b16" }}
            >
              replay of the real runs · condensed
            </span>
          </div>
          <div className="mt-1 font-mono text-[10px]" style={{ color: FAINT }}>
            stage names from run_pipeline.py · counts from the shipped runs · no durations were logged, so none are shown · loops ~28 s
          </div>
        </div>

        {/* ------------------------------------------------ the flowchart */}
        <div className="overflow-x-auto" aria-hidden>
          <div className="flex items-start px-4 py-5 min-w-max">
            {STAGES.map((stage, s) => (
              <div key={stage.no} className="flex items-start">
                {s > 0 && (
                  <svg
                    width={EDGE_W}
                    height={CARD_H}
                    viewBox={`0 0 ${EDGE_W} ${CARD_H}`}
                    className="shrink-0"
                    style={{ display: "block" }}
                  >
                    {DATASETS.map((d, i) => (
                      <path
                        key={d.id}
                        ref={reg(`edge-${s - 1}-${i}`)}
                        d={edgePath(i)}
                        fill="none"
                        stroke={EDGE_OFF}
                        strokeWidth="1.5"
                        strokeDasharray={STAGES[s].skipped ? "4 3" : undefined}
                        style={{ opacity: 0.55, transition: "stroke .35s, opacity .35s" }}
                      />
                    ))}
                    {/* flow dots — one per lane, Okabe–Ito accent, ride the bezier while the edge is active */}
                    {DATASETS.map((d, i) => (
                      <circle
                        key={`fd-${d.id}`}
                        ref={reg(`fdot-${s - 1}-${i}`)}
                        r="2.4"
                        fill={DS_COLOR[d.id]}
                        opacity="0"
                        style={{ transition: "opacity .25s" }}
                      />
                    ))}
                  </svg>
                )}

                {/* stage node — mermaid box: 3px status edge + tinted fill */}
                <div
                  className="shrink-0 rounded-md"
                  style={{
                    width: CARD_W,
                    height: CARD_H,
                    background: NODE.pending.bg,
                    borderWidth: "1px 1px 1px 3px",
                    borderStyle: "solid",
                    borderColor: `${NODE.pending.border} ${NODE.pending.border} ${NODE.pending.border} ${NODE.pending.left}`,
                    transition: "background .35s, border-color .35s",
                  }}
                  ref={reg(`card-${s}`)}
                >
                  <div className="px-3 pt-2.5" style={{ height: HEAD_H }}>
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-[10px]" style={{ color: FAINT }}>
                        [{stage.no}/5]
                      </span>
                      <span
                        ref={reg(`chip-${s}`)}
                        className={CHIP.pending.cls}
                        style={{ ...CHIP.pending.style, transition: "color .3s, border-color .3s, background .3s" }}
                      >
                        pending
                      </span>
                    </div>
                    <div className="mt-1 text-[13px] font-semibold leading-tight" style={{ color: INK }}>
                      {stage.name}
                    </div>
                    <div ref={reg(`cnt-${s}`)} className="mt-1 font-mono text-[10.5px] tabular-nums whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: DIM }}>
                      {s === 0 ? `0 / ${TOTAL_SPOTS.toLocaleString("en-US")} spots` : s === 1 ? `0 / ${TOTAL_DOMAINS} domains` : s === 2 ? "0 / 5 portals" : `0 / 5 · ${stage.why}`}
                    </div>
                    {/* thin progress bar — scaleX only */}
                    <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full" style={{ background: "#0d0b16" }}>
                      <div
                        ref={reg(`bar-${s}`)}
                        className="h-full w-full rounded-full"
                        style={{ background: RUN, transform: "scaleX(0)", transformOrigin: "left", willChange: "transform" }}
                      />
                    </div>
                  </div>

                  {/* dataset mini-list — Okabe–Ito lane tick per chip */}
                  <div className="mt-[10px] border-t px-3 pt-1" style={{ borderColor: "#2e2c3a" }}>
                    {DATASETS.map((d, i) => (
                      <div key={d.id} className="flex items-center gap-1.5 font-mono text-[10.5px]" style={{ height: ROW_H }}>
                        <span ref={reg(`dot-${s}-${i}`)} className="w-3 shrink-0 text-center" style={{ color: `${DIM}66` }}>
                          ○
                        </span>
                        <span
                          ref={reg(`tick-${s}-${i}`)}
                          className="h-[10px] w-[3px] shrink-0 rounded-sm"
                          style={{ background: DS_COLOR[d.id], opacity: 0.35, transition: "opacity .3s" }}
                        />
                        <span ref={reg(`rown-${s}-${i}`)} className="truncate" style={{ color: `${DIM}77`, transition: "color .3s" }}>
                          {d.id}
                        </span>
                        <span ref={reg(`det-${s}-${i}`)} className="ml-auto tabular-nums text-right" style={{ color: FAINT }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ------------------------------------------------ log footer */}
        <div
          className="flex items-center gap-2 border-t px-4 py-2 font-mono text-[11px]"
          style={{ background: "#0d0b16", borderColor: "#2a2838" }}
          aria-hidden
        >
          <span style={{ color: FAINT }}>›</span>
          <span ref={reg("log")} className="truncate" style={{ color: FAINT }}>
            waiting for first hand-off …
          </span>
        </div>
      </div>

      <p className="mt-3 text-[13.5px] text-dim leading-relaxed">
        <span className="font-semibold text-snow">Fig. 6&nbsp;|</span> The pipeline as a live board — five public glioma
        datasets replayed through the real five-stage run (stage names from run_pipeline.py; counts from the shipped
        runs). Condensed replay, not a live cluster.
      </p>
    </figure>
  );
}
