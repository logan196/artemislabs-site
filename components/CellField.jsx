"use client";

import { useEffect, useRef } from "react";

/**
 * A Voronoi cell-segmentation field, the hero as a real figure.
 *
 * This is what a Xenium / CosMx segmentation output actually looks like:
 * hard polygon boundaries around every nucleus, filled by a measured value.
 * It replaces a sum-of-gaussians blur, which read as an audio visualiser
 * because mathematically it was one. Tissue is discrete; the picture should be.
 *
 * The entrance is the argument: nuclei land first as a raw, unsegmented point
 * cloud, then a pass sweeps left to right and resolves them into labelled
 * cells. Raw data in, segmented biology out, enacted rather than illustrated.
 *
 * Geometry is exact, not faked: seeds live on a jittered grid, so each cell's
 * Voronoi polygon is its grid square clipped by the perpendicular bisectors of
 * its eight neighbours. That is O(8) per cell and correct for this layout.
 */

const CELL = 30; // px nominal cell pitch
const JITTER = 0.42; // fraction of CELL a seed may wander

const SWEEP = 0.75; // seconds for the segmentation pass to cross the frame
const RESOLVE = 0.42; // seconds for one cell to go from nucleus to polygon

// Tumour-niche centres, in normalized coords; radius in height-units so the
// lobes stay round at any aspect. These shape the expression field.
const NICHES = [
  { x: 0.40, y: 0.46, r: 0.19, w: 1.0 },
  { x: 0.57, y: 0.39, r: 0.15, w: 0.9 },
  { x: 0.62, y: 0.58, r: 0.17, w: 0.85 },
  { x: 0.33, y: 0.60, r: 0.14, w: 0.78 },
  { x: 0.72, y: 0.47, r: 0.11, w: 0.6 },
  { x: 0.26, y: 0.47, r: 0.10, w: 0.5 },
];

/**
 * A measured-value ramp, not a brand glow: deep indigo through teal into warm
 * amber at the hottest. Multi-hue reads as a scientific colormap; a single
 * accent at varying opacity reads as decoration.
 */
const RAMP = [
  [14, 18, 42],
  [19, 68, 96],
  [20, 150, 142],
  [86, 193, 138],
  [232, 183, 86],
];

function rampAt(v) {
  const t = Math.max(0, Math.min(0.999, v)) * (RAMP.length - 1);
  const i = Math.floor(t);
  const f = t - i;
  const a = RAMP[i];
  const b = RAMP[i + 1] || RAMP[i];
  return [
    Math.round(a[0] + (b[0] - a[0]) * f),
    Math.round(a[1] + (b[1] - a[1]) * f),
    Math.round(a[2] + (b[2] - a[2]) * f),
  ];
}

function smoothstep(e0, e1, x) {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

function hash(n) {
  const s = Math.sin(n) * 43758.5453;
  return s - Math.floor(s);
}

/** Keep the half-plane nearer to (sx,sy) than to (nx,ny). Sutherland–Hodgman. */
function clipToBisector(poly, sx, sy, nx, ny) {
  const dx = nx - sx;
  const dy = ny - sy;
  // points p with (p - mid)·d <= 0 are nearer the seed
  const c = ((sx + nx) / 2) * dx + ((sy + ny) / 2) * dy;
  const out = [];
  for (let i = 0; i < poly.length; i += 2) {
    const ax = poly[i];
    const ay = poly[i + 1];
    const bx = poly[(i + 2) % poly.length];
    const by = poly[(i + 3) % poly.length];
    const da = ax * dx + ay * dy - c;
    const db = bx * dx + by * dy - c;
    if (da <= 0) out.push(ax, ay);
    if (da <= 0 !== db <= 0) {
      const t = da / (da - db);
      out.push(ax + (bx - ax) * t, ay + (by - ay) * t);
    }
  }
  return out;
}

export default function CellField({ className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cells = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let start = 0;
    let visible = true;
    let everStarted = false;
    let lastPaint = 0;

    const densityAt = (px, py) => {
      const aspect = w / h;
      const nx = px / w;
      const ny = py / h;
      let d = 0;
      for (let i = 0; i < NICHES.length; i++) {
        const n = NICHES[i];
        const ddx = (nx - n.x) * aspect;
        const ddy = ny - n.y;
        d += n.w * Math.exp(-(ddx * ddx + ddy * ddy) / (n.r * n.r));
      }
      return Math.min(1, d);
    };

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cols = Math.ceil(w / CELL) + 2;
      const rows = Math.ceil(h / CELL) + 2;
      const seedAt = (i, j) => [
        (i - 0.5) * CELL + (hash(i * 31.7 + j * 11.3) - 0.5) * CELL * 2 * JITTER,
        (j - 0.5) * CELL + (hash(i * 17.1 + j * 29.9 + 5.5) - 0.5) * CELL * 2 * JITTER,
      ];

      const next = [];
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const [sx, sy] = seedAt(i, j);
          if (sx < -CELL || sx > w + CELL || sy < -CELL || sy > h + CELL) continue;

          // start from a generous box, clip against the eight neighbours
          const R = CELL * 2.2;
          let poly = [sx - R, sy - R, sx + R, sy - R, sx + R, sy + R, sx - R, sy + R];
          for (let di = -1; di <= 1 && poly.length >= 6; di++) {
            for (let dj = -1; dj <= 1; dj++) {
              if (!di && !dj) continue;
              const [nx, ny] = seedAt(i + di, j + dj);
              poly = clipToBisector(poly, sx, sy, nx, ny);
              if (poly.length < 6) break;
            }
          }
          if (poly.length < 6) continue;

          const d = densityAt(sx, sy);
          // expression = niche signal plus biological scatter; cells in a
          // domain agree, but never perfectly
          const v = Math.max(0, Math.min(1, d * 0.82 + hash(i * 7.7 + j * 3.1) * 0.3 - 0.06));
          next.push({
            x: sx,
            y: sy,
            poly,
            v,
            inTissue: d > 0.14,
            delay: (sx / w) * SWEEP + hash(i * 2.3 + j * 5.9) * 0.1,
            seed: hash(i * 13.3 + j * 19.7),
          });
        }
      }
      cells = next;
    };

    const paint = (t) => {
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < cells.length; i++) {
        const c = cells[i];
        const r = reduced ? 1 : smoothstep(0, RESOLVE, t - c.delay);

        // Before the pass reaches it, a cell is just an unsegmented nucleus.
        if (r <= 0.001) {
          ctx.fillStyle = "rgba(170,186,205,0.5)";
          ctx.fillRect(c.x - 1, c.y - 1, 2, 2);
          continue;
        }

        // slow drift in measured value, so the figure stays live without the
        // geometry ever moving, segmentation that wobbled would be a lie
        const pulse = reduced ? 0 : Math.sin(t * 0.55 + c.seed * 6.28) * 0.06;
        const v = Math.max(0, Math.min(1, c.v + pulse));
        const [cr, cg, cb] = rampAt(v);

        ctx.beginPath();
        ctx.moveTo(c.poly[0], c.poly[1]);
        for (let p = 2; p < c.poly.length; p += 2) ctx.lineTo(c.poly[p], c.poly[p + 1]);
        ctx.closePath();

        // fill carries the value; tissue cells are far more present than the
        // sparse stroma around them
        const fillA = (c.inTissue ? 0.16 + v * 0.5 : 0.05 + v * 0.1) * r;
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${fillA})`;
        ctx.fill();

        // the boundary is the point, keep it hairline and crisp
        ctx.lineWidth = 0.7;
        ctx.strokeStyle = `rgba(${cr + 40},${cg + 55},${cb + 50},${(c.inTissue ? 0.5 : 0.17) * r})`;
        ctx.stroke();

        // nucleus stays visible inside its own polygon
        ctx.fillStyle = `rgba(226,236,244,${(c.inTissue ? 0.5 : 0.22) * r})`;
        ctx.fillRect(c.x - 1, c.y - 1, 2, 2);
      }

      // the pass itself: a bright edge travelling with the reveal front
      if (!reduced) {
        const front = (t / SWEEP) * w;
        if (front > -40 && front < w + 40) {
          const g = ctx.createLinearGradient(front - 70, 0, front + 14, 0);
          g.addColorStop(0, "rgba(20,184,166,0)");
          g.addColorStop(0.75, "rgba(20,184,166,0.1)");
          g.addColorStop(1, "rgba(150,245,228,0.5)");
          ctx.fillStyle = g;
          ctx.fillRect(front - 70, 0, 84, h);
        }
      }
    };

    const frame = (now) => {
      if (!start) start = now;
      everStarted = true;
      const t = (now - start) / 1000;
      // the pass needs every frame; the settled figure only drifts in value
      const settled = t > SWEEP + RESOLVE + 0.3;
      if (!settled || now - lastPaint >= 55) {
        lastPaint = now;
        paint(t);
      }
      if (reduced) return;
      if (visible) raf = requestAnimationFrame(frame);
    };

    const restart = () => {
      cancelAnimationFrame(raf);
      build();
      start = 0;
      lastPaint = 0;
      if (visible || reduced) raf = requestAnimationFrame(frame);
    };

    restart();

    let resizeTimer = 0;
    let roPrimed = false;
    const ro = new ResizeObserver(() => {
      // observe() always fires once immediately; acting on it would rebuild
      // every cell and restart the pass mid-entrance on every load
      if (!roPrimed) { roPrimed = true; return; }
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(restart, 180);
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (!visible || reduced) return;
        if (!everStarted) start = 0;
        everStarted = true;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(frame);
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (visible && !reduced) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
