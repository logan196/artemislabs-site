export const metadata = {
  title: "About · Artemis BioLabs",
  description: "Founders, team, and prior research at Artemis BioLabs.",
};

const BOOK = "https://calendar.app.google/Gcn7m6neU3P3ktQA8";

export default function AboutPage() {
  return (
    <main className="bg-ink text-snow">
      <header className="flex items-center justify-between border-b border-line px-6 py-4 md:px-14">
        <a href="/" aria-label="Artemis BioLabs, home">
          <img src="/artemis_lockup.svg" alt="Artemis BioLabs" className="h-8 w-auto" />
        </a>
        <a href={BOOK} target="_blank" rel="noreferrer" className="rounded-[3px] bg-violet-deep px-4 py-1.5 text-[14px] font-medium text-ink">
          Book a call
        </a>
      </header>
      <article className="mx-auto max-w-3xl px-6 py-16 md:px-0">
        <p className="font-mono text-sm text-violet">ABOUT</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Co-founders</h1>
        <p className="mt-4 text-lg text-dim">Artemis BioLabs builds computational tools for working with biological data.</p>

        <h2 className="mt-12 text-2xl font-semibold">Logan Beharry</h2>
        <p className="mt-2 font-mono text-[12px] uppercase tracking-[0.14em] text-violet">Co-founder and CEO</p>
        <p className="mt-3 text-[15px] leading-relaxed text-dim">
          Previously at A2 Biotherapeutics (CAR-T process development) and Pfizer Medical Affairs.
          Education: Caltech and the Keck School of Medicine of USC.
          Bill Gross Prize for Entrepreneurship, 2024 runner-up.
          IND CoPilot, a Caltech project feature.
          USC Stem Cell scholarship recipient.
        </p>

        <h2 className="mt-10 text-2xl font-semibold">Bella Germano</h2>
        <p className="mt-2 font-mono text-[12px] uppercase tracking-[0.14em] text-violet">Co-founder and COO</p>
        <p className="mt-3 text-[15px] leading-relaxed text-dim">
          Current research at Cedars-Sinai.
          Education: Caltech, and an M.S. student in Regenerative and Stem Cell Technologies at Johns Hopkins University.
          Lee Summer Research Fellow, Keck School of Medicine of USC, 2026: studied ACOT12 in alcohol-associated liver disease, with a focus on hepatic lipid metabolism and histone lactylation.
          Co-reviewer for Cell, Cedars-Sinai, 2026.
          Co-author of an ophthalmology paper at Caltech.
        </p>

        <h2 className="mt-12 text-2xl font-semibold">Prior research</h2>
        <ul className="mt-4 space-y-4 text-[15px] leading-relaxed text-dim">
          <li>
            <a className="text-snow underline underline-offset-4" href="https://doi.org/10.1007/s00109-022-02206-2">Leukocyte cytokine responses in adult patients with mitochondrial DNA defects</a>
            . Karan et al., Journal of Molecular Medicine, 100, 963-971 (2022). Logan Beharry is acknowledged for assistance with the systematic literature review.
          </li>
          <li>
            <a className="text-snow underline underline-offset-4" href="https://doi.org/10.1016/j.jaapos.2024.103861">Effect of vertical central plication on vertical deviations</a>
            . Strube, Cheung, Germano, Hopman and Wright, Journal of AAPOS, 28(2), 103861 (2024). Bella R. Germano is a co-author, Caltech affiliation.
          </li>
        </ul>

        <h2 className="mt-12 text-2xl font-semibold">Also on the team</h2>
        <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-dim">
          <li>Haley Nessy, Chief of Growth. Legal studies, University of Toronto. Previously software sales at ADP.</li>
          <li>Samanda Saltibus, Chief of Compliance. University of Toronto.</li>
          <li>Emma Nemes, Intern. Biology, UCLA. Works on imaging-based spatial transcriptomics.</li>
        </ul>

        <h2 className="mt-12 text-2xl font-semibold">Founding principles</h2>
        <ul className="mt-4 space-y-2 text-[15px] text-dim">
          <li>Start with the specimen. Begin with what was measured.</li>
          <li>Show the work. Keep figures traceable to their source and method.</li>
          <li>Keep the lab in control. Researchers decide what moves forward.</li>
        </ul>
        <p className="mt-6 text-[15px] text-snow">Artemis BioLabs is funded by Bill Gross.</p>
        <p className="mt-8">
          <a href="/" className="text-violet underline underline-offset-4">Back to the homepage</a>
        </p>
      </article>
    </main>
  );
}
