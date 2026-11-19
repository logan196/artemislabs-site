"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Option C — the hero is the analysis, not the specimen.
 *
 * A, B and the Voronoi version were all the same thing underneath: a picture
 * of tissue with type on top. The treatment changed; the category didn't. What
 * Artemis sells is not the section — it's what happens to the section.
 *
 * So this runs the pipeline on screen, on the real thing: 4,764 spots from
 * GBM1, their actual coordinates, their actual BANKSY-resolved cell states.
 * The spots land undifferentiated — the state a client's data arrives in —
 * and then resolve into annotated domains. Every count on screen is derived
 * from the payload at render time. Nothing here is a literal.
 */

const SRC = "/banksy_gbm1.json";

// Categorical, not a single accent ramped: these are identities, not values.
// Ordered to match the payload's own state list.
const STATE_COLORS = [
  "#7cc3ff", // oligodendrocytes
  "#ffd166", // astrocytes
  "#ef7a85", // NPC-like tumor cells
  "#c792ea", // MES-like tumor cells
  "#14b8a6", // microglia/TAMs
  "#9aa7b2", // pericytes/smooth muscle
];

const RAW = "#5a6472"; // undifferentiated: what arrives before anything is called

const LAND = 1.0; // seconds for the raw cloud to arrive
const HOLD = 0.75; // seconds it sits unresolved, so the "before" registers
const RESOLVE = 1.5; // seconds for states to separate out

function smoothstep(e0, e1, x) {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

export default function HeroAnalysis({ className = "", onStats }) {
  const canvasRef = useRef(null);
  const [stats, setStats] = useState(null);
  const [phase, setPhase] = useState("raw");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let spots = null;
    let states = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let start = 0;
    let visible = true;
    let alive = true;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // Fit the section into the frame without distorting it, biased left so the
    // headline column has room.
    const layout = () => {
      const pad = 28;
      const availW = w * (w > 900 ? 0.52 : 1) - pad * 2;
      const availH = h - pad * 2;
      const scale = Math.min(availW, availH * 1.02);
      const ox = w > 900 ? w * 0.46 + (availW - scale) / 2 + pad : (w - scale) / 2;
      const oy = (h - scale * 0.95) / 2 - 18;
      return { scale, ox, oy };
    };

    const paint = (t) => {
      ctx.clearRect(0, 0, w, h);
      if (!spots) return;
      const { scale, ox, oy } = layout();

      const landed = reduced ? 1 : smoothstep(0, LAND, t);
      const resolved = reduced ? 1 : smoothstep(LAND + HOLD, LAND + HOLD + RESOLVE, t);

      const r = w > 900 ? 1.9 : 1.5;
      for (let i = 0; i < spots.length; i++) {
        const s = spots[i];
        // each spot has its own moment of arrival and of being called
        const own = (i % 997) / 997;
        const a = smoothstep(0, 0.65, landed - own * 0.35);
        if (a <= 0.01) continue;
        const call = smoothstep(0, 0.6, resolved - own * 0.4);

        const x = ox + s[0] * scale;
        const y = oy + s[1] * scale;

        if (call <= 0.01) {
          ctx.fillStyle = RAW;
          ctx.globalAlpha = a * 0.6;
        } else {
          ctx.fillStyle = STATE_COLORS[s[2]] || RAW;
          ctx.globalAlpha = a * (0.42 + call * 0.5);
        }
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
      ctx.globalAlpha = 1;
    };

    const frame = (now) => {
      if (!alive) return;
      if (!start) start = now;
      const t = (now - start) / 1000;
      paint(t);
      if (!reduced) {
        if (t > LAND + HOLD - 0.05 && t < LAND + HOLD + RESOLVE) setPhase("resolving");
        if (t >= LAND + HOLD + RESOLVE) setPhase("resolved");
      } else {
        setPhase("resolved");
      }
      if (reduced) return;
      // the figure is static once resolved — stop rather than repaint it
      if (t > LAND + HOLD + RESOLVE + 0.5) return;
      if (visible) raf = requestAnimationFrame(frame);
    };

    const restart = () => {
      cancelAnimationFrame(raf);
      resize();
      start = 0;
      if (visible || reduced) raf = requestAnimationFrame(frame);
    };

    fetch(SRC)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        spots = d.spots;
        states = d.states || [];
        // every number shown is counted from the payload, never written down
        const counts = new Array(states.length).fill(0);
        for (const s of spots) counts[s[2]] = (counts[s[2]] || 0) + 1;
        const summary = {
          total: spots.length,
          states: states
            .map((name, i) => ({ name, n: counts[i], color: STATE_COLORS[i] || RAW }))
            .sort((a, b) => b.n - a.n),
        };
        setStats(summary);
        onStats?.(summary);
        restart();
      })
      .catch(() => {});

    resize();

    let resizeTimer = 0;
    let roPrimed = false;
    const ro = new ResizeObserver(() => {
      if (!roPrimed) { roPrimed = true; return; }
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(restart, 180);
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible && !reduced && spots) {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(frame);
        }
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      ro.disconnect();
      io.disconnect();
    };
  }, [onStats]);

  return (
    <>
      <canvas ref={canvasRef} className={className} aria-hidden="true" />
      {/* The legend is the proof: real names, real counts, summing to the real
          total. It is also the live status line for the pass. */}
      {stats && (
        <div className="pointer-events-none absolute bottom-5 right-5 z-20 hidden w-[246px] rounded-[4px] border border-line bg-ink/88 px-3.5 py-3 text-right backdrop-blur-sm lg:block">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#93a7ad]">
            {phase === "resolved"
              ? `${stats.states.length} states · ${stats.total.toLocaleString()} spots`
              : phase === "resolving"
              ? "resolving cell states…"
              : `${stats.total.toLocaleString()} spots · unresolved`}
          </p>
          <ul className="mt-2.5 space-y-1">
            {stats.states.map((s) => (
              <li
                key={s.name}
                className="flex items-center justify-end gap-2 font-mono text-[10.5px] text-[#aab8be] transition-opacity duration-700"
                style={{ opacity: phase === "raw" ? 0 : 1 }}
              >
                <span className="tabular-nums">{s.n.toLocaleString()}</span>
                <span className="truncate">{s.name}</span>
                <span className="h-[7px] w-[7px] shrink-0" style={{ background: s.color }} />
              </li>
            ))}
          </ul>
          <p className="mt-2.5 font-mono text-[9.5px] leading-relaxed tracking-[0.08em] text-[#6f8187]">
            GBM1 · BANKSY-resolved domains · states model-annotated
          </p>
        </div>
      )}
    </>
  );
}
