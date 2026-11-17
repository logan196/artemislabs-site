"use client";

// Show-not-say pipeline for the PhD-led agent team. Heading text is fixed.
// Tissue is the same AT4-FO-2 BANKSY preview used in the sample run (2,500 points).
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

function TissueCanvas({ reduced }) {
  const canvasRef = useRef(null);
  const dataRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    fetch("dejong/at4_fo2_preview.json")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const pal = {};
        for (const d of data.domains) pal[d.id] = hexToRgb(d.color);
        dataRef.current = { ...data, pal };
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

    function draw(p) {
      fit();
      const w = cssW;
      const h = cssH;
      ctx.fillStyle = "#07080a";
      ctx.fillRect(0, 0, w, h);
      const data = dataRef.current;
      if (!data) return;

      const pts = data.points;
      const pal = data.pal;
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const [x, y] of pts) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
      const pad = 16;
      // Leave a reserved gutter on the right once the reviewer stage is on
      const reviewer = p >= 0.62;
      const rightGutter = reviewer ? Math.min(220, w * 0.32) : 0;
      const sx = (x) => pad + ((x - minX) / (maxX - minX || 1)) * (w - pad * 2 - rightGutter);
      const sy = (y) => pad + ((y - minY) / (maxY - minY || 1)) * (h - pad * 2);
      const colorAmt = reduced ? 1 : Math.max(0, Math.min(1, (p - 0.28) / 0.2));

      for (let i = 0; i < pts.length; i++) {
        const [x, y, d] = pts[i];
        const [r, g, b] = pal[d] || [180, 180, 180];
        const pr = 210 + (r - 210) * colorAmt;
        const pg = 208 + (g - 208) * colorAmt;
        const pb = 198 + (b - 198) * colorAmt;
        const px = sx(x);
        const py = sy(y);
        ctx.beginPath();
        ctx.arc(px, py, 2.15, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pr|0},${pg|0},${pb|0},${0.55 + 0.4 * colorAmt})`;
        ctx.fill();
      }

      if (colorAmt > 0.55) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, (colorAmt - 0.55) / 0.45);
        ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
        const used = new Set();
        for (const d of data.domains) {
          if (used.has(d.cls) && ![2, 5, 4, 3, 1, 0].includes(d.id)) continue;
          let accX = 0, accY = 0, n = 0;
          for (const [x, y, id] of pts) {
            if (id !== d.id) continue;
            accX += sx(x);
            accY += sy(y);
            n += 1;
            if (n > 80) break;
          }
          if (!n) continue;
          used.add(d.id);
          const [r, g, b] = pal[d.id];
          ctx.fillStyle = `rgba(${r},${g},${b},0.95)`;
          ctx.fillText(d.cls, accX / n - 22, accY / n);
        }
        ctx.restore();
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
      className={`relative inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] tracking-wide transition-colors ${
        active
          ? "border-[#7eefe0]/70 text-[#7eefe0] bg-[#7eefe0]/10"
          : "border-white/15 text-dim bg-black/40"
      }`}
    >
      <span className="relative flex h-2.5 w-2.5" aria-hidden>
        {active && !reduced && (
          <span className="absolute inset-0 rounded-full bg-[#7eefe0] animate-ping opacity-70" />
        )}
        <span className={`relative h-2.5 w-2.5 rounded-full ${active ? "bg-[#7eefe0]" : "bg-white/25"}`} />
      </span>
      human review ✓
    </span>
  );
}

function PlanCard({ visible }) {
  return (
    <div
      className={`absolute top-3 left-3 z-10 max-w-[240px] rounded-[4px] border border-white/15 bg-black/80 backdrop-blur-sm px-3.5 py-3 shadow-[0_8px_28px_rgba(0,0,0,0.45)] transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <p className="font-mono text-[10px] uppercase tracking-widest text-[#7eefe0]">Plan</p>
      <p className="mt-1.5 text-[13.5px] text-snow leading-snug">
        Where is the hypoxic core in AT4-FO-2, and what sits beside it?
      </p>
      <p className="mt-2 font-mono text-[11px] text-dim leading-relaxed">
        QC → BANKSY domains → composition
      </p>
    </div>
  );
}

function ReviewerPanel({ visible }) {
  return (
    <div
      className={`absolute top-3 right-3 bottom-3 z-10 w-[min(200px,32%)] flex flex-col gap-2 transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <figure className="rounded-[3px] border border-white/15 bg-black/80 overflow-hidden flex-1 min-h-0">
        <img
          src="programs/at4_domains.jpg"
          alt="BANKSY domains on AT4-FO-2"
          className="w-full h-full object-cover"
        />
        <figcaption className="px-2 py-1 font-mono text-[10px] text-dim bg-black/70">
          domains
        </figcaption>
      </figure>
      <figure className="rounded-[3px] border border-white/15 bg-black/80 overflow-hidden flex-1 min-h-0">
        <img
          src="demo/poster.png"
          alt="Live portal thumbnail"
          className="w-full h-full object-cover object-top"
        />
        <figcaption className="px-2 py-1 font-mono text-[10px] text-dim bg-black/70">
          portal
        </figcaption>
      </figure>
    </div>
  );
}

export default function AgentTeam() {
  const trackRef = useRef(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 0.7", "end 0.45"],
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

  const nodeOn = (i) => p >= 0.08 + i * 0.28;
  const handoffOn = (i) => p >= 0.28 + i * 0.34;
  const showPlan = reduced ? false : p < 0.36;
  const showReviewer = reduced || p >= 0.62;

  return (
    <section id="team" className="relative bg-black px-6 md:px-14 pt-16 md:pt-20 pb-8 md:pb-10">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-6xl max-w-4xl">
          A PhD-led agent team for your spatial data
        </h2>
        <p className="mt-5 max-w-2xl text-lg text-snow/85 leading-relaxed">
          Every result carries its source, method and decision trail.
        </p>

        <div ref={trackRef} className={reduced ? "mt-10" : "mt-10 md:h-[120vh]"}>
          <div className={reduced ? "relative" : "md:sticky md:top-[10vh]"}>
            <div className="rounded-[4px] border border-white/10 bg-[#07080a] overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-stretch gap-2 sm:gap-0 p-3 md:p-4 border-b border-white/10">
                {NODES.map((n, i) => (
                  <div key={n.id} className="flex-1 flex flex-col sm:flex-row sm:items-center">
                    <div
                      className={`flex-1 rounded-[4px] border px-4 py-3 md:px-5 md:py-3 transition-colors ${
                        nodeOn(i)
                          ? "border-[#7eefe0]/50 bg-black/60"
                          : "border-white/10 bg-black/40"
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

              <div className="relative w-full aspect-[5/4] sm:aspect-[16/10] md:aspect-[16/9] max-h-[520px]">
                <TissueCanvas reduced={!!reduced} />
                <PlanCard visible={showPlan} />
                <ReviewerPanel visible={showReviewer} />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-[11.5px] text-dim">
                Public Xenium section AT4-FO-2 (de Jong et al., Nature 2026) · 2,500 of 50,000 displayed cells · 8 BANKSY domains
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
