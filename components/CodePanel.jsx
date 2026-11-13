"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Animated end-to-end replay inside a VS-Code-style window.
 * Five acts, ~33s loop: raw data → pipeline code → terminal → figure → learning loop.
 *
 * Code content is a VERBATIM excerpt of run_pipeline.py (lines 149–173)
 * from the spatial-transcriptomics pipeline: the stage-2 (marker report)
 * block and the top of stage 3 (Vitessce portal) inside run_with_callback.
 * Terminal numbers mirror the real GBM3 run (same values as TerminalLive).
 *
 * Deterministic timing (single rAF clock, no randomness); transforms/opacity
 * only; prefers-reduced-motion renders the complete final state statically.
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

// ---------------------------------------------------------------- timeline
const LINE_H = 18; // px — fixed for deterministic caret math
const RAW_END = 3500; // act 1: raw data arrives
const CODE_START = 3500; // act 2: execution caret walks the code
const PER_LINE = 330;
const CODE_END = CODE_START + LINES.length * PER_LINE; // 11750
const TERM_START = 11800; // act 3: terminal output
const FIG_START = 19000; // act 4: figure slides in
const LOOP_START = 23000; // act 5: learning loop
const TOTAL = 33000; // then restart (7s hold after the loop line finishes)
const FINAL_T = 26000; // static state for prefers-reduced-motion

const TEAL = "#5eead4";
const DIM = "#8b87a0";
const MINT = "#86efac";
const AMBER = "#fcd34d";

const CMD1 = "python run_pipeline.py --input GBM3.h5ad";
const LS_CMD = "ls data/raw/GBM3/";
const LOOP_NOTE = "reviewer note → thresholds updated → rerun queued";

const RAW_FILES = [
  { at: 1000, name: "GBM3.h5ad", note: "1,775 spots × 36,601 genes" },
  { at: 1700, name: "spatial/", note: "Visium coordinates + scalefactors" },
  { at: 2400, name: "GBM3_he.tif", note: "H&E histology" },
];

const STEPS = ["raw data", "pipeline", "terminal", "figure", "learning loop"];

function actOf(t) {
  if (t < RAW_END) return 0;
  if (t < TERM_START) return 1;
  if (t < FIG_START) return 2;
  if (t < LOOP_START) return 3;
  return 4;
}

const typedSlice = (str, t, start, cps) =>
  str.slice(0, Math.max(0, Math.min(str.length, Math.floor((t - start) / cps))));

export default function CodePanel() {
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);
  const rootRef = useRef(null);

  // start when ~40% visible; reduced motion → jump to complete final state
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true);
      return;
    }
    const io = new IntersectionObserver(
      (e) => {
        if (e[0].isIntersecting) {
          setPlaying(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    if (rootRef.current) io.observe(rootRef.current);
    return () => io.disconnect();
  }, []);

  // single deterministic clock, quantized to 40ms frames; wraps for the loop
  useEffect(() => {
    if (!playing) return;
    let raf;
    const t0 = performance.now();
    const step = (now) => {
      setFrame(Math.floor(((now - t0) % TOTAL) / 40));
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const t = reduced ? FINAL_T : frame * 40;
  const act = actOf(t);

  // act 2 — execution caret
  const caretLine = Math.max(0, Math.min(LINES.length - 1, Math.floor((t - CODE_START) / PER_LINE)));
  const caretVisible = t >= CODE_START && t < TERM_START;
  const executedThrough = t >= TERM_START ? LINES.length - 1 : t >= CODE_START ? caretLine : -1;
  const stage3Active = executedThrough >= 20; // line 169 onward

  // act 1 — raw-data overlay
  const rawVisible = t < RAW_END;
  const lsTyped = typedSlice(LS_CMD, t, 200, 26);

  // act 3 — terminal
  const cmd1Typed = t >= TERM_START ? typedSlice(CMD1, t, TERM_START, 26) : "";
  const cmd1Done = t >= TERM_START + CMD1.length * 26 + 300;
  const noteTyped = t >= LOOP_START ? typedSlice(LOOP_NOTE, t, LOOP_START + 200, 28) : "";
  const noteDone = noteTyped.length >= LOOP_NOTE.length;

  // act 4 — figure pane
  const figIn = t >= FIG_START;

  const show = (at) => t >= at;

  return (
    <figure className="m-0" ref={rootRef}>
      <style>{`
        @keyframes codepanel-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
        .codepanel-cursor { animation: codepanel-blink 1.06s step-end infinite; }
        @keyframes codepanel-rise { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .codepanel-rise { animation: codepanel-rise .35s ease-out both; }
        @keyframes codepanel-spin { to { transform: rotate(360deg); } }
        .codepanel-spin { display: inline-block; animation: codepanel-spin 2.8s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .codepanel-cursor, .codepanel-rise, .codepanel-spin { animation: none; }
        }
      `}</style>

      <div
        className="rounded-lg border border-snow/60 overflow-hidden shadow-sm"
        style={{ background: "#1e1e2a" }}
        role="img"
        aria-label="Animated replay: raw GBM3 Visium data enters run_pipeline.py, the terminal reports 7 cell states, the publication-ready overlay figure appears, and a reviewer note queues a rerun"
      >
        {/* window chrome */}
        <div className="flex items-center gap-1.5 px-4 pt-2.5" style={{ background: "#17171f" }} aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-line/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-line/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-line/60" />
        </div>

        {/* tab bar */}
        <div className="flex items-end gap-0 px-3 pt-2 font-mono text-[12px]" style={{ background: "#17171f" }} aria-hidden>
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

        {/* editor body — code + raw-data overlay + sliding figure pane */}
        <div className="relative overflow-hidden" aria-hidden>
          <div className="overflow-x-auto">
            <pre className="font-mono text-[11.5px] py-4 pr-5 m-0 min-w-max relative" style={{ lineHeight: `${LINE_H}px` }}>
              {/* execution caret: thin teal bar + faint line wash, transform-only */}
              <div
                className="absolute left-0 right-0 pointer-events-none"
                style={{
                  top: "1rem",
                  height: `${LINE_H}px`,
                  background: "rgba(94,234,212,0.07)",
                  borderLeft: `2px solid ${TEAL}`,
                  transform: `translateY(${caretLine * LINE_H}px)`,
                  transition: "transform .22s linear, opacity .3s",
                  opacity: caretVisible ? 1 : 0,
                }}
              />
              <code>
                {LINES.map((line, i) => (
                  <div
                    key={line.n}
                    className="flex"
                    style={{
                      opacity: i <= executedThrough ? 1 : 0.42,
                      transition: "opacity .3s",
                    }}
                  >
                    <span
                      className="select-none text-right pr-4 pl-4 shrink-0"
                      style={{ color: "#565666", minWidth: "3.5rem" }}
                    >
                      {line.n}
                    </span>
                    <span className="whitespace-pre">
                      {line.parts.length === 0
                        ? " "
                        : line.parts.map(([c, txt], j) => (
                            <span
                              key={j}
                              style={{
                                color:
                                  c === "com" &&
                                  ((i === 0 && executedThrough >= 0 && !stage3Active) || (i === 20 && stage3Active))
                                    ? TEAL
                                    : C[c],
                                transition: "color .3s",
                              }}
                            >
                              {txt}
                            </span>
                          ))}
                    </span>
                  </div>
                ))}
              </code>
            </pre>
          </div>

          {/* act 1 — raw data arrives (overlay, fades out into the code) */}
          <div
            className="absolute inset-0 font-mono text-[12.5px] leading-[1.9] px-6 py-5"
            style={{
              background: "#1e1e2a",
              opacity: rawVisible ? 1 : 0,
              transition: "opacity .45s ease",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            <div>
              <span style={{ color: DIM }}>$ </span>
              <span style={{ color: "#efeef8" }}>{rawVisible ? lsTyped : LS_CMD}</span>
              {rawVisible && lsTyped.length < LS_CMD.length && (
                <span className="codepanel-cursor" style={{ color: TEAL }}>▍</span>
              )}
            </div>
            {RAW_FILES.map((f) =>
              show(f.at) ? (
                <div key={f.name} className="codepanel-rise">
                  <span style={{ color: TEAL }}>{f.name.padEnd(14, " ")}</span>
                  <span style={{ color: DIM }}>{f.note}</span>
                </div>
              ) : null
            )}
            {show(2900) && (
              <div className="codepanel-rise" style={{ color: DIM }}>
                3 inputs staged → opening run_pipeline.py …
              </div>
            )}
          </div>

          {/* act 4 — publication-ready figure slides in from the right */}
          <div
            className="absolute top-0 bottom-0 right-0 flex items-center pr-4 pl-2"
            style={{
              transform: figIn ? "translateX(0)" : "translateX(108%)",
              transition: "transform .6s cubic-bezier(.22,.9,.3,1)",
              zIndex: 20,
              willChange: "transform",
            }}
          >
            <div
              className="rounded-[3px] border p-3 w-[218px] shadow-lg"
              style={{ background: "#17171f", borderColor: "#34323f" }}
            >
              <img
                src="gbm/GBM3_overlay.jpg"
                alt=""
                width={194}
                height={146}
                loading="lazy"
                className="rounded-[3px] w-full h-auto"
              />
              <div className="font-mono text-[10.5px] mt-2 leading-[1.6]">
                <div style={{ color: "#e8e6df" }}>publication-ready: Fig. GBM3 overlay</div>
                <div style={{ color: DIM }}>
                  report.md <span style={{ color: MINT }}>✓</span>&nbsp;&nbsp;insights{" "}
                  <span style={{ color: MINT }}>✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* acts 3 + 5 — terminal strip */}
        <div
          className="font-mono text-[11.5px] leading-[1.6] px-5 py-3 h-[178px] overflow-hidden whitespace-pre-wrap border-t"
          style={{ background: "#12101d", borderColor: "#2a2838" }}
          aria-hidden
        >
          <div>
            <span style={{ color: DIM }}>$ </span>
            <span style={{ color: "#efeef8" }}>{cmd1Typed}</span>
            {t >= TERM_START && !cmd1Done && (
              <span className="codepanel-cursor" style={{ color: TEAL }}>▍</span>
            )}
          </div>
          {show(13300) && (
            <div className="codepanel-rise">
              <span style={{ color: TEAL }}>  [2/5] marker report     </span>
              <span style={{ color: MINT }}>✓</span>
              <span style={{ color: DIM }}>  report.md · clusters.csv</span>
            </div>
          )}
          {show(13950) && (
            <div className="codepanel-rise">
              <span style={{ color: TEAL }}>  [3/5] Vitessce portal   </span>
              <span style={{ color: MINT }}>✓</span>
              <span style={{ color: DIM }}>  output/GBM3/portal.html</span>
            </div>
          )}
          {show(14800) && (
            <div className="codepanel-rise" style={{ color: "#efeef8", fontWeight: 700 }}>
              {"  "}16 domains → 7 cell states
            </div>
          )}
          {show(15400) && (
            <div className="codepanel-rise">
              <span style={{ color: TEAL }}>  oligodendrocytes</span>
              <span style={{ color: DIM }}> 453 · </span>
              <span style={{ color: TEAL }}>NPC-like tumor</span>
              <span style={{ color: DIM }}> 439 · </span>
              <span style={{ color: TEAL }}>endothelial</span>
              <span style={{ color: DIM }}> 247 · </span>
              <span style={{ color: TEAL }}>astrocytes</span>
              <span style={{ color: DIM }}> 244</span>
            </div>
          )}
          {show(16700) && (
            <div className="codepanel-rise">
              <span style={{ color: MINT }}>  ✓</span>
              <span style={{ color: DIM }}> provenance: qwen3:8b, local</span>
            </div>
          )}
          {show(FIG_START + 250) && (
            <div className="codepanel-rise">
              <span style={{ color: MINT }}>  ✓</span>
              <span style={{ color: DIM }}> figure  GBM3_overlay.jpg → publication-ready</span>
            </div>
          )}
          {show(LOOP_START) && (
            <div className="codepanel-rise">
              <span className={noteDone ? "" : "codepanel-spin"} style={{ color: AMBER }}>↻</span>
              <span style={{ color: "#cfcde0" }}> {noteTyped}</span>
              {!noteDone && <span className="codepanel-cursor" style={{ color: TEAL }}>▍</span>}
            </div>
          )}
        </div>
      </div>

      {/* step rail — synced to the acts */}
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px]" aria-hidden>
        {STEPS.map((s, i) => (
          <span key={s} className="flex items-center gap-2">
            {i > 0 && <span className="text-line">→</span>}
            <span
              className={
                i === act
                  ? "text-violet font-semibold"
                  : i < act
                  ? "text-snow/60"
                  : "text-dim/50"
              }
              style={{ transition: "color .3s" }}
            >
              {i < act ? "✓ " : i === act ? "● " : ""}
              {s}
            </span>
          </span>
        ))}
      </div>

      <p className="mt-3 text-[13.5px] text-dim leading-relaxed">
        <span className="font-semibold text-snow">Fig. 8&nbsp;|</span> From raw data to a publication-ready figure —
        the pipeline as it actually ships (run_pipeline.py, verbatim), replayed. Numbers from the real GBM3 run.
      </p>
    </figure>
  );
}
