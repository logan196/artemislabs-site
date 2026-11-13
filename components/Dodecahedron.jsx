"use client";

import { useEffect, useMemo, useRef } from "react";

// Wireframe dodecahedron, rotating in 3D with a pulsing teal glow.
export default function Dodecahedron({ size = 72 }) {
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
    // Edge = pair at the minimal vertex distance (2/phi)
    const edges = [];
    const target = 2 / phi;
    for (let i = 0; i < verts.length; i++)
      for (let j = i + 1; j < verts.length; j++) {
        const d = Math.hypot(
          verts[i][0] - verts[j][0],
          verts[i][1] - verts[j][1],
          verts[i][2] - verts[j][2],
        );
        if (Math.abs(d - target) < 1e-6) edges.push([i, j]);
      }
    return { verts, edges };
  }, []);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf;

    const draw = (now) => {
      const t = now / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      const rx = reduced ? 0.6 : t * 0.5;
      const ry = reduced ? 0.8 : t * 0.33;
      const cosx = Math.cos(rx), sinx = Math.sin(rx);
      const cosy = Math.cos(ry), siny = Math.sin(ry);
      const pts = verts.map(([x, y, z]) => {
        let y1 = y * cosx - z * sinx, z1 = y * sinx + z * cosx;
        let x2 = x * cosy + z1 * siny, z2 = -x * siny + z1 * cosy;
        const s = (size * 0.21) * (3.2 / (3.2 + z2)); // mild perspective
        return [size / 2 + x2 * s, size / 2 + y1 * s, z2];
      });

      const pulse = reduced ? 0.8 : 0.65 + 0.35 * Math.sin(t * 1.6);
      ctx.lineWidth = 1.1;
      ctx.lineCap = "round";
      ctx.shadowColor = "rgba(15, 118, 110, 0.75)";
      ctx.shadowBlur = 7 + 6 * pulse;
      for (const [i, j] of edges) {
        const depth = (pts[i][2] + pts[j][2]) / 2; // -c..c
        const near = 1 - (depth + 1.7) / 3.4;
        ctx.strokeStyle = `rgba(17, 94, 89, ${0.3 + 0.6 * near * pulse})`;
        ctx.beginPath();
        ctx.moveTo(pts[i][0], pts[i][1]);
        ctx.lineTo(pts[j][0], pts[j][1]);
        ctx.stroke();
      }
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [size, verts, edges]);

  return (
    <canvas
      ref={ref}
      style={{ width: size, height: size }}
      className="pointer-events-none select-none"
      aria-hidden
    />
  );
}
