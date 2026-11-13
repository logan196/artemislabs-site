"use client";

// Institution marquee — text wordmarks in the manuscript voice (deliberately
// not official logo files: trademark-safe, and classier on paper).
const NAMES = [
  "Stanford", "Caltech", "MIT", "St. Jude", "A2 Biotherapeutics",
  "Pfizer", "USC Keck", "UCSF",
];

export default function ClientMarquee() {
  const row = [...NAMES, ...NAMES];
  return (
    <section aria-label="Institutions" className="border-y border-line bg-panel/60 py-5 overflow-hidden">
      <p className="text-center font-mono text-[11px] tracking-[0.25em] text-dim uppercase mb-3">
        Our team has trained and worked with researchers at
      </p>
      <div className="marquee relative">
        <div className="marquee-track flex items-center gap-12 whitespace-nowrap w-max">
          {row.map((n, i) => (
            <span
              key={i}
              aria-hidden={i >= NAMES.length}
              className="font-semibold tracking-[0.14em] text-[17px] text-dim hover:text-snow transition-colors uppercase"
            >
              {n}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
