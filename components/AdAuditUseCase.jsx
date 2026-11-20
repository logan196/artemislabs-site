// A one-page, static use-case brief: the AD-brain CODEX spatial reanalysis.
// Unlike GbmUseCase, there is no live portal behind this one — it is a
// reproducibility-audit demo, not a product tour, and is styled plainly to
// read that way. Images are real, restyled recreations from the project's
// own scripts (ad-plaque-analysis/figs.py, harden.py, plaque_objects.py).
export default function AdAuditUseCase() {
  return (
    <section id="use-case-audit" className="relative bg-ink px-6 md:px-14 py-16 md:py-24 border-t border-line">
      <div className="max-w-5xl mx-auto">
        <p className="font-mono text-[11px] tracking-wide text-violet/70 mb-3">USE CASE &middot; REPRODUCIBILITY AUDIT</p>
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">
          We killed two of our own three findings.
        </h2>
        <p className="mt-5 text-lg text-dim max-w-3xl">
          A single-section human AD-brain CODEX scan (117,552 cells, 33 protein markers).
          We ran the standard spatial-biology playbook, then put the result in front of a
          four-reviewer adversarial panel before calling anything a finding.
        </p>

        <div className="mt-10 grid md:grid-cols-3 gap-6">
          <div className="rounded-[4px] border border-line bg-panel/80 p-5">
            <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-amber mb-2">Retracted</p>
            <p className="text-snow text-sm leading-relaxed">
              &ldquo;Plaque-associated microglia&rdquo; and the distance-to-plaque story.
              No resolvable dense-core plaques in this section &mdash; robust across every
              DBSCAN parameter we swept.
            </p>
          </div>
          <div className="rounded-[4px] border border-line bg-panel/80 p-5">
            <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-dim mb-2">Demoted</p>
            <p className="text-snow text-sm leading-relaxed">
              Amyloid&ndash;microglial-activation co-localization. n&asymp;20 cells, sign
              flips between plaque definitions &mdash; a hypothesis sentence, not a result.
            </p>
          </div>
          <div className="rounded-[4px] border border-line bg-panel/80 p-5">
            <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-violet mb-2">Kept</p>
            <p className="text-snow text-sm leading-relaxed">
              T cells spatially self-aggregate (3.9&times; co-occurrence at 25 coordinate
              units) &mdash; survives a spillover-control gate and an independent
              re-annotation of the same cells.
            </p>
          </div>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-6 items-start">
          <figure className="m-0">
            <img src="/usecase-ad/finding-killed.png" alt="DBSCAN-based plaque object detection versus the rejected top-1% Amyloid-Beta anchor definition, showing no resolvable dense-core plaques." className="w-full h-auto rounded-md bg-white" />
            <figcaption className="mt-2 font-mono text-[11px] text-dim">Fig. &mdash; why the plaque story got killed</figcaption>
          </figure>
          <figure className="m-0">
            <img src="/usecase-ad/finding-kept.png" alt="Distance-resolved co-occurrence enrichment showing T-cell self-aggregation is robust across spatial scales." className="w-full h-auto rounded-md bg-white" />
            <figcaption className="mt-2 font-mono text-[11px] text-dim">Fig. &mdash; the one finding that survived</figcaption>
          </figure>
        </div>

        <p className="mt-10 text-dim max-w-3xl">
          This is not a discovery paper. It is what the figures, statistics, and methods
          text look like after we tried to break our own result &mdash; the same standard
          we hold your data to.
        </p>
        <a href="#contact" className="mt-6 inline-block font-mono text-[12px] text-violet underline underline-offset-4">
          Talk to us about your spatial data &rarr;
        </a>
      </div>
    </section>
  );
}
