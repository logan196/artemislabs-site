"use client";

import { useEffect, useMemo, useRef } from "react";

// The dodecahedron of bioinformatics: 20 vertices = 20 pieces of the stack,
// 30 edges = the connections between them. Rotating 3D wireframe on paper.
const LABELS = [
  "Visium", "Xenium", "CODEX", "CosMx", "Visium HD",
  "snRNA-seq", "snATAC", "H&E", "BANKSY", "Leiden",
  "cell2location", "NMF niches", "IvyGAP", "Moran's I", "DE",
  "UMAP", "Vitessce", "zarr", "Qwen3", "Claude",
];

export default function BioDodecahedron({ size = 460 }) {
  const ref = useRef(null);

  const { verts, edges } = useMemo(() => {
    const phi = (1 + Math.sqrt(5)) / 2;
    const a = 1, b = 1 / phi, c = phi;
    const verts = [];
    for (const x of [-a, a]) for (const y of [-a, a]) for (const z of [-a, a]) verts.push([x, y, z]);
    for (const s of [-1, 1]) for (const t of [-1, 1]) {
      verts.push([0, s * b, t * c]);
      verts.push([s * b, t * c, 0]);
      verts.push([s * c, 0, t * b]);
    }
    const edges = [];
    const target = 2 / phi;
    for (let i = 0; i < verts.length; i++)
      for (let j = i + 1; j < verts.length; j++) {
        const d = Math.hypot(verts[i][0] - verts[j][0], verts[i][1] - verts[j][1], verts[i][2] - verts[j][2]);
        if (Math.abs(d - target) < 1e-6) edges.push([i, j]);
      }
    return { verts, edges };
  }, []);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf;

    const draw = (now) => {
      const w = canvas.clientWidth || size;
      const h = canvas.clientHeight || size;
      if (canvas.width !== Math.round(w * dpr)) { canvas.width = w * dpr; canvas.height = h * dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const t = now / 1000;
      const rx = reduced ? 0.5 : t * 0.14;
      const ry = reduced ? 0.7 : t * 0.1;
      const cosx = Math.cos(rx), sinx = Math.sin(rx);
      const cosy = Math.cos(ry), siny = Math.sin(ry);
      const R = Math.min(w, h) * 0.3;
      const pts = verts.map(([x, y, z]) => {
        const y1 = y * cosx - z * sinx, z1 = y * sinx + z * cosx;
        const x2 = x * cosy + z1 * siny, z2 = -x * siny + z1 * cosy;
        const s = R * (3.4 / (3.4 + z2));
        return [w / 2 + x2 * s, h / 2 + y1 * s, z2];
      });

      // edges — the connections
      ctx.lineWidth = 1.1;
      for (const [i, j] of edges) {
        const near = 1 - ((pts[i][2] + pts[j][2]) / 2 + 1.7) / 3.4;
        ctx.strokeStyle = `rgba(17, 94, 89, ${0.14 + 0.45 * near})`;
        ctx.beginPath();
        ctx.moveTo(pts[i][0], pts[i][1]);
        ctx.lineTo(pts[j][0], pts[j][1]);
        ctx.stroke();
      }
      // a slow pulse travelling the edges
      if (!reduced) {
        const k = Math.floor(t * 1.2) % edges.length;
        const [i, j] = edges[k];
        const f = (t * 1.2) % 1;
        const px = pts[i][0] + (pts[j][0] - pts[i][0]) * f;
        const py = pts[i][1] + (pts[j][1] - pts[i][1]) * f;
        ctx.beginPath();
        ctx.arc(px, py, 3.4, 0, Math.PI * 2);
        ctx.fillStyle = "#9a5b13";
        ctx.fill();
      }
      // labeled vertices
      ctx.font = "600 11px 'JetBrains Mono', ui-monospace, monospace";
      const order = pts.map((p, i) => [p[2], i]).sort((a, b) => a[0] - b[0]);
      for (const [, i] of order) {
        const [x, y, z] = pts[i];
        const near = 1 - (z + 1.7) / 3.4;
        ctx.beginPath();
        ctx.arc(x, y, 2.6 + 1.6 * near, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(15, 118, 110, ${0.35 + 0.6 * near})`;
        ctx.fill();
        if (near > 0.45) {
          const label = LABELS[i % LABELS.length];
          const tw = ctx.measureText(label).width;
          ctx.fillStyle = `rgba(255,253,247,${0.75 * near})`;
          ctx.fillRect(x + 7, y - 8, tw + 8, 15);
          ctx.fillStyle = `rgba(28, 26, 21, ${0.25 + 0.75 * near})`;
          ctx.fillText(label, x + 11, y + 3.5);
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [verts, edges, size]);

  return (
    <canvas
      ref={ref}
      style={{ width: "100%", height: size }}
      className="pointer-events-none select-none"
      aria-label="Rotating dodecahedron whose vertices are the parts of the Artemis BioLabs stack"
      role="img"
    />
  );
}
