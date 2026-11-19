import Hero from "@/components/Hero";
import HeroEditorial from "@/components/HeroEditorial";

export const metadata = {
  title: "Hero options · Artemis BioLabs",
  description: "Side-by-side hero directions for review.",
};

function Label({ tag, name, blurb, notes }) {
  return (
    <div className="sticky top-0 z-50 border-b border-line bg-ink/95 px-6 py-4 backdrop-blur md:px-14">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="rounded-[3px] bg-violet px-2.5 py-1 font-mono text-[12px] font-semibold tracking-[0.18em] text-ink">
          {tag}
        </span>
        <h2 className="text-xl font-semibold text-snow">{name}</h2>
        <p className="text-[14px] text-dim">{blurb}</p>
      </div>
      <p className="mt-2 max-w-4xl font-mono text-[11.5px] leading-relaxed text-[#93a7ad]">{notes}</p>
    </div>
  );
}

export default function Variants() {
  return (
    <main className="bg-ink">
      <div className="px-6 py-10 md:px-14">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-violet">Internal review</p>
        <h1 className="mt-3 text-3xl font-semibold text-snow md:text-4xl">Two hero directions</h1>
        <p className="mt-3 max-w-2xl text-dim">
          Both render the same specimen — AT14, the glioblastoma section already used further down the
          homepage. They differ in what they do with it. Scroll through both, then pick one.
        </p>
      </div>

      <Label
        tag="A"
        name="Halftone"
        blurb="arda.ai's actual mechanism, applied to real tissue"
        notes="The section is downsampled to a luminance grid and re-emitted as tick marks wherever local darkness beats a fixed per-column random threshold — the exact method arda uses, read out of their bundle. Reveals row by row. Reads as instrument output. Strength: technical, unmistakably ours, nobody else can show this specimen. Risk: still a dark-mode canvas effect, which is the look the critique called generic."
      />
      <Hero />

      <Label
        tag="B"
        name="Editorial"
        blurb="the specimen graded, not redrawn — serif display, asymmetric"
        notes="The H&E stays photographic; a mix-blend-mode: color pass replaces its hue and chroma while leaving luminance intact, so the tissue's own structure carries the image. Serif display against mono figure labels, left-aligned on an asymmetric grid, headline is a claim rather than the company name. Strength: looks like nothing else in the category and answers the 'your name is the biggest object' critique. Risk: further from the arda reference you liked."
      />
      <HeroEditorial />

      <div className="px-6 py-16 text-center md:px-14">
        <p className="font-mono text-[12px] text-dim">
          Tell me A or B — or which half of each — and I&rsquo;ll make it the homepage.
        </p>
      </div>
    </main>
  );
}
