"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Per-character masked rise, grouped by word.
 *
 * Each character sits in an overflow-hidden sleeve and starts pushed below it,
 * so it wipes up into view rather than fading. Words are the unbreakable unit,
 * which is what keeps a split headline from wrapping mid-word.
 *
 * Animation runs on CSS transitions with a per-character transitionDelay —
 * one state flip drives the whole line, instead of one component per glyph.
 * The clipping sleeve would otherwise crop descenders, so each sleeve carries
 * bottom padding that is pulled back out with a negative margin.
 */
export default function SplitText({
  text,
  as: Tag = "span",
  className = "",
  charClassName = "",
  delay = 0,
  stagger = 0.022,
  duration = 0.5,
  start = true,
}) {
  const [on, setOn] = useState(false);
  const reduced = useRef(false);

  // Characters render hidden so the reveal can wipe them up from nothing. That
  // makes the headline dependent on this effect firing, so a failsafe reveals
  // it unconditionally — a missed cue must never leave the hero permanently blank.
  useEffect(() => {
    const failsafe = setTimeout(() => setOn(true), 1800);
    return () => clearTimeout(failsafe);
  }, []);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!start) return;
    if (reduced.current) {
      setOn(true);
      return;
    }
    // next frame, so the from-state is painted before the transition begins
    const r = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(r);
  }, [start]);

  const words = text.split(" ");
  let index = 0;

  // The whole split subtree is decorative. ARIA prohibits aria-label on a
  // generic element, so labelling the wrapper span here would be dropped by
  // Chrome and Firefox and the text would have no accessible name at all —
  // the CALLER must put the accessible name on the semantic element (the h1).
  return (
    <Tag className={className} aria-hidden="true">
      {words.map((word, wi) => (
        <span key={`${word}-${wi}`} className="inline-block whitespace-nowrap">
          {[...word].map((ch, ci) => {
            const i = index++;
            return (
              <span
                key={ci}
                className="inline-block overflow-hidden pb-[0.16em] -mb-[0.16em] align-bottom"
              >
                <span
                  className={`inline-block will-change-transform ${charClassName}`}
                  style={{
                    transform: on ? "translateY(0)" : "translateY(108%)",
                    opacity: on ? 1 : 0,
                    transition: reduced.current
                      ? "none"
                      : `transform ${duration}s cubic-bezier(0.22,0.68,0.26,1) ${
                          delay + i * stagger
                        }s, opacity ${duration * 0.6}s linear ${delay + i * stagger}s`,
                  }}
                >
                  {ch}
                </span>
              </span>
            );
          })}
          {/* a real space between words, outside the clipping sleeves */}
          {wi < words.length - 1 ? <span className="inline-block">&nbsp;</span> : null}
        </span>
      ))}
    </Tag>
  );
}
