import PricingSection from "@/components/PricingSection";
import FigureBookletPromo from "@/components/FigureBookletPromo";

const BOOKING = "https://calendar.app.google/Gcn7m6neU3P3ktQA8";

export const metadata = {
  title: "Pricing | Artemis BioLabs",
  description:
    "Artemis BioLabs engagement pricing: an embedded bioinformatics team for $3,000–$5,000 per month. Funded by Bill Gross. Open the Figure Booklet: 17,768 papers reviewed, 98 packages rebuilt, 329 figures from code.",
};

export default function PricingPage() {
  return (
    <main className="grain">
      <div className="bg-sea" aria-hidden />
      <header className="relative z-10 flex items-center justify-between px-5 md:px-14 py-4 md:py-5">
        <a href="/" aria-label="Artemis BioLabs — home">
          <img src="/artemis_lockup.svg" alt="Artemis BioLabs" className="h-8 md:h-11 w-auto" />
        </a>
        <nav className="flex items-center gap-6 text-[14.5px] text-snow">
          <a href="/about/" className="hidden md:inline hover:text-violet">About</a>
          <a href="/figures/" className="hidden md:inline hover:text-violet">Figure Booklet</a>
          <a href="/pricing/" className="hover:text-violet">Pricing</a>
          <a
            href={BOOKING}
            target="_blank"
            rel="noreferrer"
            className="rounded-[3px] border border-snow/50 px-4 py-1.5 text-snow hover:border-violet hover:bg-violet/10 transition-all"
          >
            Book a demo
          </a>
        </nav>
      </header>
      <p className="px-6 md:px-14 max-w-7xl mx-auto -mb-10 md:-mb-14">
        <span className="inline-block rounded-[3px] border border-violet/40 bg-violet/10 px-3.5 py-2 font-mono text-[12px] tracking-[0.16em] uppercase">
          Funded by Bill Gross
        </span>
      </p>
      <PricingSection bookingUrl={BOOKING} />
      <FigureBookletPromo />
    </main>
  );
}
