"use client";

// Institution marquee — plain text wordmarks only (logos removed per legal review).
const NAMES = [
  "Stanford",
  "Caltech",
  "MIT",
  "St. Jude",
  "A2 Biotherapeutics",
  "Pfizer",
  "USC Keck",
  "UCSF",
];

export default function ClientMarquee() {
  const row = [...NAMES, ...NAMES];
  return (
    <section aria-label="Institutions" className="border-y border-line bg-panel/70 py-6 overflow-hidden">
      <p className="text-center font-mono text-[11px] tracking-[0.25em] text-dim uppercase mb-5">
        Our team has trained and worked with researchers at
      </p>
      <div className="marquee relative">
        <div className="marquee-track flex items-center gap-16 w-max pr-16">
          {row.map((name, i) => (
            <span
              key={i}
              aria-hidden={i >= NAMES.length}
              className="uppercase tracking-wide text-dim hover:text-snow text-[17px] font-semibold whitespace-nowrap transition-colors duration-300"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
