"use client";

import { useEffect, useRef } from "react";
import Reveal from "./Reveal";

const MARKS = [
  { src: "logos/caltech-wordmark.png", alt: "Caltech", delay: "0s" },
  { src: "logos/pfizer.svg", alt: "Pfizer", delay: "0.4s" },
  { src: "logos/a2-white.svg", alt: "A2 Biotherapeutics", delay: "0.8s" },
  { src: "logos/usc.svg", alt: "USC", delay: "1.2s" },
  { src: "logos/johns-hopkins.png", alt: "Johns Hopkins University", delay: "1.6s" },
  { src: "logos/cedars-sinai.svg", alt: "Cedars-Sinai", delay: "2s" },
];

function FounderMarks() {
  const row = [...MARKS, ...MARKS];
  return (
    <div className="founder-marquee relative mt-10 overflow-hidden py-4" aria-label="Institutions in the founders' path">
      <div className="founder-track flex w-max items-center gap-14 pr-14">
        {row.map((mark, i) => (
          <span
            key={`${mark.alt}-${i}`}
            role="img"
            aria-label={i < MARKS.length ? mark.alt : undefined}
            aria-hidden={i >= MARKS.length}
            className="founder-mark"
            style={{
              WebkitMaskImage: `url(${mark.src})`,
              maskImage: `url(${mark.src})`,
              animationDelay: mark.delay,
            }}
          />
        ))}
      </div>
    </div>
  );
}

const LOGAN = [
  { k: "Previously", v: "A2 Biotherapeutics, CAR-T process development" },
  { k: "Previously", v: "Pfizer, Medical Affairs" },
  { k: "Education", v: "Caltech" },
  { k: "Education", v: "Keck School of Medicine of USC" },
];

const BELLA = [
  { k: "Now", v: "Cedars-Sinai" },
  { k: "Education", v: "Caltech" },
  { k: "Education", v: "Johns Hopkins University, M.S. student, Regenerative and Stem Cell Technologies" },
];

const PRESS = [
  {
    title: "Bill Gross Prize for Entrepreneurship",
    note: "Caltech News, 2024 runner-up",
    href: "https://www.caltech.edu/about/news/bill-gross-business-plan-competition",
  },
  {
    title: "IND CoPilot",
    note: "Caltech project feature",
    href: "https://initiativeforstudents.caltech.edu/story-listings/on-your-mark-get-set-launch/",
  },
  {
    title: "USC Stem Cell scholarship",
    note: "Recipient profile",
    href: "https://stemcell.keck.usc.edu/meet-the-scholarship-recipients-in-uscs-stem-cell-masters-program/",
  },
];

const PAPERS = [
  {
    year: "2022",
    title: "Leukocyte cytokine responses in adult patients with mitochondrial DNA defects",
    cite: "Karan et al., Journal of Molecular Medicine, 100, 963-971",
    credit: "Logan Beharry is acknowledged for assistance with the systematic literature review.",
    href: "https://doi.org/10.1007/s00109-022-02206-2",
  },
  {
    year: "2024",
    title: "Effect of vertical central plication on vertical deviations",
    cite: "Strube, Cheung, Germano, Hopman and Wright, Journal of AAPOS, 28(2), 103861",
    credit: "Bella R. Germano is a co-author, with a Caltech affiliation.",
    href: "https://doi.org/10.1016/j.jaapos.2024.103861",
  },
];

function TreeSvg() {
  const ref = useRef(null);
  useEffect(() => {
    const path = ref.current;
    if (!path) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      path.style.strokeDashoffset = "0";
    }
  }, []);
  return (
    <svg viewBox="0 0 800 120" className="mx-auto hidden h-28 w-full max-w-4xl md:block" aria-hidden>
      <path
        ref={ref}
        className="tree-stroke"
        d="M200 0 C200 48, 400 48, 400 96 M600 0 C600 48, 400 48, 400 96"
      />
    </svg>
  );
}

function Profile({ name, role, img, rows, children }) {
  return (
    <article className="rounded-[4px] border border-line bg-panel/70 p-6">
      <img src={img} alt="" className="h-28 w-28 rounded-[4px] border border-line object-cover" />
      <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-violet">{role}</p>
      <h3 className="mt-1 text-2xl font-medium text-snow">{name}</h3>
      <ul className="mt-5 space-y-2">
        {rows.map((row) => (
          <li key={row.v} className="text-[14.5px] leading-snug text-dim">
            <span className="text-snow/80">{row.k}. </span>
            {row.v}
          </li>
        ))}
      </ul>
      {children}
    </article>
  );
}

export default function FounderTree() {
  return (
    <section id="founders" className="mx-auto max-w-7xl px-6 py-24 md:px-14 md:py-36">
      <Reveal>
        <p className="mb-4 font-mono text-sm text-violet">FOUNDERS</p>
        <h2 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
          Two founders. One lab.
        </h2>
        <p className="mt-5 max-w-2xl text-lg text-dim">
          Logan Beharry and Bella Germano. They met at Caltech, in Pasadena.
        </p>
      </Reveal>
      <FounderMarks />

      <Reveal delay={0.06} className="mt-12">
        <div className="grid gap-4 md:grid-cols-2">
          <Profile name="Logan Beharry" role="Founder & CEO" img="team/logan-beharry.webp" rows={LOGAN}>
            <div className="mt-5 border-t border-line pt-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-violet">Selected coverage</p>
              <ul className="mt-3 space-y-2">
                {PRESS.map((p) => (
                  <li key={p.href}>
                    <a href={p.href} target="_blank" rel="noreferrer" className="text-[14.5px] text-snow hover:text-violet">
                      {p.title}
                      <span className="mt-0.5 block text-[13px] text-dim">{p.note}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Profile>
          <Profile name="Bella Germano" role="Co-founder & COO" img="team/bella-germano.webp" rows={BELLA}>
            <div className="mt-5 space-y-3 border-t border-line pt-4 text-[14.5px] leading-relaxed text-dim">
              <p>
                <span className="text-snow">Lee Summer Research Fellow, Keck School of Medicine of USC, 2026.</span>{" "}
                Studied ACOT12 in alcohol-associated liver disease, with a focus on hepatic lipid metabolism and histone lactylation.
              </p>
              <p>
                <span className="text-snow">Co-reviewer for Cell, Cedars-Sinai, 2026.</span>{" "}
                Contributed to a manuscript review by evaluating experimental methods and biological data.
              </p>
            </div>
          </Profile>
        </div>
        <div className="mx-auto my-3 h-10 w-px bg-[#8fd4da] md:hidden" aria-hidden />
        <TreeSvg />
        <ol className="mx-auto mt-2 grid max-w-3xl gap-3 md:mt-0" aria-label="From Caltech to Artemis">
          <li className="flex items-center gap-4 rounded-[4px] border border-line bg-ink px-5 py-4">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-violet shadow-[0_0_12px_#14b8a6]" />
            <span>
              <span className="block font-medium text-snow">Caltech</span>
              <span className="block text-[14px] text-dim">Where we met, in Pasadena.</span>
            </span>
          </li>
          <li className="flex items-center gap-4 rounded-[4px] border border-violet/40 bg-panel px-5 py-4 shadow-[0_0_40px_-18px_rgba(20,184,166,0.85)]">
            <img src="brand/artemis-emblem.v1.png" alt="" className="h-12 w-12 object-contain" />
            <span>
              <span className="block font-medium text-snow">Artemis BioLabs</span>
              <span className="block text-[14px] text-dim">We build tools to explore biological data.</span>
            </span>
          </li>
        </ol>
      </Reveal>

      <Reveal delay={0.08} className="mt-16">
        <h3 className="font-mono text-[12px] uppercase tracking-[0.18em] text-violet">Prior research</h3>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {PAPERS.map((p) => (
            <a key={p.href} href={p.href} target="_blank" rel="noreferrer" className="lit-card block rounded-[4px] border border-line bg-panel/60 p-5">
              <p className="font-mono text-[11px] text-violet">{p.year}</p>
              <p className="mt-2 text-[17px] font-medium leading-snug text-snow">{p.title}</p>
              <p className="mt-2 text-[13.5px] text-dim">{p.cite}</p>
              <p className="mt-3 text-[14px] text-snow/80">{p.credit}</p>
            </a>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.1} className="mt-16">
        <h3 className="text-2xl font-medium text-snow">Also on the team</h3>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-[4px] border border-line bg-panel/50 p-5">
            <h4 className="text-lg text-snow">Haley Nessy</h4>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-violet">Chief of Growth</p>
            <p className="mt-2 text-[13px] text-dim">Legal studies, University of Toronto</p>
            <p className="mt-3 text-[14.5px] leading-relaxed text-dim">
              After five years in software sales at ADP, Haley leads growth, events, and philanthropy. Artemis offers pro bono data analysis to research labs, to help researchers find answers sooner for patients with critical or terminal illnesses.
            </p>
            <a className="mt-3 inline-block text-[14px] text-violet" href="https://www.linkedin.com/in/haley-nessy-677828149">LinkedIn</a>
          </article>
          <article className="rounded-[4px] border border-line bg-panel/50 p-5">
            <h4 className="text-lg text-snow">Samanda Saltibus</h4>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-violet">Chief of Compliance</p>
            <p className="mt-2 text-[13px] text-dim">University of Toronto</p>
            <a className="mt-3 inline-block text-[14px] text-violet" href="https://www.linkedin.com/in/samanda-saltibus-723b65212/">LinkedIn</a>
          </article>
          <article className="rounded-[4px] border border-line bg-panel/50 p-5">
            <img src="team/emma-nemes.v1.webp" alt="" className="mb-4 h-16 w-16 rounded-[4px] border border-line object-cover" />
            <h4 className="text-lg text-snow">Emma Nemes</h4>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-violet">Intern</p>
            <p className="mt-2 text-[13px] text-dim">Biology, UCLA</p>
            <p className="mt-3 text-[14.5px] leading-relaxed text-dim">
              Emma works in a lab focused on diffusion tensor imaging. At Artemis she works on imaging-based spatial transcriptomics.
            </p>
          </article>
        </div>
      </Reveal>
    </section>
  );
}
