const FIGURES = "/figures/";
const PDF = "/figures/downloads/Artemis_Figure_Booklet_share.pdf";

const STATS = [
  ["17,768", "Papers reviewed"],
  ["98", "Packages rebuilt"],
  ["329", "Figures from code"],
];

export default function FigureBookletPromo() {
  return (
    <section
      id="figure-booklet"
      className="relative px-6 md:px-14 pb-24 md:pb-32 max-w-7xl mx-auto"
    >
      <p className="font-mono text-sm text-violet mb-4">The Figure Booklet</p>
      <h2 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl">
        The Figure Booklet
      </h2>
      <p className="mt-6 max-w-2xl text-lg text-dim leading-relaxed">
        The figure types modern omics papers rely on, each rebuilt from
        code on public data. A systematic review of the plotting packages
        named in 17,768 open-access neuroscience omics papers
        (2023–2026), with a recreated gallery and the code behind every
        figure.
      </p>
      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        {STATS.map(([n, l]) => (
          <div key={l} className="rounded-[4px] border border-line bg-panel/70 p-5">
            <p className="text-4xl font-semibold tracking-tight">{n}</p>
            <p className="mt-2 font-mono text-[11px] tracking-[0.16em] uppercase text-dim">{l}</p>
          </div>
        ))}
      </div>
      <p className="mt-7 font-mono text-[12px] tracking-[0.16em] uppercase text-violet">
        Bulk · Single-cell · Spatial transcriptomics
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:items-center">
        <a
          href={FIGURES}
          className="inline-flex items-center justify-center rounded-[3px] bg-snow text-ink px-7 py-3 font-medium hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet transition-colors"
        >
          Open the full Figure Booklet 
        </a>
        <a
          href={PDF}
          className="inline-flex items-center justify-center rounded-[3px] border border-snow/50 px-7 py-3 text-dim hover:text-snow hover:border-violet transition-all"
        >
          Download the booklet PDF
        </a>
      </div>
    </section>
  );
}
