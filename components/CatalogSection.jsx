"use client";

import Reveal from "./Reveal";
import catalog from "@/lib/catalog.json";

const LIVE = new Set([
  "De Jong et al. 2025, GBM-Space (Visium + snRNA/snATAC)",
]);

export default function CatalogSection() {
  return (
    <section id="catalog" className="relative px-6 md:px-14 py-24 md:py-36 max-w-7xl mx-auto">
      <Reveal>
        <p className="font-mono text-sm text-violet mb-4">from our systematic review · verified accessions</p>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl rule-head inline-block">
          The public GBM spatial atlas, catalogued.
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-dim leading-relaxed">
          Every public spatial-transcriptomics dataset of glioblastoma we could verify —
          platform, scope, and accession — ready to drop into the pipeline. Rows marked
          ● are already live in the portal.
        </p>
      </Reveal>

      <Reveal delay={0.1} className="mt-10">
        <p className="font-mono text-[13px] text-snow mb-2">
          <span className="font-semibold">Table 1&nbsp;|</span>&nbsp;Public GBM spatial
          transcriptomics datasets (n = {catalog.length}).
        </p>
        <div className="overflow-x-auto border-y border-snow/70">
          <table className="w-full text-[14px] leading-relaxed min-w-[880px]">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="py-2.5 pr-4 font-semibold">Dataset</th>
                <th className="py-2.5 pr-4 font-semibold">Platform</th>
                <th className="py-2.5 pr-4 font-semibold">Scope</th>
                <th className="py-2.5 pr-4 font-semibold">Accession</th>
                <th className="py-2.5 font-semibold">Relevance</th>
              </tr>
            </thead>
            <tbody>
              {catalog.map((d) => (
                <tr key={d.dataset} className="border-b border-line/60 align-top hover:bg-panel transition-colors">
                  <td className="py-2.5 pr-4 max-w-[230px]">
                    {LIVE.has(d.dataset) && <span className="text-mint mr-1.5" title="Live in the portal">●</span>}
                    {d.dataset}
                  </td>
                  <td className="py-2.5 pr-4 text-dim max-w-[150px]">{d.platform}</td>
                  <td className="py-2.5 pr-4 text-dim max-w-[190px]">{d.scope}</td>
                  <td className="py-2.5 pr-4 font-mono text-[12.5px] max-w-[160px]">
                    <a href={d.url} target="_blank" rel="noreferrer" className="text-violet hover:underline break-words">
                      {d.accession}
                    </a>
                  </td>
                  <td className="py-2.5 text-dim">{d.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 font-mono text-[12px] text-dim">
          Accessions verified against GEO, BioStudies, Zenodo, Dryad and vendor pages. Ask for the full review.
        </p>
      </Reveal>
    </section>
  );
}
