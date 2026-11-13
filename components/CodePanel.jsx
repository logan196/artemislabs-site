"use client";

/*
 * VS-Code-style editor mock. Static — no syntax-highlighting library.
 * Code content is a VERBATIM excerpt of run_pipeline.py (lines 149–173)
 * from the spatial-transcriptomics pipeline: the stage-2 (marker report)
 * block and the top of stage 3 (Vitessce portal) inside run_with_callback.
 */

const C = {
  kw: "#c586c0", // keywords: try / except / from / import / as
  str: "#ce9178", // strings
  com: "#6a9955", // comments
  fn: "#dcdcaa", // function calls / defs
  num: "#b5cea8", // numeric literals
  pl: "#d4d4d4", // plain text
};

// Each line: real source line number + tokenized segments [colorKey, text].
const LINES = [
  { n: 149, parts: [["com", "    # --- [2/5] marker report ---------------------------------------------"]] },
  { n: 150, parts: [["pl", "    "], ["fn", "callback"], ["pl", "("], ["num", "2"], ["pl", ", STAGE_NAMES["], ["num", "2"], ["pl", "], "], ["str", '"running"'], ["pl", ")"]] },
  { n: 151, parts: [["pl", "    t0 = time."], ["fn", "time"], ["pl", "()"]] },
  { n: 152, parts: [["pl", "    "], ["kw", "try"], ["pl", ":"]] },
  { n: 153, parts: [["pl", "        "], ["kw", "from"], ["pl", " marker_report "], ["kw", "import"], ["pl", " run "], ["kw", "as"], ["pl", " marker_run"]] },
  { n: 154, parts: [] },
  { n: 155, parts: [["pl", "        "], ["fn", "marker_run"], ["pl", "("], ["fn", "Namespace"], ["pl", "("]] },
  { n: 156, parts: [["pl", "            input="], ["fn", "str"], ["pl", "(preprocessed),"]] },
  { n: 157, parts: [["pl", "            cluster_key=CLUSTER_KEY,"]] },
  { n: 158, parts: [["pl", "            report="], ["fn", "str"], ["pl", "(report_md),"]] },
  { n: 159, parts: [["pl", "            clusters_csv="], ["fn", "str"], ["pl", "(clusters_csv),"]] },
  { n: 160, parts: [["pl", "            tissue_context=tissue_context,"]] },
  { n: 161, parts: [["pl", "            use_llm=annotate_with_llm,"]] },
  { n: 162, parts: [["pl", "            min_score=min_score,"]] },
  { n: 163, parts: [["pl", "        ))"]] },
  { n: 164, parts: [["pl", "    "], ["kw", "except"], ["pl", " Exception:"]] },
  { n: 165, parts: [["pl", "        "], ["fn", "_fail"], ["pl", "("], ["num", "2"], ["pl", ", STAGE_NAMES["], ["num", "2"], ["pl", "])"]] },
  { n: 166, parts: [["pl", "    "], ["fn", "print"], ["pl", "("], ["str", 'f"      done in {time.time() - t0:.1f}s -> {report_md}, {clusters_csv}"'], ["pl", ")"]] },
  { n: 167, parts: [["pl", "    "], ["fn", "callback"], ["pl", "("], ["num", "2"], ["pl", ", STAGE_NAMES["], ["num", "2"], ["pl", "], "], ["str", '"done"'], ["pl", ")"]] },
  { n: 168, parts: [] },
  { n: 169, parts: [["com", "    # --- [3/5] Vitessce portal -------------------------------------------"]] },
  { n: 170, parts: [["pl", "    "], ["fn", "callback"], ["pl", "("], ["num", "3"], ["pl", ", STAGE_NAMES["], ["num", "3"], ["pl", "], "], ["str", '"running"'], ["pl", ")"]] },
  { n: 171, parts: [["pl", "    t0 = time."], ["fn", "time"], ["pl", "()"]] },
  { n: 172, parts: [["pl", "    "], ["kw", "try"], ["pl", ":"]] },
  { n: 173, parts: [["pl", "        "], ["kw", "from"], ["pl", " generate_vitessce_config "], ["kw", "import"], ["pl", " run "], ["kw", "as"], ["pl", " vitessce_run"]] },
];

export default function CodePanel() {
  const last = LINES.length - 1;
  return (
    <figure className="m-0">
      <style>{`
        @keyframes codepanel-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
        .codepanel-cursor { animation: codepanel-blink 1.06s step-end infinite; }
        @media (prefers-reduced-motion: reduce) {
          .codepanel-cursor { animation: none; }
        }
      `}</style>
      <div className="rounded-lg border border-snow/60 overflow-hidden shadow-sm" style={{ background: "#1e1e2a" }}>
        {/* window chrome */}
        <div className="flex items-center gap-1.5 px-4 pt-2.5" style={{ background: "#17171f" }} aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-line/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-line/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-line/60" />
        </div>
        {/* tab bar */}
        <div className="flex items-end gap-0 px-3 pt-2 font-mono text-[12px]" style={{ background: "#17171f" }}>
          <div
            className="px-4 py-2 rounded-t-md border-t-2"
            style={{ background: "#1e1e2a", color: "#e8e6df", borderTopColor: "#0f766e" }}
          >
            run_pipeline.py
          </div>
          <div className="px-4 py-2" style={{ color: "#6f6d7e" }}>
            marker_report.py
          </div>
        </div>
        {/* editor body */}
        <div className="overflow-x-auto">
          <pre className="font-mono text-[12.5px] leading-[1.6] py-4 pr-5 m-0 min-w-max">
            <code>
              {LINES.map((line, i) => (
                <div key={line.n} className="flex">
                  <span
                    className="select-none text-right pr-4 pl-4 shrink-0"
                    style={{ color: "#565666", minWidth: "3.5rem" }}
                    aria-hidden
                  >
                    {line.n}
                  </span>
                  <span className="whitespace-pre">
                    {line.parts.length === 0
                      ? " "
                      : line.parts.map(([c, t], j) => (
                          <span key={j} style={{ color: C[c] }}>{t}</span>
                        ))}
                    {i === last && (
                      <span
                        className="codepanel-cursor inline-block align-text-bottom"
                        style={{ width: "2px", height: "1.1em", background: "#e8e6df", marginLeft: "1px" }}
                        aria-hidden
                      />
                    )}
                  </span>
                </div>
              ))}
            </code>
          </pre>
        </div>
      </div>
      <p className="mt-3 text-[13.5px] text-dim leading-relaxed">
        <span className="font-semibold text-snow">Fig. 9&nbsp;|</span> The pipeline as it actually ships — stage
        orchestration from run_pipeline.py, verbatim.
      </p>
    </figure>
  );
}
