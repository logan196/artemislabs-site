import Link from "next/link";

export const metadata = { title: "Artemis — variant review hub" };

const VARIANTS = [
  {
    href: "/",
    name: "V1 · Arrow Genesis",
    builder: "Claude (baseline)",
    pitch:
      "Artemis' arrow spells out the name, strikes the dodecahedron, and it shatters into 1,775 live GBM3 cells — channel pills, color-by-gene, tissue↔UMAP morphing. Logo click replays the intro.",
  },
  {
    href: "/v2",
    name: "V2 · Living Specimen",
    builder: "Opus agent",
    pitch:
      "Void-black confocal view of the GBM1 Visium specimen (4,764 spots) — cursor-tilt parallax, fluorescence channel HUD, and a docking inspect panel with real per-state readouts.",
  },
  {
    href: "/v3",
    name: "V3 · Agentic Portal",
    builder: "Opus agent",
    pitch:
      "The cooler, more agentic HuBMAP: an agent rail drives a live portal viewer in sync with its transcript — every number computed from the data at render time — over a grid of live portal cards.",
  },
  {
    href: "/v4",
    name: "V4 · Down the Barrel",
    builder: "Opus agent",
    pitch:
      "One scroll-scrubbed dive through scales: H&E → BANKSY domains on tissue → UMAP morph → gene expression, with the scrollbar as the focus knob.",
  },
  {
    href: "/v5",
    name: "V5 · Mission Control",
    builder: "Codex",
    pitch:
      "The ops room of an AI compbio team: radar-styled live telemetry over the GBM3 cells, honest computed tiles, an agent task feed, and the eight cores as stations.",
  },
];

export default function Compare() {
  return (
    <main className="min-h-screen bg-ink text-snow px-6 md:px-14 py-12">
      <p className="font-mono text-[12px] tracking-[0.35em] uppercase text-dim">
        internal · variant review
      </p>
      <h1 className="mt-3 text-4xl md:text-5xl font-semibold">
        Five landing experiences, <span className="text-violet">one dataset.</span>
      </h1>
      <p className="mt-4 max-w-2xl text-dim leading-relaxed">
        Every variant renders the same real data (GBM3 BANKSY cells — Ren et al.
        2023, GSE194329 — and the GBM1 Visium spots). Open each, feel it, then
        read the adversarial ranking below the grid.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {VARIANTS.map((v) => (
          <Link
            key={v.href}
            href={v.href}
            className="group rounded-[4px] border border-line bg-panel p-6 hover:border-violet transition-colors"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-xl font-semibold group-hover:text-violet transition-colors">
                {v.name}
              </h2>
              <span className="font-mono text-[11px] text-dim whitespace-nowrap">{v.builder}</span>
            </div>
            <p className="mt-3 text-[14.5px] text-dim leading-relaxed">{v.pitch}</p>
            <p className="mt-4 font-mono text-[12px] text-violet">open →</p>
          </Link>
        ))}
      </div>

      <section className="mt-14 max-w-3xl">
        <h2 className="text-2xl font-semibold">Adversarial ranking</h2>
        <p className="mt-3 text-dim text-[14.5px] leading-relaxed">
          See <code className="font-mono text-snow">VARIANT_RANKING.md</code> in the repo root — three
          independent judges (design/brand, scientific credibility,
          engineering/accessibility) scored every variant, then a synthesis pass
          ranked them and proposed what to graft between them.
        </p>
      </section>
    </main>
  );
}
