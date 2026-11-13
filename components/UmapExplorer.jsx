"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";

// Sequential teal ramp for marker expression — one hue, light→dark, on cream.
const RAMP_LO = [217, 232, 228]; // barely-teal paper
const RAMP_HI = [11, 63, 58]; // deep teal ink
const INK = [28, 26, 21]; // body ink (--color-snow) — "no color yet" spots

const TWEEN_MS = 700;

// ——— the story ———————————————————————————————————————————————————————
// A scripted autoplay loop that teaches cell typing + gene-expression gating.
// Beats are driven off one rAF clock; captions are fixed copy (audited — do
// not reword numbers). Any click pauses; the button replays.
const GATE_MAX = 0.45; // settle point of the EGFR threshold sweep (log-norm)
const GATE_SWEEP_FRAC = 0.62; // fraction of the gating beat spent sweeping up

const BEATS = [
  {
    dur: 4200, // TISSUE — spatial coords, all spots ink
    caption: "1,775 spots, exactly where they sat in the tumor.",
  },
  {
    dur: 4600, // GENE ON — color by EGFR
    caption:
      "Each spot measured ~36,601 genes. Here's one — EGFR, an RTK amplified in many GBMs.",
  },
  {
    dur: 6200, // GATING — threshold sweep, dim below cutoff
    caption:
      "Gating: keep what's above threshold. This is how flow cytometrists have typed cells for decades — one gene at a time.",
  },
  {
    dur: 4800, // MANY GENES — domain labels, still in tissue space
    caption:
      "Clustering does this with all genes at once — spots with similar whole-transcriptome profiles get one label.",
  },
  {
    dur: 5200, // FOLD — tween to the 0.1·1.0 UMAP
    caption:
      "UMAP folds those thousands of dimensions into two. Neighbors stay neighbors; distances lie.",
  },
  {
    dur: 4200, // INTERROGATE — hop through the other parameterizations
    caption:
      "Same data, same graph, different dials — if a conclusion survives every view, it's probably real.",
  },
  {
    dur: 3400, // END — hand over the controls
    caption: "Now you drive.",
  },
];

function hexToRgb(hex) {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function UmapExplorer() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const [data, setData] = useState(null);
  const [active, setActive] = useState(0); // tissue first — then watch it fold into UMAP
  const [colorBy, setColorBy] = useState("domain");
  const [focus, setFocus] = useState(null); // domain index or null
  const [tip, setTip] = useState(null); // {x, y, i}

  // Story state. React state drives chrome (button label, caption strip,
  // legend fade); the per-frame clock lives in refs so nothing re-renders
  // at 60fps.
  const [story, setStory] = useState("idle"); // idle | playing | paused | done
  const [beatIdx, setBeatIdx] = useState(0);
  const [ctrlGlow, setCtrlGlow] = useState(false);
  const [reduced, setReduced] = useState(false);
  const storyRef = useRef({ raf: 0, t0: 0, beat: 0, hop: 0, playing: false, playedOnce: false });
  const fx = useRef({ ink: false, gate: null }); // story overlays read by draw()
  const capRef = useRef(null); // typewriter target

  // Mutable animation state lives outside React.
  const anim = useRef({ pos: null, from: null, to: null, t0: 0, running: false, raf: 0 });
  const view = useRef({ colorBy: "domain", focus: null, tip: null });
  view.current = { colorBy, focus, tip, setting: active };

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
        const s = d.settings[0];
        const pos = new Float32Array(n * 2);
        for (let i = 0; i < n; i++) {
          pos[i * 2] = s.x[i];
          pos[i * 2 + 1] = s.y[i];
        }
        anim.current.pos = pos;
        setData(d);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const draw = useCallback(() => {
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
    const { ink, gate } = fx.current;
    const pad = 18;
    const sw = w - pad * 2;
    const sh = h - pad * 2;
    const n = data.n_shown;
    const labels = data.labels;
    const pal = data.palette.map(hexToRgb);

    let vals = null;
    let vmax = 1;
    if (cb !== "domain") {
      vals = data.markers[cb];
      vmax = (data._max && data._max[cb]) || 1;
    }
    const gateVals = gate ? data.markers[gate.marker] : null;

    for (let i = 0; i < n; i++) {
      const x = pad + a.pos[i * 2] * sw;
      const y = pad + (1 - a.pos[i * 2 + 1]) * sh; // UMAP y points up
      let rgb;
      if (ink) {
        rgb = INK; // story beat 1: no colors yet — just positions
      } else if (cb === "domain") {
        rgb = pal[labels[i]];
      } else {
        const t = vals[i] / vmax;
        rgb = [
          RAMP_LO[0] + (RAMP_HI[0] - RAMP_LO[0]) * t,
          RAMP_LO[1] + (RAMP_HI[1] - RAMP_LO[1]) * t,
          RAMP_LO[2] + (RAMP_HI[2] - RAMP_LO[2]) * t,
        ];
      }
      const dimmed = fo !== null && labels[i] !== fo;
      let alpha = dimmed ? 0.08 : 0.85;
      if (gateVals) alpha = gateVals[i] >= gate.cutoff ? 0.9 : 0.06; // the gate
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb[0] | 0},${rgb[1] | 0},${rgb[2] | 0},${alpha})`;
      ctx.fill();
    }

    // hovered point: ring it so the tooltip has an anchor
    if (tp !== null && tp.i >= 0) {
      const i = tp.i;
      const x = pad + a.pos[i * 2] * sw;
      const y = pad + (1 - a.pos[i * 2 + 1]) * sh;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(28,26,21,0.85)";
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }

    // In-canvas watermark of the active setting. NOTE: Canvas2D font strings
    // cannot use CSS vars — hardcode the face.
    ctx.font = "500 11px 'JetBrains Mono', ui-monospace, monospace";
    ctx.fillStyle = "rgba(95,91,80,0.9)";
    const st = data.settings[view.current.setting] || data.settings[0];
    ctx.fillText(st.id === "tissue" ? "tissue coordinates — no embedding" : `min_dist=${st.min_dist}  spread=${st.spread}`, pad, h - 6);

    // Live gate readout (story beat 3) — the moving cutoff, in mono.
    if (gate) {
      ctx.font = "600 13px 'JetBrains Mono', ui-monospace, monospace";
      ctx.fillStyle = "rgba(17,94,89,0.95)";
      ctx.textAlign = "right";
      ctx.fillText(`gate: ${gate.marker} ≥ ${gate.cutoff.toFixed(2)}`, w - pad, pad + 8);
      ctx.textAlign = "left";
    }
  }, [data]);

  // Redraw on any view-state change (no tween needed).
  useEffect(() => {
    if (!anim.current.running) draw();
  }, [draw, colorBy, focus, tip, data, active]);

  // Resize → redraw.
  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(() => {
      if (!anim.current.running) draw();
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [draw]);

  // Parameter switch → tween every point to the new embedding.
  const goTo = useCallback(
    (si) => {
      setActive(si);
      const a = anim.current;
      if (!data || !a.pos) return;
      const n = data.n_shown;
      const s = data.settings[si];
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const to = new Float32Array(n * 2);
      for (let i = 0; i < n; i++) {
        to[i * 2] = s.x[i];
        to[i * 2 + 1] = s.y[i];
      }
      cancelAnimationFrame(a.raf);
      if (reduce) {
        a.pos = to;
        a.running = false;
        draw();
        return;
      }
      a.from = a.pos.slice();
      a.to = to;
      a.t0 = performance.now();
      a.running = true;
      const step = (now) => {
        const t = Math.min(1, (now - a.t0) / TWEEN_MS);
        const e = easeInOut(t);
        for (let i = 0; i < n * 2; i++) a.pos[i] = a.from[i] + (a.to[i] - a.from[i]) * e;
        draw();
        if (t < 1) a.raf = requestAnimationFrame(step);
        else a.running = false;
      };
      a.raf = requestAnimationFrame(step);
    },
    [data, draw]
  );

  // Latest goTo, reachable from the story clock without re-subscribing.
  const goToRef = useRef(goTo);
  goToRef.current = goTo;

  // ——— story engine: one rAF clock drives every beat ————————————————————
  const enterBeat = useCallback((bi) => {
    const go = goToRef.current;
    switch (bi) {
      case 0: // TISSUE — spatial coords, everything ink
        fx.current.ink = true;
        fx.current.gate = null;
        setColorBy("domain");
        setFocus(null);
        setTip(null);
        go(0);
        break;
      case 1: // GENE ON — EGFR ramp
        fx.current.ink = false;
        setColorBy("EGFR");
        break;
      case 2: // GATING — threshold sweep starts at 0
        fx.current.gate = { marker: "EGFR", cutoff: 0 };
        break;
      case 3: // MANY GENES — drop the gate, label every spot
        fx.current.gate = null;
        setColorBy("domain");
        break;
      case 4: // FOLD — tissue → 0.1·1.0 UMAP
        go(2);
        break;
      case 5: // INTERROGATE — hop the other parameterizations
        storyRef.current.hop = 0;
        go(3);
        break;
      case 6: // END — settle on 0.1·1.0, hand over the dials
        go(2);
        setCtrlGlow(true);
        break;
    }
  }, []);

  const finishStory = useCallback(() => {
    const s = storyRef.current;
    s.playing = false;
    cancelAnimationFrame(s.raf);
    fx.current.ink = false;
    fx.current.gate = null;
    setCtrlGlow(false);
    setStory("done");
    if (capRef.current) capRef.current.textContent = BEATS[BEATS.length - 1].caption;
  }, []);

  const tick = useCallback(
    (now) => {
      const s = storyRef.current;
      if (!s.playing) return;
      let t = now - s.t0;
      if (t >= BEATS[s.beat].dur) {
        if (s.beat >= BEATS.length - 1) {
          finishStory();
          return;
        }
        s.beat += 1;
        s.t0 = now;
        t = 0;
        setBeatIdx(s.beat);
        enterBeat(s.beat);
      }
      const beat = BEATS[s.beat];

      // Typewriter: caption fills over the first ~45% of the beat.
      if (capRef.current) {
        const cap = beat.caption;
        const chars = Math.min(cap.length, Math.ceil((t / (beat.dur * 0.45)) * cap.length));
        capRef.current.textContent = cap.slice(0, chars);
      }

      // Beat 3 (index 2): sweep the EGFR cutoff up, then hold it high.
      if (s.beat === 2 && fx.current.gate) {
        const p = Math.min(1, t / (beat.dur * GATE_SWEEP_FRAC));
        fx.current.gate.cutoff = easeInOut(p) * GATE_MAX;
        draw();
      }

      // Beat 6 (index 5): hop through the remaining parameterizations.
      if (s.beat === 5) {
        if (t > 1300 && s.hop < 1) {
          s.hop = 1;
          goToRef.current(4);
        } else if (t > 2600 && s.hop < 2) {
          s.hop = 2;
          goToRef.current(1);
        }
      }

      s.raf = requestAnimationFrame(tick);
    },
    [draw, enterBeat, finishStory]
  );

  const startStory = useCallback(() => {
    const s = storyRef.current;
    cancelAnimationFrame(s.raf);
    s.playedOnce = true;
    s.beat = 0;
    s.hop = 0;
    s.playing = true;
    s.t0 = performance.now();
    setBeatIdx(0);
    setCtrlGlow(false);
    setStory("playing");
    enterBeat(0);
    s.raf = requestAnimationFrame(tick);
  }, [enterBeat, tick]);

  const pauseStory = useCallback(() => {
    const s = storyRef.current;
    if (!s.playing) return;
    s.playing = false;
    cancelAnimationFrame(s.raf);
    // Hand the canvas back clean: no story overlays while paused.
    fx.current.ink = false;
    fx.current.gate = null;
    setCtrlGlow(false);
    setStory("paused");
    if (capRef.current) capRef.current.textContent = BEATS[s.beat].caption;
    if (!anim.current.running) draw();
  }, [draw]);

  const resumeStory = useCallback(() => {
    const s = storyRef.current;
    if (s.playing) return;
    s.playing = true;
    s.t0 = performance.now(); // beat restarts from its top — deterministic
    setStory("playing");
    enterBeat(s.beat);
    s.raf = requestAnimationFrame(tick);
  }, [enterBeat, tick]);

  // Any real interaction pauses the show.
  const userInterrupt = useCallback(() => {
    if (storyRef.current.playing) pauseStory();
  }, [pauseStory]);

  // Autoplay ONCE when the figure first becomes ≥60% visible.
  useEffect(() => {
    if (!data || reduced) return;
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.intersectionRatio >= 0.6 && !storyRef.current.playedOnce) startStory();
        }
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [data, reduced, startStory]);

  useEffect(
    () => () => {
      cancelAnimationFrame(anim.current.raf);
      cancelAnimationFrame(storyRef.current.raf);
    },
    []
  );

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
        const pad = 18;
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

  // Precompute marker maxima once.
  useEffect(() => {
    if (!data || data._max) return;
    data._max = {};
    for (const g of Object.keys(data.markers)) {
      data._max[g] = Math.max(...data.markers[g]);
    }
  }, [data]);

  const markers = data ? Object.keys(data.markers) : [];
  const setting = data ? data.settings[active] : null;

  const playLabel =
    story === "playing" ? "⏸ pause" : story === "paused" ? "▶ resume" : story === "done" ? "↺ replay" : "▶ play the story";
  const onPlayClick = () => {
    if (story === "playing") pauseStory();
    else if (story === "paused") resumeStory();
    else startStory();
  };

  return (
    <section id="umap-interrogated" className="px-6 md:px-14 py-28 max-w-7xl mx-auto">
      <Reveal>
        <p className="font-mono text-sm text-violet mb-4">07 · FIGURES, INTERROGATED</p>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl">
          One UMAP is a <span className="text-violet">choice</span>, not a fact.
        </h2>
        <p className="mt-5 max-w-2xl text-lg text-dim leading-relaxed">
          This page has shown you a lot of figures by now — a good reviewer asks how
          much of each one was a choice.
          Every embedding you have ever been shown was one point in a parameter space —
          and the picture moves when the parameters move. So instead of curating the
          prettiest view, we hand you the dials: the same section, the same neighbors
          graph, four parameterizations. Confirmation bias dies in the comparison.
        </p>
      </Reveal>

      <Reveal className="mt-10">
        <div
          className="rounded-[4px] border border-line bg-panel p-4 md:p-6"
          data-story-state={story}
          data-story-beat={beatIdx}
        >
          {/* controls row */}
          <div
            className={`flex flex-wrap items-center gap-2 rounded-[3px] transition-shadow duration-500 ${
              ctrlGlow ? "ring-2 ring-violet ring-offset-2 ring-offset-panel" : ""
            }`}
          >
            {!reduced && (
              <button
                onClick={onPlayClick}
                className="font-mono text-[12px] px-3 py-1.5 rounded-[3px] border border-violet-deep bg-violet-deep text-ink cursor-pointer transition-opacity hover:opacity-85 mr-2"
                data-story-play
              >
                {playLabel}
              </button>
            )}
            <span className="font-mono text-[11px] tracking-[0.2em] text-dim uppercase mr-1">
              space
            </span>
            {data &&
              data.settings.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => {
                    userInterrupt();
                    goTo(i);
                  }}
                  className={`font-mono text-[12px] px-3 py-1.5 rounded-[3px] border transition-colors cursor-pointer ${
                    i === active
                      ? "bg-violet-deep text-ink border-violet-deep"
                      : "border-line text-dim hover:text-snow hover:border-snow/50"
                  }`}
                >
                  {s.id === "tissue" ? "tissue (x,y)" : `${s.min_dist} · ${s.spread}`}
                </button>
              ))}
            <span className="flex-1" />
            <span className="font-mono text-[11px] tracking-[0.2em] text-dim uppercase mr-1">
              color
            </span>
            {["domain", ...markers].map((m) => (
              <button
                key={m}
                onClick={() => {
                  userInterrupt();
                  setColorBy(m);
                }}
                className={`font-mono text-[12px] px-3 py-1.5 rounded-[3px] border transition-colors cursor-pointer ${
                  m === colorBy
                    ? "bg-violet-deep text-ink border-violet-deep"
                    : "border-line text-dim hover:text-snow hover:border-snow/50"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* canvas */}
          <div ref={wrapRef} className="relative mt-4 h-[420px] md:h-[520px]">
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full cursor-crosshair"
              onMouseMove={onMove}
              onMouseLeave={() => setTip(null)}
              onPointerDown={userInterrupt}
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

          {/* narration strip — fixed under the canvas while the story runs */}
          {!reduced && story !== "idle" && (
            <div
              className="mt-4 rounded-[3px] border border-line bg-panel px-4 py-3"
              data-story-caption
            >
              <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-violet mb-1">
                story · {beatIdx + 1}/{BEATS.length}
                {story === "paused" && " · paused"}
              </p>
              <p ref={capRef} className="text-[14px] text-snow leading-relaxed min-h-[1.5em]">
                {story === "playing" ? "" : BEATS[beatIdx].caption}
              </p>
            </div>
          )}

          {/* reduced motion: the captions carry the teaching — list them */}
          {reduced && (
            <div className="mt-4 rounded-[3px] border border-line bg-panel px-4 py-3">
              <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-violet mb-2">
                the story, step by step
              </p>
              <ol className="list-decimal list-inside space-y-1">
                {BEATS.map((b) => (
                  <li key={b.caption} className="text-[14px] text-snow leading-relaxed">
                    {b.caption}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* domain legend — click to isolate; the story reveals it at beat 4 */}
          {data && (
            <div
              className={`mt-4 flex flex-wrap gap-2 transition-opacity duration-700 ${
                story === "playing" && beatIdx < 3 ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            >
              {data.domains.map((d, i) => (
                <button
                  key={d}
                  onClick={() => {
                    userInterrupt();
                    setFocus(focus === i ? null : i);
                  }}
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
                  {d} · {data.domain_counts[i]}
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
          <span className="font-semibold text-snow">Fig. 6&nbsp;|</span> The same spots,
          four embeddings computed offline from the same neighbors graph (fixed seed), animated between as you switch — watch clusters merge, split, and
          drift while their labels never change. GBM3, Ren et al. 2023 (GSE194329);
          same neighbors graph, four UMAP parameterizations; every view computed, none
          curated.
        </p>
      </Reveal>
    </section>
  );
}
