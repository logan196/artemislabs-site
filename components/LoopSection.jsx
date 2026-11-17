"use client";

// How an engagement runs: a compact five-step row. A thin line fills as the
// row scrolls into view; static under reduced motion.
import { useEffect, useRef, useState } from "react";

const STEPS = [
  ["Scope", "Your question and your data: in-house runs or your lab's GEO series. We agree a written plan first."],
  ["Ingest and QC", "Standard pipelines with quality control, coordinate checks and recorded provenance."],
  ["Analyze", "Spatial, single-cell and genomics methods, with more than one method run on the same question."],
  ["Review", "A methods reviewer checks where methods agree and writes the limits next to the findings."],
  ["Deliver", "Figures, code and a live portal. Your feedback scopes the next round."],
];

export default function LoopSection() {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setOn(true); return; }
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setOn(true), { threshold: 0.4 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <section id="loop" ref={ref} className="relative px-6 md:px-14 py-16 md:py-20 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-[300px_1fr] gap-10 lg:gap-16">
        <div>
          <h2 className="text-3xl md:text-4xl">How an engagement runs</h2>
          <p className="mt-4 text-[15.5px] text-dim leading-relaxed">
            The same cycle a good core facility runs, on your data, with every step written down.
          </p>
        </div>
        <ol className="relative grid sm:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-8 pt-6">
          <span className="hidden lg:block absolute top-0 left-0 right-0 h-px bg-white/10" aria-hidden />
          <span
            className="hidden lg:block absolute top-0 left-0 h-px bg-violet transition-[width] duration-[2200ms] ease-out"
            style={{ width: on ? "100%" : "0%" }}
            aria-hidden
          />
          {STEPS.map(([t, b], i) => (
            <li key={t} className="relative">
              <span
                className="hidden lg:block absolute -top-[29px] left-0 h-2 w-2 rounded-full bg-violet transition-opacity duration-500"
                style={{ opacity: on ? 1 : 0.25, transitionDelay: `${i * 400}ms` }}
                aria-hidden
              />
              <p className="text-[13px] text-dim tabular-nums">{i + 1}</p>
              <p className="mt-1 text-[17px] text-snow font-medium">{t}</p>
              <p className="mt-2 text-[14px] text-dim leading-relaxed">{b}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
