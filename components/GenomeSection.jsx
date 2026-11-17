"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";

// ── Live tracks ─────────────────────────────────────────────────────────────
// Both datasets are PUBLIC and streamed into the page by HTTP range request
// from their primary archives (verified: Access-Control-Allow-Origin: * and
// 206 partial content on both hosts).
//
//  · CUT&RUN  — GEO GSM8782600 (series GSE289046): SOX2 CUT&RUN in NCI-H520
//    lung squamous carcinoma cells, hg38, RPKM-normalized bigWig.
//  · Long reads — GIAB HG002 (NA24385): PacBio HiFi Revio 48× alignments to
//    GRCh38, NIST ftp-trace mirror. igv.js fetches only the window in view.
//
// Reference genome: igv.js hosted hg38 data (igv.org + UCSC hgdownload),
// with UCSC RefSeq Select as the gene track so SOX2 itself is labeled
// (the default "Refseq All" shows only SOX2-OT isoforms at this zoom).
const CUTRUN_URL =
  "https://ftp.ncbi.nlm.nih.gov/geo/samples/GSM8782nnn/GSM8782600/suppl/GSM8782600_H520_SOX2_C_R.bw";
const HIFI_BAM =
  "https://ftp-trace.ncbi.nlm.nih.gov/ReferenceSamples/giab/data/AshkenazimTrio/HG002_NA24385_son/PacBio_HiFi-Revio_20231031/HG002_PacBio-HiFi-Revio_20231031_48x_GRCh38-GIABv3.bam";

// SOX2 locus, hg38. In H520 (3q26-amplified SCC) the factor sits parked on
// its own gene — an ~800-RPKM autoregulatory peak blanketing the gene body,
// with a second site ~12 kb upstream. 35 kb window: single HiFi reads span
// half the view.
const LOCUS = "chr3:181,695,000-181,730,000";

const IGV_SRC = "vendor/igv.min.js"; // vendored UMD build, igv 3.8.10

const IGV_CONFIG = {
  // Same hosted-data URLs igv.js's own "hg38" genome entry uses, inlined so we
  // can swap the gene annotation for RefSeq Select (one transcript per gene).
  reference: {
    id: "hg38",
    name: "Human (GRCh38/hg38)",
    twoBitURL: "https://hgdownload.soe.ucsc.edu/goldenPath/hg38/bigZips/hg38.2bit",
    chromSizesURL: "https://igv.org/genomes/data/hg38/hg38.chrom.sizes",
    cytobandURL: "https://igv.org/genomes/data/hg38/cytoBandIdeo.txt.gz",
    aliasURL: "https://igv.org/genomes/data/hg38/hg38_alias.tab",
    chromosomeOrder:
      "chr1,chr2,chr3,chr4,chr5,chr6,chr7,chr8,chr9,chr10,chr11,chr12,chr13,chr14,chr15,chr16,chr17,chr18,chr19,chr20,chr21,chr22,chrX,chrY",
    tracks: [
      {
        name: "RefSeq Select",
        format: "refgene",
        url: "https://hgdownload.soe.ucsc.edu/goldenPath/hg38/database/ncbiRefSeqSelect.txt.gz",
        indexed: false,
        order: 100000,
      },
    ],
  },
  locus: LOCUS,
  tracks: [
    {
      name: "SOX2 CUT&RUN · binding signal",
      type: "wig",
      format: "bigwig",
      url: CUTRUN_URL,
      color: "#f0a202",
      height: 100,
      autoscale: true,
    },
    {
      name: "PacBio HiFi long reads · 48×",
      type: "alignment",
      format: "bam",
      url: HIFI_BAM,
      indexURL: `${HIFI_BAM}.bai`,
      height: 236,
      visibilityWindow: 65000,
      coverageColor: "#2bb3a3",
      color: "#3ec6c0",
    },
  ],
};

let igvScriptPromise = null;
function loadIgvScript() {
  if (typeof window !== "undefined" && window.igv) return Promise.resolve();
  if (!igvScriptPromise) {
    igvScriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = IGV_SRC; // relative — survives the static export's relative asset prefix
      s.async = true;
      s.onload = () => (window.igv ? resolve() : reject(new Error("igv missing after load")));
      s.onerror = () => {
        igvScriptPromise = null;
        reject(new Error("failed to load vendored igv.min.js"));
      };
      document.head.appendChild(s);
    });
  }
  return igvScriptPromise;
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("igv init timed out")), ms)),
  ]);
}

export default function GenomeSection() {
  const hostRef = useRef(null); // div igv renders into
  const panelRef = useRef(null); // observed wrapper
  const browserRef = useRef(null);
  const startedRef = useRef(false);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | failed

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      if (startedRef.current) return;
      startedRef.current = true;
      setStatus("loading");
      try {
        await loadIgvScript();
        if (cancelled || !hostRef.current) return;
        const browser = await withTimeout(
          window.igv.createBrowser(hostRef.current, IGV_CONFIG),
          45000
        );
        if (cancelled) {
          window.igv.removeBrowser(browser);
          return;
        }
        browserRef.current = browser;
        hostRef.current
          ?.querySelectorAll("select")
          .forEach((el) => el.setAttribute("aria-label", "Select chromosome"));
        setStatus("ready");
      } catch (err) {
        if (!cancelled) setStatus("failed");
      }
    }

    // Lazy: only boot once the panel approaches the viewport, so visitors who
    // never scroll here never touch NCBI.
    const node = panelRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      boot();
      return () => {
        cancelled = true;
      };
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          boot();
        }
      },
      { rootMargin: "600px 0px" }
    );
    io.observe(node);

    return () => {
      cancelled = true;
      io.disconnect();
      if (browserRef.current && window.igv) {
        window.igv.removeBrowser(browserRef.current);
        browserRef.current = null;
      }
      startedRef.current = false;
    };
  }, []);

  const resetLocus = () => {
    if (browserRef.current) browserRef.current.search(LOCUS);
  };

  return (
    <section id="genomics" className="relative px-6 md:px-14 pt-12 md:pt-16 pb-20 max-w-7xl mx-auto">
      <Reveal>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl">
          Not just spatial.
        </h2>
        <p className="mt-6 text-lg text-snow/90 leading-relaxed max-w-2xl">
          CUT&amp;RUN, long reads, bulk — fastq to a browser you can share.
        </p>
        <div className="mt-5 flex gap-3 flex-wrap font-mono text-[13px] text-dim">
          <span>CUT&amp;RUN</span>
          <span aria-hidden>·</span>
          <span>PacBio HiFi</span>
          <span aria-hidden>·</span>
          <span>live, nothing pre-rendered</span>
        </div>
      </Reveal>

      <Reveal className="mt-10">
        <div
          ref={panelRef}
          className="rounded-[4px] border border-line bg-panel overflow-hidden"
        >
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
            <span className="font-mono text-[12px] text-dim truncate">
              igv.js 3.8.10 · hg38 · {LOCUS}
            </span>
            <span className="flex items-center gap-3 shrink-0">
              {status === "ready" && (
                <button
                  onClick={resetLocus}
                  className="rounded-[3px] border border-line px-2.5 py-1 font-mono text-[12px] text-dim hover:text-snow hover:border-snow/50 transition-colors"
                >
                  ↺ SOX2 locus
                </button>
              )}
              <span className="font-mono text-[12px] text-violet">
                {status === "ready"
                  ? "● live · NCBI GEO + GIAB"
                  : status === "failed"
                    ? "○ offline"
                    : "◌ initializing…"}
              </span>
            </span>
          </div>

          {status === "failed" ? (
            <div className="min-h-[420px] flex items-center justify-center p-8">
              <div className="max-w-xl text-center">
                <p className="font-mono text-[11px] tracking-[0.25em] text-violet uppercase mb-3">
                  Live browser unavailable here
                </p>
                <p className="text-[15px] text-dim leading-relaxed">
                  This panel streams public data straight from NCBI GEO, NIST GIAB and
                  igv.org — hosts this network or preview sandbox is blocking. On the
                  production site it is a working genome browser: SOX2 CUT&amp;RUN
                  coverage (NCI-H520, GEO GSM8782600) above 48× PacBio HiFi alignments
                  (GIAB HG002), open at the SOX2 locus on hg38.
                </p>
              </div>
            </div>
          ) : (
            <>
            <div className="relative min-h-[420px] bg-black">
              {status !== "ready" && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <p className="font-mono text-[13px] text-dim">
                    streaming reference + tracks from igv.org · GEO · GIAB…
                  </p>
                </div>
              )}
              <div ref={hostRef} className="px-2 py-2" />
              {status === "ready" && (
                <div
                  className="absolute top-[4.75rem] right-4 md:right-8 max-w-[200px] pointer-events-none z-10"
                  aria-hidden
                >
                  <div className="rounded-[3px] border border-[#f0a202]/70 bg-black/80 px-2.5 py-1.5 font-mono text-[11px] text-[#f0a202] shadow-[0_0_18px_rgba(240,162,2,0.18)]">
                    SOX2 binds its own gene
                    <span className="block text-[10px] text-snow/70 font-normal mt-0.5">
                      ~800 RPKM peak · gene body
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-line px-4 py-2.5 font-mono text-[11px] text-dim">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-5 rounded-sm bg-[#f0a202]" aria-hidden />
                SOX2 CUT&amp;RUN · binding signal
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-5 rounded-sm bg-[#2bb3a3]" aria-hidden />
                PacBio HiFi long reads · 48×
              </span>
              <span className="text-snow/50">shaded: SOX2 locus</span>
            </div>
            </>
          )}
        </div>

        <p className="mt-2.5 text-[13.5px] text-dim leading-relaxed max-w-4xl">
          <span className="font-semibold text-snow">Fig. 3&nbsp;|</span> Live igv.js
          browser, hg38, SOX2 locus chr3:181,695,000–181,730,000. Amber: SOX2 CUT&amp;RUN
          binding signal, NCI-H520, GEO GSM8782600 (GSE289046), RPKM. Teal: PacBio HiFi
          Revio 48× reads, GIAB HG002. Drag to pan, scroll to zoom.
        </p>
      </Reveal>
    </section>
  );
}
