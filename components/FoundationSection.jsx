"use client";

import { useCallback, useRef, useState } from "react";
import Reveal from "./Reveal";

// Before/after drag slider: H&E (left) vs measured cell states (right).
// Entirely user-driven — nothing autoplays, so it's reduced-motion safe.
function CompareSlider() {
  const ref = useRef(null);
  const [pos, setPos] = useState(50); // % of width revealed as H&E
  const dragging = useRef(false);

  const setFromClientX = useCallback((clientX) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const pct = ((clientX - r.left) / r.width) * 100;
    setPos(Math.min(100, Math.max(0, pct)));
  }, []);

  const onPointerDown = (e) => {
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
      setPos((p) => Math.max(0, p - step));
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      setPos((p) => Math.min(100, p + step));
    } else if (e.key === "Home") {
      e.preventDefault();
      setPos(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setPos(100);
    }
  };

  return (
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
      {/* handle */}
      <div
        className="absolute top-0 bottom-0 w-px bg-snow/90 pointer-events-none"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-panel border border-snow/70 shadow-[0_2px_10px_rgba(28,26,21,0.35)] flex items-center justify-center text-snow text-sm font-mono">
          ⟷
        </div>
      </div>
      {/* pinned corner labels */}
      <span className="absolute left-3 bottom-3 font-mono text-[11px] tracking-wide bg-ground/90 text-snow border border-line rounded-[3px] px-2.5 py-1 pointer-events-none">
        H&E — input
      </span>
      <span className="absolute right-3 bottom-3 font-mono text-[11px] tracking-wide bg-ground/90 text-snow border border-line rounded-[3px] px-2.5 py-1 pointer-events-none text-right">
        measured cell states — the training target
        <span className="block text-dim">(cell2location, de Jong et al. 2026)</span>
      </span>
    </div>
  );
}

const STEPS = [
  {
    n: "1",
    title: "your archive of H&E slides",
    body: "Every pathology department already has decades of them — stained, scanned, and otherwise silent.",
  },
  {
    n: "2",
    title: "foundation-model embeddings",
    body: "UNI, Virchow-class encoders turn each tile into a vector that already carries morphology's structure.",
  },
  {
    n: "3",
    title: "fine-tuned on your measured spatial pairs",
    body: "Your cell2location maps become the labels → predicted molecular maps on every archived slide.",
    tag: "capability we build with you — not shown as results",
  },
];

const CHIPS = [
  "self-supervised on massive slide archives",
  "embeddings transfer across stains & scanners",
  "your spatial runs become the labels",
];

export default function FoundationSection() {
  return (
    <section id="foundation" className="px-6 md:px-14 py-28 max-w-7xl mx-auto">
      <Reveal>
        <p className="font-mono text-sm text-violet mb-4">05 · H&E × FOUNDATION MODELS</p>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl">
          The slide already knows.
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-dim leading-relaxed">
          Every lab has H&E — it costs almost nothing and it's already in the archive;
          spatial profiling costs thousands per section, so almost nobody has it at scale.
          Pathology foundation models (UNI, Virchow, CONCH, Prov-GigaPath) are learning to
          read molecular state straight from morphology — and pairs like the one below are
          exactly the supervision that teaching requires: measured, not predicted.
        </p>
      </Reveal>

      <Reveal delay={0.08}>
        <figure className="mt-12 rounded-[4px] overflow-hidden border border-snow/60 shadow-[0_18px_50px_-22px_rgba(28,26,21,0.4)] bg-panel">
          <CompareSlider />
          <figcaption className="border-t border-line bg-panel px-5 py-3 text-[13px] text-dim leading-relaxed">
            <span className="font-semibold text-snow">Fig. 6&nbsp;|</span> AT14 section,
            de Jong et al., Nature 2026 (gbmspace.org). Left: H&E. Right: measured
            cell2location cell-state abundances — the supervision pairs for H&E→molecular
            prediction. Measured data; no model predictions shown. Drag the handle (or use
            arrow keys) to compare.
          </figcaption>
        </figure>
      </Reveal>

      {/* 3-step mini-diagram */}
      <Reveal delay={0.12} className="mt-14">
        <div className="relative grid md:grid-cols-3 gap-5 md:gap-10">
          {/* connector line behind the tiles (desktop) */}
          <div
            aria-hidden="true"
            className="hidden md:block absolute top-1/2 left-[8%] right-[8%] h-px bg-violet/40 -z-10"
          />
          {STEPS.map((s, i) => (
            <div key={s.n} className="relative">
              {/* mobile connector */}
              {i > 0 && (
                <div aria-hidden="true" className="md:hidden mx-auto mb-5 h-6 w-px bg-violet/40" />
              )}
              <div className="h-full rounded-[3px] border border-line bg-panel p-6">
                <p className="font-mono text-[11px] tracking-[0.25em] text-violet uppercase mb-3">
                  {s.n} · {s.title}
                </p>
                <p className="text-[14.5px] leading-relaxed text-snow/90">{s.body}</p>
                {s.tag && (
                  <p className="mt-4 inline-block font-mono text-[11px] text-sepia border border-sepia/40 rounded-[3px] px-2.5 py-1">
                    {s.tag}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* why now */}
      <Reveal delay={0.16} className="mt-10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-[11px] tracking-[0.25em] text-dim uppercase mr-1">
            why now
          </span>
          {CHIPS.map((c) => (
            <span
              key={c}
              className="font-mono text-xs text-dim border border-line bg-panel/60 rounded-full px-4 py-1.5"
            >
              {c}
            </span>
          ))}
        </div>
        <p className="mt-6 max-w-2xl text-[15px] text-dim leading-relaxed">
          We haven't trained this model — nobody should claim that lightly. What we do is
          build and fine-tune it <span className="text-snow">per lab</span>: your slides,
          your measured spatial runs as ground truth, your archive unlocked.
        </p>
      </Reveal>
    </section>
  );
}
