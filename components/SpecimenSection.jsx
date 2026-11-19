"use client";

// ARTEMIS SPECIMEN STUDIES — teaser for the standalone scrollytelling study.
// The study itself is a self-contained page at /specimen/ (real fixed
// fluorescence, BioImage Archive S-BIAD1057, CC0 — with its caveats stated).
export default function SpecimenSection() {
  return (
    <section id="specimen" aria-label="Artemis specimen studies" className="border-y border-line bg-ink-2/50 px-6 md:px-14 py-20 md:py-24">
      <div className="max-w-6xl mx-auto grid md:grid-cols-[1fr_auto] items-center gap-8">
        <div>
          <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-violet mb-3">
            01 · Artemis specimen studies
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            One specimen, in depth.
          </h2>
          <p className="max-w-2xl text-[15.5px] text-dim leading-relaxed">
            Fixed fluorescence from a mouse blastomere compaction study — 61 measured
            planes from one TIFF, per-plane channel statistics in a downloadable CSV,
            display settings declared as display settings. Not a simulation, not a
            prediction: a deposit you can audit
            <span className="font-mono text-[13px] text-snow/70"> (BioImage Archive S-BIAD1057 · CC0)</span>.
          </p>
        </div>
        <a
          href="../specimen/"
          className="justify-self-start md:justify-self-end rounded-[3px] bg-violet-deep text-ink px-7 py-3.5 text-sm font-medium hover:bg-violet transition-colors whitespace-nowrap"
        >
          Open the specimen study →
        </a>
      </div>
    </section>
  );
}
