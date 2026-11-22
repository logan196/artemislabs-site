export const metadata = {
  title: "Delivered alive · Artemis BioLabs",
  description: "A fixed mouse blastomere specimen, shown as measured planes rather than a generated movie.",
};

const BOOK = "https://calendar.app.google/Gcn7m6neU3P3ktQA8";

const NAV = [
  ["/#whatwedo", "What we do"],
  ["/#copilot", "Co-scientist"],
  ["/about/", "About"],
  ["/#stack", "The stack"],
];

// The optical stack is the self-contained viewer originally published at
// gh-pages specimen/index.html (about 3 MB, images inlined as data URIs).
// It lives at public/specimen/index.html and is copied into the static
// export, so /delivered lazy-loads /specimen/index.html. A deploy that
// publishes the contents of out/ keeps the viewer. It does not depend on
// a leftover specimen/ directory on gh-pages.

export default function DeliveredPage() {
  return (
    <main className="grain relative min-h-screen bg-ink text-snow">
      <div className="bg-sea" aria-hidden />
      <header className="relative z-10 border-b border-line">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-14 md:py-5">
          <a href="/" aria-label="Artemis BioLabs, home">
            <img src="/artemis_lockup.svg" alt="Artemis BioLabs" className="h-8 w-auto md:h-11" />
          </a>
          <div className="flex items-center gap-3 md:gap-8">
            <div className="hidden items-center gap-8 text-[14.5px] font-medium md:flex">
              {NAV.map(([href, label]) => (
                <a key={href} href={href} className="whitespace-nowrap text-snow transition-colors hover:text-violet">
                  {label}
                </a>
              ))}
            </div>
            <a
              href={BOOK}
              target="_blank"
              rel="noreferrer"
              className="whitespace-nowrap rounded-[3px] border border-snow/50 px-4 py-1.5 text-[14.5px] text-snow transition-all hover:border-violet hover:bg-violet/10"
            >
              Book a demo
            </a>
            <details className="relative md:hidden">
              <summary className="cursor-pointer list-none select-none rounded-[3px] border border-snow/50 px-3 py-1.5 text-snow" aria-label="Open navigation menu">
                Menu
              </summary>
              <div className="absolute right-0 top-11 z-50 flex w-48 flex-col rounded-[4px] border border-line bg-panel p-2 shadow-xl">
                {NAV.map(([href, label]) => (
                  <a key={href} href={href} className="rounded-sm px-3 py-2 text-snow hover:bg-ink-2">
                    {label}
                  </a>
                ))}
              </div>
            </details>
          </div>
        </nav>
      </header>

      <article className="relative z-10 mx-auto max-w-6xl px-5 py-14 md:px-14 md:py-20">
        <p className="font-mono text-sm tracking-[0.16em] text-violet">SPECIMEN</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
          What if your data were delivered alive?
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-dim">
          Fixed fluorescence from a mouse blastomere compaction study. The opening image projects 14 sampled planes from one 61-plane TIFF. Scrolling the study separates seven of those same measured planes. This is not a live embryo recording or a prediction.
        </p>
        <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-dim">
          The measurements are per-plane, per-channel means and 99th percentiles from the original 16-bit pixels. Color, contrast, and crop are display settings, not stain assignments. Plane positions are ordinal, not calibrated depths.
        </p>

        <figure className="mt-10 overflow-hidden rounded-[4px] border border-line bg-[#030607] shadow-[0_24px_80px_-36px_rgba(20,184,166,0.45)]">
          <iframe
            title="Mouse blastomere optical stack. Scroll inside the frame to separate measured planes."
            src="/specimen/index.html"
            loading="lazy"
            className="block h-[78svh] min-h-[560px] w-full border-0 bg-[#030607]"
            referrerPolicy="no-referrer"
          />
          <figcaption className="flex flex-col gap-3 border-t border-line px-4 py-3 font-mono text-[12px] leading-relaxed text-dim sm:flex-row sm:items-center sm:justify-between">
            <span>Scroll inside the study. Seven measured planes separate from the opening projection.</span>
            <a href="/specimen/" className="shrink-0 text-violet underline underline-offset-4">
              Open the study
            </a>
          </figcaption>
        </figure>

        <p className="mt-8 font-mono text-[12px] tracking-[0.14em] text-violet">PUBLIC DATA: S-BIAD1057</p>
        <ul className="mt-4 space-y-2 text-[15px]">
          <li>
            <a className="text-snow underline underline-offset-4" href="https://www.ebi.ac.uk/biostudies/BioImages/studies/S-BIAD1057">
              BioImage Archive deposit
            </a>
          </li>
          <li>
            <a className="text-snow underline underline-offset-4" href="https://doi.org/10.1016/j.bpj.2024.03.028">
              de Plater et al. study
            </a>
          </li>
          <li>
            <a className="text-snow underline underline-offset-4" href="https://creativecommons.org/publicdomain/zero/1.0/">
              CC0
            </a>
          </li>
        </ul>

        <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center">
          <a
            href={BOOK}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-[3px] bg-violet-deep px-8 py-3.5 text-center font-medium text-ink transition-colors hover:bg-violet"
          >
            Book a call
          </a>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-[3px] border border-snow/50 px-8 py-3.5 text-center text-snow transition-all hover:border-violet hover:text-violet"
          >
            Back to the homepage
          </a>
        </div>
      </article>

      <footer className="relative z-10 mx-auto mt-8 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-line px-5 py-8 md:flex-row md:px-14">
        <span className="flex items-center gap-3">
          <img src="/artemis_mark.svg" alt="" className="h-8" />
          <span className="text-[14px] font-semibold tracking-[0.18em]">
            ARTEMIS <span className="font-mono text-[11px] tracking-[0.3em] text-violet">BIOLABS</span>
          </span>
        </span>
        <p className="font-mono text-[13px] text-dim">
          © 2026 Artemis BioLabs · computational biology, accelerated · artemislabs.bio
        </p>
      </footer>
    </main>
  );
}
