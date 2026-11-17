"use client";

// Spatial programs — real Xenium sections (de Jong et al., Nature 2026,
// gbmspace.org) rendered on pure black: BANKSY domains plus gene-program maps.
import Reveal from "./Reveal";

const DOM = [
  ["Cellular tumour", "#56B4E9"],
  ["Hypoxic core", "#E69F00"],
  ["Infiltrated", "#009E73"],
  ["Non-malignant", "#EDEDED"],
];

const PANELS = [
  { f: "at4_domains.jpg", l: "a", t: "BANKSY spatial domains", s: "AT4-FO-2", legend: true },
  { f: "at4_hypoxia.jpg", l: "b", t: "Hypoxia program", s: "VEGFA · BNIP3L · SERPINE1 · HILPDA", c: "#E69F00" },
  { f: "at4_prolif.jpg", l: "c", t: "Proliferation program", s: "MKI67 · TOP2A", c: "#56B4E9" },
  { f: "at4_myeloid.jpg", l: "d", t: "Myeloid program", s: "CD68 · AIF1 · CD163 · P2RY12 · PTPRC", c: "#D55E00" },
  { f: "at4_oligo.jpg", l: "e", t: "Oligodendrocyte / white-matter program", s: "MOBP · MOG", c: "#009E73" },
  { f: "at10_domains.jpg", l: "f", t: "BANKSY domains · second patient", s: "AT10-FO-1", legend: true },
];

const LIVE = [
  ["live/GBM1/index.html", "GBM1"], ["live/GBM2/index.html", "GBM2"], ["live/GBM3/portal.html", "GBM3 + co-scientist"],
  ["live/GBM4/index.html", "GBM4"], ["live/TenX_GBM/index.html", "10x GBM"], ["live/AT10/portal.html", "AT10"],
  ["live/explore/index.html", "Artemis Explore"], ["live/brain/index.html", "3.9M-cell mouse brain"], ["live/seqfish/portal.html", "seqFISH+ cortex"],
];

export default function SpatialPrograms() {
  return (
    <section id="gallery" className="relative bg-black border-y border-white/[0.06]">
      <div className="px-6 md:px-14 py-16 md:py-24 max-w-7xl mx-auto">
        <Reveal>
          <h2 className="mt-5 text-4xl md:text-6xl max-w-4xl">
            Spatial programs in glioblastoma
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-dim leading-relaxed">
            Two public glioblastoma Xenium sections (de Jong et al., <i>Nature</i> 2026), analysed
            end to end: BANKSY spatial domains, then gene programs mapped cell by cell. On section AT4-FO-2 (126,738
            cells), BANKSY domains track the authors&apos; hypoxia zones far more closely
            than position-only clustering (NMI 0.37 vs 0.14).
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {PANELS.map((p) => (
            <Reveal key={p.f}>
              <figure className="spatial-card">
                <div className="relative bg-black overflow-hidden">
                  <img src={`programs/${p.f}`} alt={`${p.t} — ${p.s}`} loading="lazy" className="spatial-shot w-full h-auto" />
                  <span className="spatial-letter absolute top-1 left-1 text-[15px] font-semibold text-white" style={{ fontFamily: "var(--font-inter), sans-serif" }}>{p.l}</span>
                  {p.c ? <span className="spatial-wash" style={{ background: `radial-gradient(ellipse at 50% 58%, ${p.c}66, transparent 68%)` }} /> : null}
                </div>
                <figcaption className="spatial-cap mt-3 border-t border-white/10 pt-3">
                  <p className="text-[14.5px] text-snow">{p.t}</p>
                  <p className="mt-1 font-mono text-[11px] text-dim">{p.s}</p>
                  {p.legend ? (
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                      {DOM.map(([n, c]) => (
                        <span key={n} className="spatial-legend flex items-center gap-1.5 font-mono text-[10.5px] text-dim">
                          <span className="spatial-swatch h-2 w-2 rounded-full" style={{ background: c }} />
                          {n}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-2 flex items-center gap-2 font-mono text-[10.5px] text-dim">
                      low
                      <span className="spatial-ramp h-1.5 w-24 rounded-full" style={{ background: `linear-gradient(90deg,#141414,${p.c},#fff8e6)` }} />
                      high
                    </div>
                  )}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <p className="mt-12 max-w-4xl text-[13px] text-dim leading-relaxed">
          <span className="text-snow">Fig. 2 |</span> Xenium sections AT4-FO-2 and AT10-FO-1 from de Jong et al.,{" "}
          <i>Nature</i> 2026 (gbmspace.org); 50,000-cell subsample of each section shown. BANKSY domains were
          computed by Artemis and named by their malignant-cell fraction under the authors&apos; cell-type
          labels. Program score = mean scaled expression of the listed genes, averaged over each cell&apos;s 15
          nearest neighbours. Colours follow the Okabe–Ito colour-blind-safe palette. Scale bars, 1 mm. No
          DNA-level ground truth: domain names describe agreement with the authors&apos; annotations, not
          independent validation.
        </p>

        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="font-mono text-[11px] tracking-[0.22em] text-dim uppercase mb-3">Open the live portals</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {LIVE.map(([h, l]) => (
              <a key={h} href={h} target="_blank" rel="noreferrer" className="font-mono text-[13px] text-snow/80 hover:text-violet transition-colors">
                {l} <span className="text-dim">↗</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
