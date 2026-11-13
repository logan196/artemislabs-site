"use client";

// Institution logo marquee — real marks, confirmed by the founder; printed-ink
// treatment (grayscale at rest, true colors on hover).
const LOGOS = [
  { src: "logos/stanford.svg", alt: "Stanford University", h: "h-7" },
  { src: "logos/caltech.svg", alt: "Caltech", h: "h-9" },
  { src: "logos/mit.svg", alt: "MIT", h: "h-8" },
  { src: "logos/stjude.svg", alt: "St. Jude Children's Research Hospital", h: "h-10" },
  { src: "logos/a2.svg", alt: "A2 Biotherapeutics", h: "h-8" },
  { src: "logos/pfizer.svg", alt: "Pfizer", h: "h-9" },
  { src: "logos/usc.svg", alt: "USC Keck", h: "h-9" },
  { src: "logos/ucsf.svg", alt: "UCSF", h: "h-7" },
];

export default function ClientMarquee() {
  const row = [...LOGOS, ...LOGOS];
  return (
    <section aria-label="Institutions" className="border-y border-line bg-panel/70 py-6 overflow-hidden">
      <p className="text-center font-mono text-[11px] tracking-[0.25em] text-dim uppercase mb-5">
        Our team has trained and worked with researchers at
      </p>
      <div className="marquee relative">
        <div className="marquee-track flex items-center gap-16 w-max pr-16">
          {row.map((l, i) => (
            <img
              key={i}
              src={l.src}
              alt={i < LOGOS.length ? l.alt : ""}
              aria-hidden={i >= LOGOS.length}
              className={`${l.h} w-auto grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
