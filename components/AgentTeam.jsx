"use client";

// Show-not-say pipeline for the PhD-led agent team. Heading text is fixed.
import { useEffect, useRef, useState } from "react";
import { useReducedMotion, useScroll } from "framer-motion";

const NODES = [
  { id: "architect", title: "Study architect", label: "question → plan" },
  { id: "analyst", title: "Spatial analyst", label: "QC → domains" },
  { id: "reviewer", title: "Methods reviewer", label: "figures · report" },
];

function hexToRgb(hex) {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

function PipelineStage({ progress, reduced }) {
  const canvasRef = useRef(null);
  const ptsRef = useRef(null);
  const palRef = useRef(null);
  const domainsRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    fetch("dejong/at4_fo2_preview.json")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const pal = {};
        for (const d of data.domains) pal[d.id] = hexToRgb(d.color);
        palRef.current = pal;
        domainsRef.current = data.domains;
        ptsRef.current = data.points.filter((_, i) => i % 8 === 0);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    let raf = 0;
    let cssW = 0;
    let cssH = 0;
    let disposed = false;

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, canvas.clientWidth);
      const h = Math.max(1, canvas.clientHeight);
      if (w === cssW && h === cssH && canvas.width === Math.round(w * dpr)) return;
      cssW = w;
      cssH = h;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const laneY = (i, n, h) => h * 0.22 + ((i % n) / n) * h * 0.56;

    function draw(p) {
      fit();
      const w = cssW;
      const h = cssH;
      ctx.fillStyle = "#050607";
      ctx.fillRect(0, 0, w, h);

      const nodeXs = [0.22, 0.5, 0.78].map((f) => w * f);
      const nodeY = h * 0.5;
      // lane
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w * 0.04, nodeY);
      ctx.lineTo(w * 0.96, nodeY);
      ctx.stroke();

      const pts = ptsRef.current;
      const pal = palRef.current;
      if (pts && pal) {
        // Source tissue cloud on the left, flowing into the lane
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const [x, y] of pts) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
        const sx = (x) => 12 + ((x - minX) / (maxX - minX || 1)) * (w * 0.16);
        const sy = (y) => h * 0.22 + ((y - minY) / (maxY - minY || 1)) * (h * 0.56);

        for (let i = 0; i < pts.length; i++) {
          const [x, y, d] = pts[i];
          const [r, g, b] = pal[d] || [180, 180, 180];
          const start = i / pts.length;
          const travel = Math.max(0, Math.min(1, (p - start * 0.12) / 0.72));
          const x0 = sx(x);
          const y0 = sy(y);
          const x1 = w * 0.96;
          const y1 = laneY(i, 28, h);
          const px = x0 + (x1 - x0) * travel;
          const py = y0 + (y1 - y0) * Math.min(1, travel * 1.15);
          const colored = travel > 0.42;
          ctx.beginPath();
          ctx.arc(px, py, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = colored
            ? `rgba(${r},${g},${b},0.92)`
            : "rgba(200,198,188,0.55)";
          ctx.fill();
        }
      }

      // end-state figures + portal glyph
      if (p > 0.78) {
        const a = Math.min(1, (p - 0.78) / 0.14);
        ctx.globalAlpha = a;
        const fx = w * 0.86;
        const fy = h * 0.18;
        ctx.fillStyle = "rgba(18,20,24,0.95)";
        ctx.strokeStyle = "rgba(255,255,255,0.18)";
        ctx.lineWidth = 1;
        for (let i = 0; i < 2; i++) {
          ctx.fillRect(fx + i * 22, fy + i * 8, 36, 28);
          ctx.strokeRect(fx + i * 22, fy + i * 8, 36, 28);
        }
        ctx.fillStyle = "rgba(126,239,224,0.9)";
        ctx.fillRect(fx + 6, fy + 42, 48, 8);
        ctx.font = "10px ui-monospace, monospace";
        ctx.fillStyle = "rgba(243,239,228,0.8)";
        ctx.fillText("portal", fx + 8, fy + 68);
        ctx.globalAlpha = 1;
      }
    }

    const loop = () => {
      if (disposed) return;
      const p = reduced ? 1 : (window.__artemisAgentProgress ?? 0);
      draw(p);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const ro = new ResizeObserver(() => fit());
    ro.observe(canvas);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [reduced]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />;
}

function ReviewPulse({ active, reduced }) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-[10.5px] tracking-wide ${
        active ? "text-[#7eefe0]" : "text-dim"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${active ? "bg-[#7eefe0]" : "bg-white/20"} ${
          active && !reduced ? "animate-pulse" : ""
        }`}
        aria-hidden
      />
      human review ✓
    </span>
  );
}

export default function AgentTeam() {
  const trackRef = useRef(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 0.7", "end 0.35"],
  });
  const [p, setP] = useState(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      window.__artemisAgentProgress = 1;
      setP(1);
      return;
    }
    const unsub = scrollYProgress.on("change", (v) => {
      window.__artemisAgentProgress = v;
      setP(v);
    });
    return () => {
      unsub();
      delete window.__artemisAgentProgress;
    };
  }, [scrollYProgress, reduced]);

  const nodeOn = (i) => p >= 0.16 + i * 0.22;
  const handoffOn = (i) => p >= 0.32 + i * 0.22;

  return (
    <section id="team" className="relative bg-black px-6 md:px-14 py-16 md:py-24">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-6xl max-w-4xl">
          A PhD-led agent team for your spatial data
        </h2>
        <p className="mt-5 max-w-2xl text-lg text-snow/85 leading-relaxed">
          Every result carries its source, method and decision trail.
        </p>

        <div ref={trackRef} className={reduced ? "mt-10" : "mt-10 md:h-[180vh]"}>
          <div className={reduced ? "relative" : "md:sticky md:top-[12vh]"}>
            <div className="relative overflow-hidden rounded-[4px] border border-white/10 bg-[#050607] min-h-[320px] md:min-h-[420px]">
              <PipelineStage progress={scrollYProgress} reduced={!!reduced} />
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-stretch gap-2 sm:gap-0 p-3 md:p-4">
                {NODES.map((n, i) => (
                  <div key={n.id} className="flex-1 flex flex-col sm:flex-row sm:items-center">
                    <div
                      className={`flex-1 rounded-[4px] border px-4 py-3 md:px-5 md:py-3.5 backdrop-blur-[2px] transition-colors ${
                        nodeOn(i)
                          ? "border-[#7eefe0]/50 bg-black/75"
                          : "border-white/10 bg-black/55"
                      }`}
                    >
                      <p
                        className="text-xl md:text-2xl text-snow"
                        style={{ fontFamily: "var(--font-serif), serif" }}
                      >
                        {n.title}
                      </p>
                      <p className="mt-1 font-mono text-[12px] text-dim">{n.label}</p>
                    </div>
                    {i < 2 && (
                      <div className="flex items-center justify-center py-1.5 sm:py-0 sm:px-2 shrink-0">
                        <ReviewPulse active={handoffOn(i)} reduced={!!reduced} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-[11.5px] text-dim">
                Real tissue from public Xenium section AT4-FO-2 (de Jong et al., Nature 2026) · ends on figures and a portal
              </p>
              <a
                href="#contact"
                className="font-mono text-[13px] text-snow hover:text-violet border-b border-white/20 hover:border-violet pb-0.5 transition-colors"
              >
                Book a working session →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
