"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// Fixed palette, assigned to real states in order (states are sorted by
// descending count in the JSON). Repeats if there are more states than colors.
const PALETTE = [
  "#0d9488", "#b45309", "#1d4ed8", "#15803d",
  "#7c3aed", "#be123c", "#0369a1", "#a16207",
];

const INK = [28, 26, 21]; // neutral "expression without place" color

function hexToRgb(hex) {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

export default function BanksySection() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end end"] });
  const [data, setData] = useState(null);

  // Real GBM1 section exported by the pipeline (scripts/banksy_web_json.py).
  useEffect(() => {
    let alive = true;
    fetch("banksy_gbm1.json")
      .then((r) => r.json())
      .then((d) => { if (alive) setData(d); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf;

    const { states, spots } = data;
    const stateRgb = states.map((_, i) => hexToRgb(PALETTE[i % PALETTE.length]));
    const counts = states.map(() => 0);
    let maxX = 0, maxY = 0;
    for (const [x, y, s] of spots) {
      counts[s]++;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
    const legend = states
      .map((name, i) => ({ name, count: counts[i], rgb: stateRgb[i] }))
      .slice(0, 6);

    const draw = () => {
      const p = scrollYProgress.get();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (canvas.width !== w * dpr) { canvas.width = w * dpr; canvas.height = h * dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const ringPhase = Math.min(1, Math.max(0, (p - 0.18) / 0.3));
      const resolve = Math.min(1, Math.max(0, (p - 0.5) / 0.35));
      const t = performance.now() / 1000;

      // Aspect-corrected mapping: the JSON coords are already normalized with
      // the true tissue aspect; fit them into a centered box on the canvas.
      const scale = Math.min(w / maxX, h / maxY) * 0.92;
      const ox = (w - maxX * scale) / 2;
      const oy = (h - maxY * scale) / 2;
      const px = (nx) => ox + nx * scale;
      const py = (ny) => oy + ny * scale;

      // neighbour rings on a rotating subset (skipped under reduced motion —
      // they are the only time-driven animation)
      if (!reduceMotion && ringPhase > 0 && resolve < 1) {
        const n = Math.floor(ringPhase * 10);
        for (let k = 0; k < n; k++) {
          const s = spots[(k * 97 + Math.floor(t) * 13) % spots.length];
          const pulse = 14 + Math.sin(t * 2.4 + k) * 3;
          ctx.beginPath();
          ctx.arc(px(s[0]), py(s[1]), pulse, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(15,118,110,${0.5 * ringPhase * (1 - resolve)})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
          // azimuthal sweep
          ctx.beginPath();
          ctx.arc(px(s[0]), py(s[1]), pulse, t * 1.8 + k, t * 1.8 + k + 1.1);
          ctx.strokeStyle = `rgba(15,118,110,${0.85 * ringPhase * (1 - resolve)})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // spots: neutral ink before resolve, lerp to real state colors after
      for (const [sx, sy, si] of spots) {
        let fill;
        if (resolve > 0) {
          const c = stateRgb[si];
          const r = Math.round(INK[0] + (c[0] - INK[0]) * resolve);
          const g = Math.round(INK[1] + (c[1] - INK[1]) * resolve);
          const b = Math.round(INK[2] + (c[2] - INK[2]) * resolve);
          fill = `rgba(${r},${g},${b},${0.35 + 0.55 * resolve})`;
        } else {
          fill = "rgba(28,26,21,0.35)";
        }
        ctx.beginPath();
        ctx.arc(px(sx), py(sy), 2.6, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();
      }

      // legend: real state names + counts, bottom-right, once resolved
      // NOTE: CSS vars are invalid in Canvas2D font strings; hardcode the face.
      if (resolve > 0.75) {
        const a = Math.min(1, (resolve - 0.75) * 4);
        ctx.font = "600 12px 'JetBrains Mono', ui-monospace, monospace";
        const rowH = 20, pad = 12;
        let tw = 0;
        for (const l of legend) {
          tw = Math.max(tw, ctx.measureText(`${l.name}  ${l.count}`).width);
        }
        const boxW = tw + pad * 2 + 18;
        const boxH = legend.length * rowH + pad * 2 - 6;
        const bx = w - boxW - 16;
        const by = h - boxH - 16;
        ctx.fillStyle = `rgba(255,253,247,${0.9 * a})`;
        ctx.beginPath();
        ctx.roundRect(bx, by, boxW, boxH, 6);
        ctx.fill();
        legend.forEach((l, i) => {
          const ly = by + pad + i * rowH + 5;
          ctx.beginPath();
          ctx.arc(bx + pad + 4, ly - 4, 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${l.rgb.join(",")},${a})`;
          ctx.fill();
          ctx.fillStyle = `rgba(28,26,21,${a})`;
          ctx.fillText(`${l.name}  ${l.count}`, bx + pad + 16, ly);
        });
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [scrollYProgress, data]);

  // Contiguous windows — no dead zones where all three captions are ghosts.
  const cap1 = useTransform(scrollYProgress, [0, 0.2, 0.3], [1, 1, 0]);
  const cap2 = useTransform(scrollYProgress, [0.3, 0.38, 0.52, 0.6], [0, 1, 1, 0]);
  const cap3 = useTransform(scrollYProgress, [0.6, 0.7, 1], [0, 1, 1]);

  return (
    <section id="banksy" ref={wrapRef} className="relative h-[180vh] md:h-[240vh]">
      <div className="sticky top-0 h-[100svh] flex flex-col overflow-hidden">
        <div className="px-6 md:px-14 pt-16 md:pt-20 max-w-7xl mx-auto w-full">
          <p className="font-mono text-sm text-violet mb-3">01 · BANKSY — A GBM USE CASE</p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Clustering that <span className="text-violet">sees the tissue.</span>
          </h2>
        </div>
        <div className="relative flex-1 max-w-5xl w-full mx-auto">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          {/* persistent card; only the text crossfades, so the backdrop never ghosts */}
          <div className="absolute bottom-8 left-6 md:left-10 w-[26rem] max-w-[85vw] min-h-[7.6rem] rounded-[4px] bg-panel/95 border border-line shadow-sm p-4">
            <motion.p style={{ opacity: cap1 }} className="absolute inset-4 text-dim text-lg leading-relaxed">
              A glioblastoma section. GFAP lights up{" "}
              <span className="text-snow">reactive astrocytes and astrocyte-like tumor
              states alike</span> — spot-by-spot clustering reads them as one blur.
            </motion.p>
            <motion.p style={{ opacity: cap2 }} className="absolute inset-4 text-dim text-lg leading-relaxed">
              BANKSY embeds every spot <span className="text-snow">with its neighborhood</span> —
              mean expression plus an azimuthal gradient over the k-nearest ring. Place
              becomes part of identity.
            </motion.p>
            <motion.p style={{ opacity: cap3 }} className="absolute inset-4 text-dim text-[17px] leading-relaxed">
              Now they separate: <span className="text-snow">putative astrocytes apart from
              NPC- and MES-like tumor states</span>, each domain annotated by its own
              parallel subagent. Real GBM1 section, 4,764 spots; labels model-annotated.
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}
