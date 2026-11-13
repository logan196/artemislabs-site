"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";

// Sequential teal ramp for marker expression — one hue, light→dark, on cream.
const RAMP_LO = [217, 232, 228]; // barely-teal paper
const RAMP_HI = [11, 63, 58]; // deep teal ink
const INK = "rgba(28,26,21,0.92)";
const HALO = "rgba(255,253,247,0.9)";

// The breathing cycle: hold the tissue, fold into the embedding, hold, unfold.
const HOLD_TISSUE = 2200;
const RISE = 2600;
const HOLD_UMAP = 3600;
const FALL = 2600;
const PERIOD = HOLD_TISSUE + RISE + HOLD_UMAP + FALL;
const SETTING_TWEEN = 700;

function hexToRgb(hex) {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// morph fraction 0 (tissue) → 1 (embedding) over the breathing cycle
function cycleMorph(t) {
  const p = t % PERIOD;
  if (p < HOLD_TISSUE) return 0;
  if (p < HOLD_TISSUE + RISE) return easeInOut((p - HOLD_TISSUE) / RISE);
  if (p < HOLD_TISSUE + RISE + HOLD_UMAP) return 1;
  return 1 - easeInOut((p - HOLD_TISSUE - RISE - HOLD_UMAP) / FALL);
}

const shortName = (d) => d.replace(/\s*\(cells\)\s*/g, "").replace("/smooth muscle", "");

export default function UmapExplorer() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const sliderRef = useRef(null);
  const morphReadout = useRef(null);
  const [data, setData] = useState(null);
  const [active, setActive] = useState(1); // which embedding the tissue folds into
  const [colorBy, setColorBy] = useState("domain");
  const [focus, setFocus] = useState(null); // domain index or null
  const [tip, setTip] = useState(null); // {x, y, i}
  const [auto, setAuto] = useState(true);
  const [reduced, setReduced] = useState(false);

  // Everything that changes at 60fps lives in refs — zero re-renders per frame.
  const anim = useRef({
    pos: null, // displayed positions (Float32Array n*2) — hover reads this
    tissue: null,
    embFrom: null,
    embTo: null,
    embT0: -1e9,
    morph: 0,
    manualMorph: 0,
    raf: 0,
    running: false,
    inView: false,
    he: null, // the H&E Image, once loaded
  });
  const view = useRef({});
  view.current = { colorBy, focus, tip, active, auto };

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    let alive = true;
    fetch("plots/umap_params.json")
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        const n = d.n_shown;
        const tissue = new Float32Array(n * 2);
        const s0 = d.settings[0];
        for (let i = 0; i < n; i++) {
          tissue[i * 2] = s0.x[i];
          tissue[i * 2 + 1] = s0.y[i];
        }
        const emb = new Float32Array(n * 2);
        const s1 = d.settings[1];
        for (let i = 0; i < n; i++) {
          emb[i * 2] = s1.x[i];
          emb[i * 2 + 1] = s1.y[i];
        }
        const a = anim.current;
        a.tissue = tissue;
        a.embFrom = emb;
        a.embTo = emb;
        a.pos = tissue.slice();
        d._max = {};
        for (const g of Object.keys(d.markers)) d._max[g] = Math.max(...d.markers[g]);
        const he = new Image();
        he.onload = () => {
          a.he = he;
        };
        he.src = "gbm/GBM3_he.jpg";
        setData(d);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // One draw. `now` drives the ambient jitter; morph comes from anim.current.morph.
  const draw = useCallback(
    (now) => {
      const canvas = canvasRef.current;
      const a = anim.current;
      if (!canvas || !data || !a.pos) return;
      const ctx = canvas.getContext("2d");
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const { colorBy: cb, focus: fo, tip: tp } = view.current;
      const pad = 22;
      const sw = w - pad * 2;
      const sh = h - pad * 2;
      const n = data.n_shown;
      const labels = data.labels;
      const pal = data.palette.map(hexToRgb);
      const m = a.morph;
      const jitterAmp = reduced ? 0 : 0.0022 * (1 - 0.5 * m); // calmer in embedding

      // blend the active embedding (while a setting switch is tweening)
      const e = easeInOut(Math.min(1, Math.max(0, now - a.embT0) / SETTING_TWEEN));

      let vals = null;
      let vmax = 1;
      if (cb !== "domain") {
        vals = data.markers[cb];
        vmax = data._max[cb] || 1;
      }

      const nd = data.domains.length;
      const cx = new Float64Array(nd);
      const cy = new Float64Array(nd);
      const cn = new Int32Array(nd);

      for (let i = 0; i < n; i++) {
        const ex = a.embFrom[i * 2] + (a.embTo[i * 2] - a.embFrom[i * 2]) * e;
        const ey = a.embFrom[i * 2 + 1] + (a.embTo[i * 2 + 1] - a.embFrom[i * 2 + 1]) * e;
        let px = a.tissue[i * 2] + (ex - a.tissue[i * 2]) * m;
        let py = a.tissue[i * 2 + 1] + (ey - a.tissue[i * 2 + 1]) * m;
        if (jitterAmp) {
          px += Math.sin(now * 0.0012 + i * 2.399) * jitterAmp;
          py += Math.cos(now * 0.0009 + i * 1.713) * jitterAmp;
        }
        a.pos[i * 2] = px;
        a.pos[i * 2 + 1] = py;
        const x = pad + px * sw;
        const y = pad + (1 - py) * sh; // y up
        const li = labels[i];
        cx[li] += x;
        cy[li] += y;
        cn[li] += 1;

        let rgb;
        if (cb === "domain") rgb = pal[li];
        else {
          const t = vals[i] / vmax;
          rgb = [
            RAMP_LO[0] + (RAMP_HI[0] - RAMP_LO[0]) * t,
            RAMP_LO[1] + (RAMP_HI[1] - RAMP_LO[1]) * t,
            RAMP_LO[2] + (RAMP_HI[2] - RAMP_LO[2]) * t,
          ];
        }
        const dimmed = fo !== null && li !== fo;
        const alpha = dimmed ? 0.07 : 0.85;
        ctx.beginPath();
        ctx.arc(x, y, 2.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb[0] | 0},${rgb[1] | 0},${rgb[2] | 0},${alpha})`;
        ctx.fill();
      }

      // cell-type labels ride their cluster centroids through the morph
      if (cb === "domain") {
        ctx.font = "600 11px 'JetBrains Mono', ui-monospace, monospace";
        ctx.textAlign = "left";
        for (let d = 0; d < nd; d++) {
          if (!cn[d]) continue;
          if (fo !== null && fo !== d) continue;
          const lx = cx[d] / cn[d];
          const ly = Math.min(h - 10, Math.max(12, cy[d] / cn[d]));
          const name = shortName(data.domains[d]);
          ctx.beginPath();
          ctx.arc(lx, ly, 3.4, 0, Math.PI * 2);
          ctx.fillStyle = data.palette[d];
          ctx.fill();
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = HALO;
          ctx.stroke();
          // flip the label to the dot's left when it would clip the right edge
          const tw = ctx.measureText(name).width;
          const tx = lx + 7 + tw > w - 6 ? lx - 7 - tw : lx + 7;
          ctx.lineWidth = 3.5;
          ctx.strokeStyle = HALO;
          ctx.strokeText(name, tx, ly + 4);
          ctx.fillStyle = INK;
          ctx.fillText(name, tx, ly + 4);
        }
      }

      // the H&E slide the spots came from — fades in while we're in tissue space
      const heA = Math.max(0, Math.min(1, (0.45 - m) / 0.18));
      if (a.he && heA > 0.01 && w > 560) {
        const iw = Math.min(170, w * 0.22);
        const ih = iw * (a.he.height / a.he.width);
        ctx.save();
        ctx.globalAlpha = heA;
        ctx.fillStyle = "#fffdf7";
        ctx.strokeStyle = "#d8d2c2";
        ctx.lineWidth = 1;
        ctx.fillRect(10, 10, iw + 12, ih + 30);
        ctx.strokeRect(10.5, 10.5, iw + 11, ih + 29);
        ctx.drawImage(a.he, 16, 16, iw, ih);
        ctx.font = "500 10px 'JetBrains Mono', ui-monospace, monospace";
        ctx.fillStyle = "rgba(95,91,80,1)";
        ctx.fillText("GBM3 · the H&E slide", 16, ih + 30);
        ctx.restore();
      }

      // hovered point: ring it so the tooltip has an anchor
      if (tp !== null && tp.i >= 0) {
        const x = pad + a.pos[tp.i * 2] * sw;
        const y = pad + (1 - a.pos[tp.i * 2 + 1]) * sh;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(28,26,21,0.85)";
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      // watermark of where we are between the two spaces
      ctx.font = "500 11px 'JetBrains Mono', ui-monospace, monospace";
      ctx.fillStyle = "rgba(95,91,80,0.9)";
      ctx.textAlign = "left";
      const st = data.settings[view.current.active];
      const where =
        m < 0.04
          ? "tissue coordinates — the section itself"
          : m > 0.96
            ? `umap: min_dist=${st.min_dist} spread=${st.spread}`
            : "folding tissue → embedding…";
      ctx.fillText(where, pad, h - 8);
    },
    [data, reduced]
  );

  // ——— the perpetual loop ————————————————————————————————————————————
  const loop = useCallback(
    (now) => {
      const a = anim.current;
      if (!a.inView) {
        a.running = false;
        return;
      }
      a.morph = view.current.auto ? cycleMorph(now) : a.manualMorph;
      if (sliderRef.current && view.current.auto) {
        sliderRef.current.value = String(Math.round(a.morph * 100));
      }
      draw(now);
      a.raf = requestAnimationFrame(loop);
    },
    [draw]
  );

  // Start/stop with visibility; reduced motion renders once, statically.
  useEffect(() => {
    if (!data) return;
    const el = wrapRef.current;
    if (!el) return;
    if (reduced) {
      anim.current.morph = 1;
      if (sliderRef.current) sliderRef.current.value = "100";
      draw(0);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        const a = anim.current;
        a.inView = entry.isIntersecting;
        if (a.inView && !a.running) {
          a.running = true;
          a.raf = requestAnimationFrame(loop);
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(anim.current.raf);
      anim.current.running = false;
    };
  }, [data, reduced, loop, draw]);

  // Switching the target embedding tweens every point to its new home.
  const goTo = useCallback(
    (si) => {
      const a = anim.current;
      if (!data) return;
      setActive(si);
      const n = data.n_shown;
      const s = data.settings[si];
      const to = new Float32Array(n * 2);
      for (let i = 0; i < n; i++) {
        to[i * 2] = s.x[i];
        to[i * 2 + 1] = s.y[i];
      }
      // freeze the current blend as the new "from", then tween to the new target
      const e = easeInOut(Math.min(1, Math.max(0, performance.now() - a.embT0) / SETTING_TWEEN));
      const frozen = new Float32Array(n * 2);
      for (let i = 0; i < n * 2; i++) frozen[i] = a.embFrom[i] + (a.embTo[i] - a.embFrom[i]) * e;
      a.embFrom = frozen;
      a.embTo = to;
      a.embT0 = performance.now();
      if (reduced) {
        a.embFrom = to;
        draw(0);
      }
    },
    [data, draw, reduced]
  );

  const onSlider = useCallback(
    (ev) => {
      const v = Number(ev.target.value) / 100;
      anim.current.manualMorph = v;
      setAuto(false);
      if (reduced) {
        anim.current.morph = v;
        draw(0);
      }
    },
    [draw, reduced]
  );

  const resumeAuto = useCallback(() => setAuto(true), []);

  // Hover: nearest point within 14px, throttled to one lookup per frame.
  const hoverPending = useRef(false);
  const onMove = useCallback(
    (ev) => {
      if (hoverPending.current || !data || !anim.current.pos) return;
      hoverPending.current = true;
      const { clientX, clientY } = ev;
      requestAnimationFrame(() => {
        hoverPending.current = false;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const mx = clientX - rect.left;
        const my = clientY - rect.top;
        const pad = 22;
        const sw = rect.width - pad * 2;
        const sh = rect.height - pad * 2;
        const pos = anim.current.pos;
        let best = -1;
        let bestD = 14 * 14;
        for (let i = 0; i < data.n_shown; i++) {
          const dx = pad + pos[i * 2] * sw - mx;
          const dy = pad + (1 - pos[i * 2 + 1]) * sh - my;
          const d = dx * dx + dy * dy;
          if (d < bestD) {
            bestD = d;
            best = i;
          }
        }
        setTip(best >= 0 ? { x: mx, y: my, i: best } : null);
      });
    },
    [data]
  );

  const markers = data ? Object.keys(data.markers) : [];
  const setting = data ? data.settings[active] : null;

  return (
    <section id="umap-interrogated" className="px-6 md:px-14 py-28 max-w-7xl mx-auto">
      <Reveal>
        <p className="font-mono text-sm text-violet mb-4">07 · DEMOCRATIZING BIOINFORMATICS</p>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl">
          Your computational biology core, <span className="text-violet">reimagined.</span>
        </h2>
        <p className="mt-5 max-w-2xl text-lg text-dim leading-relaxed">
          <span className="text-snow">The analysis isn&rsquo;t a PDF you receive — it&rsquo;s an
          instrument you hold.</span> Below, 1,775 spots from a public GBM section breathe
          between the tissue they were cut from and the embedding that organizes them.
          Cell types keep their colors and their names the whole way, so you can watch
          morphology become biology — then take the dials yourself: drag the slider,
          switch the parameterization, color by a gene.
        </p>
      </Reveal>

      <Reveal className="mt-10">
        <div className="rounded-[4px] border border-line bg-panel p-4 md:p-6">
          {/* the one control that matters: where between tissue and embedding */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <div className="flex items-center gap-3 flex-1 min-w-[260px]">
              <span className="font-mono text-[11px] tracking-[0.15em] text-dim uppercase shrink-0">
                tissue
              </span>
              <input
                ref={sliderRef}
                type="range"
                min="0"
                max="100"
                defaultValue="0"
                onInput={onSlider}
                onPointerDown={() => setAuto(false)}
                aria-label="Morph between tissue coordinates and UMAP embedding"
                className="flex-1 accent-[#115e59] cursor-pointer"
              />
              <span className="font-mono text-[11px] tracking-[0.15em] text-dim uppercase shrink-0">
                embedding
              </span>
            </div>
            {!reduced && (
              <button
                onClick={auto ? () => setAuto(false) : resumeAuto}
                className={`font-mono text-[12px] px-3 py-1.5 rounded-[3px] border cursor-pointer transition-colors ${
                  auto
                    ? "border-violet-deep bg-violet-deep text-ink"
                    : "border-line text-dim hover:text-snow hover:border-snow/50"
                }`}
              >
                {auto ? "⏸ breathing" : "▶ auto"}
              </button>
            )}
          </div>

          {/* secondary dials */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] tracking-[0.2em] text-dim uppercase mr-1">
              umap dials
            </span>
            {data &&
              data.settings.slice(1).map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => goTo(i + 1)}
                  className={`font-mono text-[12px] px-3 py-1.5 rounded-[3px] border transition-colors cursor-pointer ${
                    i + 1 === active
                      ? "bg-violet-deep text-ink border-violet-deep"
                      : "border-line text-dim hover:text-snow hover:border-snow/50"
                  }`}
                >
                  {s.min_dist} · {s.spread}
                </button>
              ))}
            <span className="flex-1" />
            <span className="font-mono text-[11px] tracking-[0.2em] text-dim uppercase mr-1">
              color
            </span>
            {["domain", ...markers].map((mk) => (
              <button
                key={mk}
                onClick={() => setColorBy(mk)}
                className={`font-mono text-[12px] px-3 py-1.5 rounded-[3px] border transition-colors cursor-pointer ${
                  mk === colorBy
                    ? "bg-violet-deep text-ink border-violet-deep"
                    : "border-line text-dim hover:text-snow hover:border-snow/50"
                }`}
              >
                {mk === "domain" ? "cell type" : mk}
              </button>
            ))}
          </div>

          {/* canvas */}
          <div ref={wrapRef} className="relative mt-4 h-[420px] md:h-[540px]">
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full cursor-crosshair"
              onMouseMove={onMove}
              onMouseLeave={() => setTip(null)}
            />
            {!data && (
              <p className="absolute inset-0 flex items-center justify-center font-mono text-sm text-dim">
                loading embedding…
              </p>
            )}
            {tip && data && (
              <div
                className="pointer-events-none absolute z-10 rounded-[3px] border border-line bg-panel/95 shadow-sm px-3 py-2"
                style={{
                  left: Math.min(tip.x + 14, (wrapRef.current?.clientWidth || 600) - 190),
                  top: Math.max(tip.y - 10, 4),
                }}
              >
                <p className="font-mono text-[12px] text-snow font-semibold">
                  {data.domains[data.labels[tip.i]]}
                </p>
                {markers.map((g) => (
                  <p key={g} className="font-mono text-[11px] text-dim">
                    {g}&nbsp;{data.markers[g][tip.i].toFixed(2)}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* cell types — click to isolate one through the whole morph */}
          {data && (
            <div className="mt-4 flex flex-wrap gap-2">
              {data.domains.map((d, i) => (
                <button
                  key={d}
                  onClick={() => setFocus(focus === i ? null : i)}
                  className={`flex items-center gap-2 font-mono text-[11.5px] px-2.5 py-1 rounded-[3px] border transition-opacity cursor-pointer ${
                    focus === null || focus === i
                      ? "border-line text-snow opacity-100"
                      : "border-line text-dim opacity-40"
                  }`}
                >
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{ background: data.palette[i] }}
                  />
                  {shortName(d)} · {data.domain_counts[i]}
                </button>
              ))}
            </div>
          )}

          {/* provenance */}
          {setting && (
            <div className="mt-4 pt-4 border-t border-line">
              <p className="font-mono text-[11.5px] text-dim leading-relaxed break-all">
                {data.neighbors}
                <br />
                <span className="text-violet">{setting.call}</span>
                <br />
                showing {data.n_shown.toLocaleString()} of {data.n_total.toLocaleString()}{" "}
                spots · fixed seed · marker values log-normalized
              </p>
            </div>
          )}
        </div>
        <p className="mt-2.5 text-[13.5px] text-dim leading-relaxed max-w-3xl">
          <span className="font-semibold text-snow">Fig. 6&nbsp;|</span> A living figure:
          the same 1,775 spots glide between tissue coordinates and four UMAP
          parameterizations computed offline from one shared neighbors graph (fixed
          seed) — cell-type labels ride their clusters through the fold. One UMAP is a
          choice, not a fact; here you hold the dials. GBM3, Ren et al. 2023 (GSE194329);
          every view computed, none curated.
        </p>
      </Reveal>
    </section>
  );
}
