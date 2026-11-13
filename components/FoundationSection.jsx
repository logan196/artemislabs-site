"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Reveal from "./Reveal";

/* ---------------------------------------------------------------------------
 * Ambient "model reads the slide" concept animation.
 *
 * A reticle glides along a DETERMINISTIC waypoint path over the H&E side of
 * the compare slider, with a mono readout chip cycling concept-only text.
 * Twice per cycle the scan pauses and the slider handle glides itself a few
 * hundred px, then returns. Everything here is explicitly labeled as a
 * concept animation — it is NOT a live model and never implies real output.
 *
 * Gating: IntersectionObserver (useInView) — nothing runs off-screen.
 * Stops permanently on first user interaction. prefers-reduced-motion → off.
 * ------------------------------------------------------------------------- */

const PATCH = 140; // reticle size, px

// Deterministic lawnmower-ish path over the H&E (left) side, in % of box.
const WAYPOINTS = [
  { x: 16, y: 26 },
  { x: 32, y: 34 },
  { x: 22, y: 58 },
  { x: 36, y: 68 },
  { x: 13, y: 72 },
  { x: 27, y: 44 },
];
const GLIDE_AFTER = new Set([1, 4]); // after these waypoints, the handle self-demos
const TRAVEL_MS = 1500;
const DWELL_MS = 1700;
const GLIDE_MS = 2600;

// Concept-only readout lines (never real model output).
const READOUT = ["encoding tile…", "embedding: 1×1536", "matching measured states →"];

// Precomputed timeline: travel → dwell per waypoint, with glide interludes.
const SEGMENTS = (() => {
  const segs = [];
  let t = 0;
  let prev = WAYPOINTS[WAYPOINTS.length - 1];
  WAYPOINTS.forEach((wp, i) => {
    segs.push({ kind: "travel", from: prev, to: wp, start: t, dur: TRAVEL_MS });
    t += TRAVEL_MS;
    segs.push({ kind: "dwell", at: wp, start: t, dur: DWELL_MS });
    t += DWELL_MS;
    if (GLIDE_AFTER.has(i)) {
      segs.push({ kind: "glide", at: wp, start: t, dur: GLIDE_MS });
      t += GLIDE_MS;
    }
    prev = wp;
  });
  return { segs, total: t };
})();

const easeInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

// Deterministic faint "attention" tick opacities for the reticle grid.
const TICKS = [35, 70, 105];
const TICK_CELLS = TICKS.flatMap((x, i) =>
  TICKS.map((y, j) => ({ x, y, o: 0.18 + 0.5 * (((i * 7 + j * 13) % 5) / 5) }))
);

function ScanReticle({ patchRef, chipText }) {
  return (
    <div
      ref={patchRef}
      aria-hidden="true"
      className="absolute left-0 top-0 pointer-events-none will-change-transform opacity-0 transition-opacity duration-500"
      style={{ width: PATCH, height: PATCH }}
    >
      <div className="absolute inset-0 rounded-[6px] border border-[#2dd4bf]/90 bg-[#0f766e]/10 shadow-[0_0_24px_rgba(45,212,191,0.45)]" />
      {/* faint teal attention grid */}
      <svg viewBox="0 0 140 140" className="absolute inset-0 w-full h-full" fill="none">
        {TICKS.map((v) => (
          <line key={`v${v}`} x1={v} y1={10} x2={v} y2={130} stroke="#99f6e4" strokeOpacity="0.35" strokeWidth="1" />
        ))}
        {TICKS.map((v) => (
          <line key={`h${v}`} x1={10} y1={v} x2={130} y2={v} stroke="#99f6e4" strokeOpacity="0.35" strokeWidth="1" />
        ))}
        {TICK_CELLS.map((c, i) => (
          <g key={i} stroke="#99f6e4" strokeOpacity={Math.min(1, c.o + 0.2)} strokeWidth="1.4">
            <line x1={c.x - 3.5} y1={c.y} x2={c.x + 3.5} y2={c.y} />
            <line x1={c.x} y1={c.y - 3.5} x2={c.x} y2={c.y + 3.5} />
          </g>
        ))}
        {/* corner brackets */}
        {[
          "M4 16 V4 H16",
          "M124 4 H136 V16",
          "M136 124 V136 H124",
          "M16 136 H4 V124",
        ].map((d) => (
          <path key={d} d={d} stroke="#5eead4" strokeOpacity="1" strokeWidth="2" />
        ))}
      </svg>
      {/* mono readout chip — concept text only */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap font-mono text-[11px] leading-none bg-snow/90 text-ink border border-[#2dd4bf]/50 rounded-[3px] px-2.5 py-1.5 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#5eead4]" />
        {chipText}
      </div>
    </div>
  );
}

// Before/after drag slider: H&E (left) vs measured cell states (right).
// User-driven; the ambient scan above is a labeled concept animation that
// yields instantly and permanently on first interaction.
function CompareSlider() {
  const ref = useRef(null);
  const patchRef = useRef(null);
  const lastKind = useRef(null);
  const lineRef = useRef(0);
  const interactedRef = useRef(false);
  const dragging = useRef(false);
  const [pos, setPos] = useState(50); // % of width revealed as H&E
  const [line, setLineState] = useState(0);
  const [interacted, setInteracted] = useState(false);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { amount: 0.3 });

  const scanActive = inView && !interacted && !reduced;

  const markInteracted = useCallback(() => {
    if (!interactedRef.current) {
      interactedRef.current = true;
      setInteracted(true);
    }
  }, []);

  const setFromClientX = useCallback((clientX) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const pct = ((clientX - r.left) / r.width) * 100;
    setPos(Math.min(100, Math.max(0, pct)));
  }, []);

  // Ambient scan loop — rAF, transform/opacity only, fully deterministic.
  useEffect(() => {
    if (!scanActive) return;
    const patch = patchRef.current;
    const box = ref.current;
    if (!patch || !box) return;
    if (box.clientWidth < 560) return; // skip on small screens — slider stays clean

    const setLine = (n) => {
      if (lineRef.current !== n) {
        lineRef.current = n;
        setLineState(n);
      }
    };

    let raf;
    const t0 = performance.now();
    patch.style.opacity = "1";

    const step = (now) => {
      const t = (now - t0) % SEGMENTS.total;
      const seg =
        SEGMENTS.segs.find((s) => t >= s.start && t < s.start + s.dur) || SEGMENTS.segs[0];
      const p = Math.min(1, (t - seg.start) / seg.dur);

      let x, y;
      if (seg.kind === "travel") {
        const e = easeInOut(p);
        x = seg.from.x + (seg.to.x - seg.from.x) * e;
        y = seg.from.y + (seg.to.y - seg.from.y) * e;
        setLine(0);
      } else {
        x = seg.at.x;
        y = seg.at.y;
        setLine(seg.kind === "dwell" ? Math.min(2, Math.floor(p * 3)) : 2);
      }

      // Self-demo: handle glides out ~300px and back, then returns control.
      if (seg.kind === "glide") {
        setPos(50 + 27 * Math.sin(Math.PI * p));
      } else if (lastKind.current === "glide") {
        setPos(50);
      }
      lastKind.current = seg.kind;

      const w = box.clientWidth;
      const h = box.clientHeight;
      const tx = Math.min(Math.max((x / 100) * w - PATCH / 2, 6), w - PATCH - 6);
      const ty = Math.min(Math.max((y / 100) * h - PATCH / 2, 6), h - PATCH - 40);
      patch.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      patch.style.opacity = "0";
      lastKind.current = null;
      if (!interactedRef.current) setPos(50);
    };
  }, [scanActive]);

  const onPointerDown = (e) => {
    markInteracted();
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    setFromClientX(e.clientX);
  };
  const onPointerMove = (e) => {
    if (dragging.current) setFromClientX(e.clientX);
  };
  const onPointerUp = () => {
    dragging.current = false;
  };
  const onKeyDown = (e) => {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      markInteracted();
      setPos((p) => Math.max(0, p - step));
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      markInteracted();
      setPos((p) => Math.min(100, p + step));
    } else if (e.key === "Home") {
      e.preventDefault();
      markInteracted();
      setPos(0);
    } else if (e.key === "End") {
      e.preventDefault();
      markInteracted();
      setPos(100);
    }
  };

  return (
    <div>
      {/* dark instrument chrome — Strand-style minimal viewer header */}
      <div className="flex items-center justify-between gap-4 bg-snow px-4 py-2.5">
        <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink/60 truncate">
          viewer · AT14-BRA-4-FO-2_1 · H&E ⇄ measured states
        </span>
        <span className="flex items-center gap-2 font-mono text-[10px] tracking-wide text-[#5eead4] shrink-0">
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-[#5eead4]"
            animate={scanActive ? { opacity: [1, 0.25, 1] } : { opacity: 0.35 }}
            transition={scanActive ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
          />
          {scanActive ? "ambient scan — concept" : "scan idle — drag to compare"}
        </span>
      </div>

      <div
        ref={ref}
        role="slider"
        tabIndex={0}
        aria-label="Drag to compare H&E input with measured cell-state map"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        aria-valuetext={`${Math.round(pos)}% H&E revealed`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        className="relative block aspect-[16/8] overflow-hidden select-none cursor-ew-resize touch-none outline-none focus-visible:ring-2 focus-visible:ring-violet"
      >
        {/* bottom layer: measured cell states (revealed on the right) */}
        <img
          src="dejong/AT14-BRA-4-FO-2_1_overlay.jpg"
          alt="AT14 glioblastoma section with measured cell2location cell-state abundances overlaid"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover object-top pointer-events-none"
        />
        {/* top layer: H&E, clipped to the left of the handle */}
        <img
          src="dejong/AT14-BRA-4-FO-2_1_he.jpg"
          alt="AT14 glioblastoma section, H&E stain"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover object-top pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        />

        {/* ambient scanning reticle — concept animation */}
        <ScanReticle patchRef={patchRef} chipText={READOUT[line]} />

        {/* handle */}
        <div
          className="absolute top-0 bottom-0 w-px bg-snow/90 pointer-events-none"
          style={{ left: `${pos}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-panel border border-snow/70 shadow-[0_2px_10px_rgba(28,26,21,0.35)] flex items-center justify-center text-snow text-sm font-mono">
            ⟷
          </div>
        </div>

        {/* persistent concept tag — this is never a live model */}
        <span className="absolute right-3 top-3 font-mono text-[10px] tracking-wide bg-snow/85 text-ink/90 border border-violet/40 rounded-[3px] px-2 py-1 pointer-events-none">
          concept animation — not a live model
        </span>

        {/* pinned corner labels */}
        <span className="absolute left-3 bottom-3 font-mono text-[11px] tracking-wide bg-ink/90 text-snow border border-line rounded-[3px] px-2.5 py-1 pointer-events-none">
          H&E — input
        </span>
        <span className="absolute right-3 bottom-3 font-mono text-[11px] tracking-wide bg-ink/90 text-snow border border-line rounded-[3px] px-2.5 py-1 pointer-events-none text-right">
          cell2location-estimated states — the training target
          <span className="block text-dim">(cell2location, de Jong et al. 2026)</span>
        </span>
      </div>
    </div>
  );
}

export default function FoundationSection() {
  return (
    <section id="foundation" className="px-6 md:px-14 py-28 max-w-7xl mx-auto">
      <Reveal>
        <p className="font-mono text-sm text-violet mb-4">08 · H&E × FOUNDATION MODELS</p>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl">
          The slide already knows.
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-dim leading-relaxed">
          Every lab has H&E — it costs almost nothing and it's already in the archive;
          spatial profiling costs thousands per section, so almost nobody has it at scale.
          Pathology foundation models (UNI, Virchow, CONCH, Prov-GigaPath) are learning to
          read molecular state straight from morphology — and pairs like the one below are
          exactly the supervision that teaching requires: profiled tissue, not H&E-derived predictions.
        </p>
      </Reveal>

      <Reveal delay={0.08}>
        <figure className="mt-12 rounded-[4px] overflow-hidden border border-snow/60 shadow-[0_18px_50px_-22px_rgba(28,26,21,0.4)] bg-panel">
          <CompareSlider />
          <figcaption className="border-t border-line bg-panel px-5 py-3 text-[13px] text-dim leading-relaxed">
            <span className="font-semibold text-snow">Fig. 7&nbsp;|</span> AT14 section,
            de Jong et al., Nature 2026 (gbmspace.org). Left: H&E. Right: cell2location-estimated
            cell-state abundances (deconvolved from measured Visium) — the supervision pairs for H&E→molecular
            prediction; no H&E-derived predictions shown. Drag the handle (or use
            arrow keys) to compare.
          </figcaption>
        </figure>
        <div className="mt-8 rounded-[4px] border border-violet/40 bg-panel/80 p-6 max-w-3xl">
          <p className="font-mono text-[11px] tracking-[0.25em] text-violet uppercase mb-3">
            virtual staining · early access
          </p>
          <p className="text-[15px] text-dim leading-relaxed">
            Pairs like the one above train the reverse direction too:{" "}
            <span className="text-snow">compute the stain instead of performing it</span> —
            H&amp;E in, molecular overlays out (virtual staining; Rivenson et&nbsp;al.,{" "}
            <em>Nat. Biomed. Eng.</em> 2019). We build it per lab: your slides, your
            measured spatial runs as the labels, your archive unlocked.
          </p>
          <a
            href="mailto:loganbeharry@gmail.com?subject=Artemis%20BioLabs%20%C2%B7%20virtual%20staining%20early%20access"
            className="mt-4 inline-block rounded-[3px] bg-violet-deep text-ink px-5 py-2.5 text-[14px] font-medium hover:bg-violet transition-colors"
          >
            Request early access →
          </a>
        </div>
      </Reveal>
    </section>
  );
}
