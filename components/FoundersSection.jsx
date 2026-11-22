"use client";

import Reveal from "./Reveal";

// Co-founders — copy and portraits mirror the live About Artemis record.
// Portraits live in this app's public/team directory.
const FOUNDERS = [
  {
    name: "Logan Beharry",
    role: "Co-founder & CSO",
    img: "team/logan-beharry.webp",
    credits: [
      "Previously · A2 Biotherapeutics (CAR-T process development)",
      "Pfizer · Medical Affairs",
      "Education · Caltech · USC",
      "Bill Gross Prize for Entrepreneurship · 2024 runner-up",
    ],
  },
  {
    name: "Bella Germano",
    role: "Co-founder & COO",
    img: "team/bella-germano.webp",
    credits: [
      "Current research · Cedars-Sinai",
      "Education · Caltech",
      "Ophthalmology publication · Caltech",
    ],
  },
];

// The records, not the résumé prose: live publisher captures, exact
// citations, and the contribution stated precisely (acknowledged ≠ author).
const PUBLICATIONS = [
  {
    tag: "Mitochondrial disease · 2022",
    title: "Leukocyte cytokine responses in adult patients with mitochondrial DNA defects",
    cite: "Karan et al. · Journal of Molecular Medicine · 100, 963–971",
    contribution:
      "Logan's contribution: acknowledged for assistance with the systematic literature review.",
    img: "pubs/mito-jmolmed-2022.png",
    alt: "Springer Nature page for 'Leukocyte cytokine responses in adult patients with mitochondrial DNA defects', Journal of Molecular Medicine 100, 963–971 (2022)",
    href: "https://doi.org/10.1007/s00109-022-02206-2",
  },
  {
    tag: "Ophthalmology · 2024",
    title: "Effect of vertical central plication on vertical deviations",
    cite: "Strube, Cheung, Germano, Hopman & Wright · Journal of AAPOS · 28(2), 103861",
    contribution: "Bella's contribution: co-author (Germano BR), Caltech affiliation.",
    img: "pubs/plication-epmc-2024.png",
    alt: "Europe PMC record for 'Effect of vertical central plication on vertical deviations', Journal of AAPOS 28(2):103861 (2024), authors Strube, Cheung, Germano, Hopman, Wright",
    href: "https://doi.org/10.1016/j.jaapos.2024.103861",
  },
];

export default function FoundersSection() {
  return (
    <section id="founders" aria-label="Co-founders" className="px-6 md:px-14 py-24 md:py-32 max-w-7xl mx-auto">
      <Reveal>
        <p className="font-mono text-sm text-violet mb-4">ABOUT ARTEMIS · CO-FOUNDERS</p>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl">
          Built by two scientists. <span className="text-violet">Met in Pasadena.</span>
        </h2>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="grid sm:grid-cols-2 gap-4 mt-12 max-w-4xl">
          {FOUNDERS.map((f) => (
            <div key={f.name} className="rounded-[4px] border border-line bg-panel/70 p-6">
              <img
                src={f.img}
                alt={f.name}
                className="h-24 w-24 rounded-[4px] object-cover mb-5 border border-line"
                loading="lazy"
              />
              <p className="text-[19px] font-medium">{f.name}</p>
              <p className="font-mono text-[12px] tracking-[0.12em] text-violet mt-1 uppercase">{f.role}</p>
              <ul className="mt-4 space-y-1.5">
                {f.credits.map((c) => (
                  <li key={c} className="text-[13.5px] text-dim leading-snug">{c}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.12}>
        <p className="font-mono text-[12px] tracking-[0.2em] text-violet uppercase mt-16 mb-5">
          In the literature
        </p>
        <div className="grid lg:grid-cols-2 gap-4 max-w-6xl">
          {PUBLICATIONS.map((p) => (
            <div key={p.title} className="rounded-[4px] border border-line bg-panel/70 overflow-hidden">
              <a href={p.href} target="_blank" rel="noreferrer" aria-label={`Open publisher record: ${p.title}`}>
                <img
                  src={p.img}
                  alt={p.alt}
                  loading="lazy"
                  className="w-full border-b border-line bg-white object-cover hover:opacity-90 transition-opacity"
                />
              </a>
              <div className="p-5">
                <p className="font-mono text-[11px] tracking-[0.18em] text-dim uppercase mb-2">{p.tag}</p>
                <p className="text-[16px] font-medium leading-snug">{p.title}</p>
                <p className="text-[13.5px] text-dim mt-1.5">{p.cite}</p>
                <p className="text-[13.5px] text-snow/80 mt-3">{p.contribution}</p>
                <a
                  href={p.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block font-mono text-[12px] text-violet hover:text-snow transition-colors"
                >
                  Publisher / DOI →
                </a>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
