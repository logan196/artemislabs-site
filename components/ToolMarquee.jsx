"use client";

// The tools and databases the stack speaks — mixed real marks + text badges.
const ITEMS = [
  { img: "logos/r.svg", alt: "R", h: "h-10" },
  { text: "Bioconductor" },
  { img: "logos/python.svg", alt: "Python", h: "h-10" },
  { text: "scanpy" },
  { img: "logos/nih.svg", alt: "NIH", h: "h-10" },
  { text: "GEO" },
  { text: "KEGG" },
  { text: "Enrichr" },
  { text: "Reactome" },
  { img: "logos/jupyter.svg", alt: "Jupyter", h: "h-11" },
  { text: "Nextflow" },
  { text: "CELLxGENE" },
  { text: "STRING" },
  { text: "Vitessce" },
];

export default function ToolMarquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <section aria-label="Tools and databases" className="border-y border-line bg-panel/70 py-5 overflow-hidden">
      <p className="text-center font-mono text-[11px] tracking-[0.25em] text-dim uppercase mb-4">
        Speaks the tools and databases you already trust
      </p>
      <div className="marquee relative">
        <div className="marquee-track-rev flex items-center gap-12 w-max pr-12">
          {row.map((it, i) => (
            it.img ? (
              <img
                key={i}
                src={it.img}
                alt={i < ITEMS.length ? it.alt : ""}
                aria-hidden={i >= ITEMS.length}
                className={`${it.h} w-auto opacity-90`}
              />
            ) : (
              <span
                key={i}
                aria-hidden={i >= ITEMS.length}
                className="font-mono text-[15px] font-semibold tracking-wide text-dim whitespace-nowrap"
              >
                {it.text}
              </span>
            )
          ))}
        </div>
      </div>
    </section>
  );
}
