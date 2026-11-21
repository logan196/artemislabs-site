"use client";

// Institution logo marquee — real marks, confirmed by the founder; printed-ink
// treatment (grayscale at rest, true colors on hover).
const LOGOS = [
  { src: "logos/stanford.svg", alt: "Stanford University", h: "h-12" },
  { src: "logos/caltech.svg", alt: "Caltech", h: "h-12" },
  { src: "logos/mit.svg", alt: "MIT", h: "h-11" },
  { src: "logos/stjude.svg", alt: "St. Jude Children's Research Hospital", h: "h-12" },
  { src: "logos/a2.png", alt: "A2 Biotherapeutics", h: "h-12" },
  { src: "logos/pfizer.svg", alt: "Pfizer", h: "h-12" },
  { src: "logos/columbia.svg", alt: "Columbia University", h: "h-9" },
  { src: "logos/princeton.svg", alt: "Princeton University", h: "h-9" },
  { src: "logos/usc.svg", alt: "USC Keck", h: "h-12" },
  { src: "logos/ucsf.svg", alt: "UCSF", h: "h-12" },
];

export default function ClientMarquee() {
  const row = [...LOGOS, ...LOGOS];
  return (
    <section aria-label="Institutions" className="border-y border-line bg-panel/70 py-6 overflow-hidden">
      <p className="text-center font-mono text-[11px] tracking-[0.25em] text-dim uppercase mb-5">
        Where our team has trained and collaborated
      </p>
      <div className="marquee relative">
        <div className="marquee-track flex items-center gap-16 w-max pr-16">
          {row.map((l, i) => (
            <img
              key={i}
              src={l.src}
              alt={i < LOGOS.length ? l.alt : ""}
              aria-hidden={i >= LOGOS.length}
              className={`${l.h} w-auto opacity-95 hover:opacity-100 transition-all duration-300`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
