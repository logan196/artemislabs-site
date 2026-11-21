"use client";

import { useEffect, useRef } from "react";
import Reveal from "./Reveal";
import { BOOKING } from "@/lib/links";

const TIERS = [
  {
    n: "01",
    name: "Annealing",
    price: "$3,000",
    unit: "one scoped month",
    body: "Start with one question, one agreed analysis, a results walkthrough, and a handoff your lab can rerun.",
    cta: "Book Annealing",
    hunt: false,
    recommended: false,
  },
  {
    n: "02",
    name: "Hybridizing",
    price: "$2,000",
    unit: "per month, 3 months ($6,000 total)",
    body: "Keep the queue moving. Weekly working sessions, a prioritized project queue, and literature updates tied to active work.",
    cta: "Book Hybridizing",
    hunt: false,
    recommended: true,
  },
  {
    n: "03",
    name: "Join the Hunt",
    price: "$5,000",
    unit: "per month",
    body: "Your lab gets its own software, an ongoing research partnership, and direct access to Artemis scientists.",
    cta: "Join the Hunt",
    hunt: true,
    recommended: false,
  },
];

const INCLUDED = [
  "Interactive results portal",
  "Dedicated lab workspace",
  "Always-on AI agents tailored to the lab",
  "Referenced report with publication-ready figures",
  "Rerunnable code",
  "Early access to research previews",
];

function TickField({ strong = false }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let running = true;

    const draw = (now) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w < 2 || h < 2) {
        if (!reduced && running) raf = requestAnimationFrame(draw);
        return;
      }
      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const pulse = reduced ? 0.55 : 0.4 + 0.28 * Math.sin(now / 850);
      const gain = strong ? 1.35 : 0.72;
      const cols = Math.ceil(w / 8);
      const rows = Math.ceil(h / 16);
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const n = ((c * 17 + r * 31) % 100) / 100;
          if (n < 0.55) continue;
          const alpha = (0.08 + (n - 0.55) * 0.7) * gain * (0.75 + pulse);
          ctx.fillStyle = n > 0.82 ? `rgba(20,184,166,${alpha})` : `rgba(232,238,246,${alpha * 0.75})`;
          ctx.fillRect(c * 8 + 2, r * 16 + 5, 1.7, 8);
        }
      }
      if (!reduced && running) raf = requestAnimationFrame(draw);
    };

    const io = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
      if (running) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(draw);
      }
    });
    io.observe(canvas);
    draw(performance.now());
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [strong]);

  return <canvas ref={ref} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />;
}

export default function PricingSection() {
  return (
    <section id="partner" className="relative border-y border-line bg-ink py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-6 md:px-14">
        <Reveal>
          <p className="mb-4 font-mono text-sm text-violet">PARTNER WITH US</p>
          <h2 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">Join the Hunt.</h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-dim">
            Bring the question. Leave with the portal, the figures, and code your lab can rerun.
          </p>
        </Reveal>

        <div className="mt-14 grid items-stretch gap-5 lg:grid-cols-3">
          {TIERS.map((t) => (
            <div key={t.name} className={`relative ${t.recommended ? "pt-3" : ""}`}>
              {t.recommended ? (
                <p className="absolute left-6 top-0 z-20 rounded-[3px] bg-violet-deep px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-ink">
                  Recommended
                </p>
              ) : null}
            <article
              className={`tier-card relative flex h-full flex-col overflow-hidden rounded-[4px] border p-6 md:p-7 ${
                t.hunt ? "tier-hunt" : ""
              } ${t.recommended ? "tier-rec" : ""}`}
            >
              <TickField strong={t.hunt} />
              <div className="relative z-10 flex flex-1 flex-col">
                <p className="font-mono text-[12px] tracking-[0.16em] text-violet">{t.n}</p>
                <h3 className={`mt-3 font-semibold tracking-tight ${t.hunt ? "text-3xl md:text-4xl" : "text-2xl"}`}>{t.name}</h3>
                <p className="mt-4 text-3xl font-medium tracking-tight text-snow">{t.price}</p>
                <p className="mt-1 text-[14px] text-dim">{t.unit}</p>
                <p className="mt-5 flex-1 text-[15.5px] leading-relaxed text-snow/90">{t.body}</p>
                <a
                  href={BOOKING}
                  target="_blank"
                  rel="noreferrer"
                  className={`mt-7 inline-flex items-center justify-center rounded-[3px] px-5 py-3 text-center text-[15px] font-medium ${
                    t.hunt
                      ? "bg-violet-deep text-ink hover:bg-violet glow-ring"
                      : "border border-snow/40 text-snow hover:border-violet"
                  }`}
                >
                  {t.cta}
                </a>
              </div>
            </article>
            </div>
          ))}
        </div>

        <Reveal delay={0.08} className="mt-14">
          <h3 className="text-xl font-semibold tracking-tight text-snow">In every engagement</h3>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {INCLUDED.map((item) => (
              <li key={item} className="rounded-[4px] border border-line bg-panel/70 px-4 py-3 text-[15px] text-dim">
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-3xl text-[14px] leading-relaxed text-dim">
            Scope and purchase-order terms are agreed in writing before work starts.
          </p>
          <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-dim">
            Robotics access is subject to availability and agreed scope. Experimental previews are not validated workflows.
          </p>
          <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-dim">
            Research support only. No wet-lab work. No clinical or diagnostic interpretation.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
