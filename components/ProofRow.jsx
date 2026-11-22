// Counts already printed elsewhere on the site. Nothing new is introduced here.
// 3,938,808: public/live/brain/index.html
// 8: PrismaStory N_SECTIONS, the eight glioblastoma sections on this page
// 1,775: UmapExplorer, GBM3 spots from Ren et al. 2023
const FACTS = [
  ["3,938,808", "cells, whole-brain MERFISH"],
  ["8", "glioblastoma sections, one portal"],
  ["1,775", "spots in the GBM3 figure"],
];

export default function ProofRow() {
  return (
    <section aria-label="Counts from the public demos" className="border-y border-line bg-ink">
      <ul className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-3 md:px-14">
        {FACTS.map(([n, label]) => (
          <li key={label} className="flex items-baseline gap-3">
            <span className="font-mono text-[15px] text-violet">{n}</span>
            <span className="text-[13.5px] text-dim">{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
