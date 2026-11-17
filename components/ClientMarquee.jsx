"use client";

// Institution logo marquee — real marks, confirmed by the founder.
// Same set as the Nov 13 site. On the black ground most marks are rendered
// as white monochrome so they stay readable; two-tone marks (Caltech's seal)
// keep their color so they don't collapse into a solid disc.
const LOGOS = [
  { src: "logos/stanford.svg", alt: "Stanford University", h: "h-12 md:h-14" },
  { src: "logos/caltech.svg", alt: "Caltech", h: "h-12 md:h-14", color: true },
  { src: "logos/mit.svg", alt: "MIT", h: "h-11 md:h-12" },
  { src: "logos/stjude.svg", alt: "St. Jude Children's Research Hospital", h: "h-12 md:h-14" },
  { src: "logos/a2.png", alt: "A2 Biotherapeutics", h: "h-12 md:h-14" },
  { src: "logos/pfizer.svg", alt: "Pfizer", h: "h-12 md:h-14" },
  { src: "logos/columbia.svg", alt: "Columbia University", h: "h-9 md:h-11" },
  { src: "logos/princeton.svg", alt: "Princeton University", h: "h-9 md:h-11" },
  { src: "logos/usc.svg", alt: "USC Keck", h: "h-12 md:h-14" },
  { src: "logos/ucsf.svg", alt: "UCSF", h: "h-12 md:h-14" },
];

export default function ClientMarquee() {
  const row = [...LOGOS, ...LOGOS];
  return (
    <section aria-label="Institutions" className="border-t border-white/10 bg-black py-6 md:py-8 overflow-hidden">
      <p className="text-center font-mono text-[11px] tracking-[0.25em] text-snow/55 uppercase mb-5">
        Where our team has trained and collaborated
      </p>
      <div className="marquee relative">
        <div className="marquee-track flex items-center gap-16 md:gap-20 w-max pr-16 md:pr-20">
          {row.map((l, i) => (
            <img
              key={i}
              src={l.src}
              alt={i < LOGOS.length ? l.alt : ""}
              aria-hidden={i >= LOGOS.length}
              className={`${l.h} w-auto opacity-95 hover:opacity-100 transition-all duration-300 ${
                l.color
                  ? ""
                  : "[filter:grayscale(1)_brightness(0)_invert(1)] hover:[filter:none]"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
