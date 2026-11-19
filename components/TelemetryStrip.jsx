"use client";

// AI-company telemetry bar — three hard differentiators in a hairline grid.
// No ornament: mono metadata tags, big numerals, one line of plain truth each.
const METRICS = [
  {
    tag: "CORE // ON-DEMAND",
    value: "24/7",
    label: "A computational core on your demand",
    sub: "No three-week facility queue.",
  },
  {
    tag: "ITERATIONS // UNCAPPED",
    value: "∞",
    label: "Unlimited iterations on every hypothesis",
    sub: "Dedicated analysts, not ticket numbers.",
  },
  {
    tag: "CODE // SHIPPED",
    value: "100%",
    label: "Reproducible by construction",
    sub: "Live portals, raw scripts, publication-ready figures.",
  },
];

export default function TelemetryStrip() {
  return (
    <section aria-label="Service guarantees" className="border-y border-line bg-ink-2/60">
      <div className="max-w-7xl mx-auto grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-line">
        {METRICS.map((m) => (
          <div key={m.tag} className="px-6 md:px-10 py-8">
            <p className="font-mono text-[10.5px] tracking-[0.22em] text-dim mb-4">{m.tag}</p>
            <p className="flex items-baseline gap-3">
              <span className="text-4xl md:text-[2.75rem] font-semibold tracking-tight text-violet leading-none">
                {m.value}
              </span>
              <span className="text-[15px] text-snow leading-snug">{m.label}</span>
            </p>
            <p className="mt-3 text-[13.5px] text-dim">{m.sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
