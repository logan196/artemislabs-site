export const metadata = {
  title: "Delivered alive · Artemis BioLabs",
  description: "A fixed mouse blastomere specimen, shown as measured planes rather than a generated movie.",
};

const BOOK = "https://calendar.app.google/Gcn7m6neU3P3ktQA8";

export default function DeliveredPage() {
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
        <p className="font-mono text-sm text-violet">SPECIMEN</p>
        <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight md:text-5xl">
          What if your data were delivered alive?
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-dim">
          Fixed fluorescence from a mouse blastomere compaction study. The opening image projects 14 sampled planes from one 61-plane TIFF. Scrolling the study separates seven of those same measured planes. This is not a live embryo recording or a prediction.
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-dim">
          The measurements are per-plane, per-channel means and 99th percentiles from the original 16-bit pixels. Color, contrast, and crop are display settings, not stain assignments. Plane positions are ordinal, not calibrated depths.
        </p>
        <p className="mt-4 font-mono text-[12px] text-violet">Public data: S-BIAD1057</p>
        <ul className="mt-6 space-y-2 text-[15px]">
          <li><a className="text-snow underline underline-offset-4" href="https://www.ebi.ac.uk/biostudies/BioImages/studies/S-BIAD1057">BioImage Archive deposit</a></li>
          <li><a className="text-snow underline underline-offset-4" href="https://doi.org/10.1016/j.bpj.2024.03.028">de Plater et al. study</a></li>
          <li><a className="text-snow underline underline-offset-4" href="https://creativecommons.org/publicdomain/zero/1.0/">CC0</a></li>
        </ul>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <a href={BOOK} target="_blank" rel="noreferrer" className="inline-block rounded-[3px] bg-violet-deep px-6 py-3 text-center font-medium text-ink">
            Book a call
          </a>
          <a href="/" className="inline-block rounded-[3px] border border-snow/40 px-6 py-3 text-center text-snow">
            Back to the homepage
          </a>
        </div>
      </article>
    </main>
  );
}
