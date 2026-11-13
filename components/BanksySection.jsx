"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { stateColor } from "../lib/stateColors";

// Fixed palette, assigned to real states in order (states are sorted by
// descending count in the JSON). Repeats if there are more states than colors.
// Canonical per-state colors shared with the UMAP explorer, keyed by NAME —
// the same state keeps the same color in every figure on the page.

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
    const stateRgb = states.map((name, i) => hexToRgb(stateColor(name, i)));
    // the actual H&E slide this data came from — anchors "this is a tumor"
    const heImg = new Image();
    heImg.src = "gbm/GBM1_he.jpg";
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

    // --- roaming BANKSY neighborhood ring: focus spot + its k nearest ---
    // Deterministic hops (hopCount * 997 mod n — no Math.random), neighbors
    // recomputed ONCE per hop and cached; the per-frame cost is just drawing.
    const RING_K = 6;
    const HOP_MS = 2400;
    const GLIDE_MS = 700;
    const nearestNeighbors = (idx) => {
      const fx = spots[idx][0], fy = spots[idx][1];
      const best = []; // ascending by squared distance, length <= RING_K
      for (let i = 0; i < spots.length; i++) {
        if (i === idx) continue;
        const dx = spots[i][0] - fx, dy = spots[i][1] - fy;
        const d = dx * dx + dy * dy;
        if (best.length < RING_K) {
          best.push({ d, i });
          best.sort((a, b) => a.d - b.d);
        } else if (d < best[RING_K - 1].d) {
          best[RING_K - 1] = { d, i };
          best.sort((a, b) => a.d - b.d);
        }
      }
      return best.map((b) => b.i);
    };
    let hopCount = -1; // -1 = not initialized yet
    let hopSpot = spots[997 % spots.length];
    let hopNeighbors = [];
    let glideFrom = null; // previous ring position in DATA coords (null = snap)
    let glideT0 = 0;
    const ringEpoch = performance.now();

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

      // spots: beat 1 = REAL per-spot GFAP intensity (sepia ramp — the blur the
      // caption describes), lerped to real state colors as BANKSY resolves.
      const SEPIA = [154, 91, 19];
      for (const [sx, sy, si, gf] of spots) {
        const g0 = gf ?? 0;
        // GFAP view: ink -> sepia by expression
        const gr = INK[0] + (SEPIA[0] - INK[0]) * g0;
        const gg = INK[1] + (SEPIA[1] - INK[1]) * g0;
        const gb = INK[2] + (SEPIA[2] - INK[2]) * g0;
        let r = gr, g = gg, b = gb, a = 0.22 + 0.5 * g0;
        // staged: clusters snap in one at a time, largest first, cubic-eased
        const ri0 = Math.min(1, Math.max(0, (resolve - si * 0.08) / 0.4));
        const ri = ri0 * ri0 * (3 - 2 * ri0);
        if (ri > 0) {
          const c = stateRgb[si];
          r = gr + (c[0] - gr) * ri;
          g = gg + (c[1] - gg) * ri;
          b = gb + (c[2] - gb) * ri;
          a = a + (0.9 - a) * ri;
        }
        ctx.beginPath();
        ctx.arc(px(sx), py(sy), 2.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`;
        ctx.fill();
      }

      // roaming neighborhood ring — a literal picture of what BANKSY does:
      // one focus spot, spokes to its 6 nearest neighbors, "spot + ring" as
      // the unit that gets embedded. Full strength while the method is being
      // explained; fades to 35% once the colored domains fully resolve.
      {
        const ringAlpha =
          resolve < 0.85 ? 1 : 1 - ((resolve - 0.85) / 0.15) * 0.65;
        if (ringAlpha > 0.01) {
          const now = performance.now();
          let rx, ry, glide = 1;
          if (reduceMotion) {
            // static: one fixed ring, no roaming, no glide
            if (hopCount < 0) {
              hopCount = 0;
              const fi = 997 % spots.length;
              hopSpot = spots[fi];
              hopNeighbors = nearestNeighbors(fi);
            }
            rx = px(hopSpot[0]);
            ry = py(hopSpot[1]);
          } else {
            const elapsed = Math.max(0, now - ringEpoch);
            const hopIdx = Math.floor(elapsed / HOP_MS);
            if (hopIdx !== hopCount) {
              // freeze the ring's CURRENT (possibly mid-glide) position as the
              // start of the next glide, then pick the next deterministic spot
              if (hopCount >= 0) {
                const u0 = Math.min(1, Math.max(0, (now - glideT0) / GLIDE_MS));
                const e0 = 1 - Math.pow(1 - u0, 3);
                const sx0 = glideFrom ? glideFrom[0] + (hopSpot[0] - glideFrom[0]) * e0 : hopSpot[0];
                const sy0 = glideFrom ? glideFrom[1] + (hopSpot[1] - glideFrom[1]) * e0 : hopSpot[1];
                glideFrom = [sx0, sy0];
              }
              hopCount = hopIdx;
              const fi = (hopCount * 997) % spots.length;
              hopSpot = spots[fi];
              hopNeighbors = nearestNeighbors(fi); // O(n), once per hop
              glideT0 = now;
            }
            const u = Math.min(1, Math.max(0, (now - glideT0) / GLIDE_MS));
            glide = 1 - Math.pow(1 - u, 3); // ease-out cubic
            const gx = glideFrom ? glideFrom[0] + (hopSpot[0] - glideFrom[0]) * glide : hopSpot[0];
            const gy = glideFrom ? glideFrom[1] + (hopSpot[1] - glideFrom[1]) * glide : hopSpot[1];
            rx = px(gx);
            ry = py(gy);
          }
          // spokes + neighbor rings (fade in as the glide lands)
          const spokeA = 0.6 * ringAlpha * (0.25 + 0.75 * glide);
          for (const ni of hopNeighbors) {
            const nx = px(spots[ni][0]), ny = py(spots[ni][1]);
            ctx.beginPath();
            ctx.moveTo(rx, ry);
            ctx.lineTo(nx, ny);
            ctx.strokeStyle = `rgba(154,91,19,${spokeA})`;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(nx, ny, 5, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(154,91,19,${spokeA})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
          // focus ring
          ctx.beginPath();
          ctx.arc(rx, ry, 12, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(17,94,89,${0.95 * ringAlpha})`;
          ctx.lineWidth = 1.6;
          ctx.stroke();
          // tiny mono label, paper halo so it reads over the dots; flips to
          // the left of the ring near the right edge, clamped vertically
          const label = "spot + ring → one embedding";
          ctx.font = "500 10px 'JetBrains Mono', ui-monospace, monospace";
          const lw = ctx.measureText(label).width;
          let lx = rx + 18;
          if (lx + lw > w - 8) lx = rx - 18 - lw;
          const ly = Math.min(Math.max(ry - 16, 14), h - 10);
          ctx.strokeStyle = `rgba(255,253,247,${0.9 * ringAlpha})`;
          ctx.lineWidth = 3;
          ctx.lineJoin = "round";
          ctx.strokeText(label, lx, ly);
          ctx.fillStyle = `rgba(95,91,80,${0.9 * ringAlpha})`;
          ctx.fillText(label, lx, ly);
        }
      }

      // H&E inset while in the expression view — the tissue these spots sit on
      if (resolve < 0.6 && heImg.complete && heImg.naturalWidth > 0) {
        const a = 1 - resolve / 0.6;
        const iw = Math.min(190, w * 0.2);
        const ih = iw * (heImg.naturalHeight / heImg.naturalWidth);
        const ix = 18, iy = 16;
        ctx.globalAlpha = a;
        ctx.fillStyle = "#fffdf7";
        ctx.strokeStyle = "#d8d2c2";
        ctx.beginPath();
        ctx.roundRect(ix - 5, iy - 5, iw + 10, ih + 28, 4);
        ctx.fill();
        ctx.stroke();
        ctx.drawImage(heImg, ix, iy, iw, ih);
        ctx.fillStyle = "#5f5b50";
        ctx.font = "600 10.5px 'JetBrains Mono', ui-monospace, monospace";
        ctx.fillText("GBM1 · the H&E slide", ix, iy + ih + 15);
        ctx.globalAlpha = 1;
      }

      // GFAP ramp label while in the expression view
      if (resolve < 0.6) {
        const a = 1 - resolve / 0.6;
        ctx.font = "600 12px 'JetBrains Mono', ui-monospace, monospace";
        const lx = w - 170, ly = 26;
        ctx.fillStyle = `rgba(28,26,21,${0.75 * a})`;
        ctx.fillText("GFAP expression", lx, ly);
        for (let k = 0; k < 60; k++) {
          const f = k / 59;
          ctx.fillStyle = `rgba(${Math.round(INK[0] + (SEPIA[0] - INK[0]) * f)},${Math.round(
            INK[1] + (SEPIA[1] - INK[1]) * f
          )},${Math.round(INK[2] + (SEPIA[2] - INK[2]) * f)},${(0.25 + 0.6 * f) * a})`;
          ctx.fillRect(lx + k * 1.9, ly + 8, 1.9, 6);
        }
        ctx.fillStyle = `rgba(95,91,80,${0.8 * a})`;
        ctx.font = "500 10px 'JetBrains Mono', ui-monospace, monospace";
        ctx.fillText("0", lx, ly + 26);
        ctx.fillText("p99", lx + 100, ly + 26);
      }

      // legend: real state names + counts, bottom-right, once resolved
      // NOTE: CSS vars are invalid in Canvas2D font strings; hardcode the face.
      const nVisible = legend.filter((_, i) => (resolve - i * 0.08) / 0.4 > 0.02).length;
      if (resolve > 0.2 && nVisible > 0) {
        const a = 1;
        ctx.font = "600 12px 'JetBrains Mono', ui-monospace, monospace";
        const rowH = 20, pad = 12;
        let tw = 0;
        for (const l of legend) {
          tw = Math.max(tw, ctx.measureText(`${l.name}  ${l.count}`).width);
        }
        const boxW = tw + pad * 2 + 18;
        const boxH = nVisible * rowH + pad * 2 - 6;
        const bx = w - boxW - 16;
        const by = h - boxH - 16;
        ctx.fillStyle = `rgba(255,253,247,${0.9 * a})`;
        ctx.beginPath();
        ctx.roundRect(bx, by, boxW, boxH, 6);
        ctx.fill();
        legend.forEach((l, i) => {
          const ra0 = Math.min(1, Math.max(0, (resolve - i * 0.08) / 0.4));
          const ra = ra0 * ra0 * (3 - 2 * ra0);
          if (ra <= 0.02) return;
          const ly = by + pad + i * rowH + 5;
          ctx.beginPath();
          ctx.arc(bx + pad + 4, ly - 4, 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${l.rgb.join(",")},${ra})`;
          ctx.fill();
          ctx.fillStyle = `rgba(28,26,21,${ra})`;
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
  const cap2 = useTransform(scrollYProgress, [0.3, 0.38, 0.56, 0.64], [0, 1, 1, 0]);
  const cap3 = useTransform(scrollYProgress, [0.58, 0.66, 1], [0, 1, 1]);

  return (
    <section id="banksy" ref={wrapRef} className="relative h-[180vh] md:h-[240vh]">
      <div className="sticky top-0 h-[100svh] flex flex-col overflow-hidden">
        <div className="px-6 md:px-14 pt-16 md:pt-20 max-w-7xl mx-auto w-full">
          <p className="font-mono text-sm text-violet mb-3">01 · BANKSY — A GBM USE CASE</p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Clustering that <span className="text-violet">sees the tissue.</span>
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] md:text-base text-dim leading-relaxed">
            A big claim deserves a concrete opening: one method, one tumor section,
            watched doing its job.
          </p>
        </div>
        <div className="relative flex-1 max-w-5xl w-full mx-auto">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          {/* persistent card; only the text crossfades, so the backdrop never ghosts */}
          <div className="absolute bottom-8 left-6 md:left-10 w-[26rem] max-w-[85vw] rounded-[4px] bg-panel/95 border border-line shadow-sm p-4 grid">
            {/* grid-stacked so the card sizes to the tallest caption — nothing overflows */}
            <motion.p style={{ opacity: cap1 }} className="col-start-1 row-start-1 text-dim text-[16px] leading-relaxed">
              A glioblastoma section. GFAP lights up{" "}
              <span className="text-snow">reactive astrocytes and astrocyte-like tumor
              states alike</span> — spot-by-spot clustering reads them as one blur.
            </motion.p>
            <motion.p style={{ opacity: cap2 }} className="col-start-1 row-start-1 text-dim text-[16px] leading-relaxed">
              BANKSY embeds every spot <span className="text-snow">with its neighborhood</span> —
              its own expression, the average of the ring of spots around it, and how that
              average changes around the ring. Place becomes part of identity.
            </motion.p>
            <motion.p style={{ opacity: cap3 }} className="col-start-1 row-start-1 text-dim text-[16px] leading-relaxed">
              Now they separate: <span className="text-snow">putative astrocytes apart from
              NPC- and MES-like tumor states</span>, each domain annotated by its own
              parallel subagent. Real GBM1 section, 4,764 spots; labels model-annotated.
            </motion.p>
          </div>
        </div>
      </div>

      {/* after the show: why this disease, and who wrote the labels */}
      <div className="px-6 md:px-14 pb-20 md:pb-24 max-w-7xl mx-auto grid md:grid-cols-2 gap-4 md:gap-5">
        <div className="rounded-[4px] border border-line bg-panel/80 p-6">
          <p className="font-mono text-[11px] tracking-[0.25em] text-violet uppercase mb-3">
            why glioblastoma
          </p>
          <p className="text-[15px] text-dim leading-relaxed">
            GBM is the stress test. Several tumor states coexist in one section, they
            shade into each other, and the hardest split — reactive astrocytes versus
            astrocyte-like tumor states — <span className="text-snow">shares the very
            marker you just watched (GFAP)</span>, so histology and single-gene panels
            both blur it. A pipeline that separates states here has earned the gentler
            tissues — and the public GBM record is deep enough (GSE194329, 10x,
            gbmspace.org) that every claim on this page can be re-run and checked.
          </p>
        </div>
        <div className="rounded-[4px] border border-line bg-panel/80 p-6">
          <p className="font-mono text-[11px] tracking-[0.25em] text-violet uppercase mb-3">
            agentic annotation of cell states
          </p>
          <p className="text-[15px] text-dim leading-relaxed">
            Once BANKSY resolves the domains, annotation fans out:{" "}
            <span className="text-snow">one subagent per domain, running in
            parallel</span>, each handed its domain&rsquo;s top differential markers and
            constrained to a controlled vocabulary (AC-, MES-, NPC-, OPC-like plus the
            brain tumor microenvironment). The labels that snapped in above are those
            calls — model-annotated, flagged as such on every figure, never presented
            as ground truth.
          </p>
        </div>
      </div>
    </section>
  );
}
