"use client";

import { useEffect, useState } from "react";

// Letters materialize in the arrow's wake: ArrowIntro streams "artemis-spell"
// progress (0..1 across the full phrase) and each SpellOut reveals its slice.
// `offset` is this fragment's first index in the whole phrase of `total` chars.
const SCRAMBLE = "ACGT#%&@*+=<>/\\|01";

export default function SpellOut({ text, offset = 0, total, className = "" }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    const on = (e) => setN(Math.round((e.detail?.f ?? 1) * total));
    window.addEventListener("artemis-spell", on);
    // safety: if the intro never fires (event missed, JS error), show the name
    const safety = setTimeout(() => setN((v) => (v < total ? total : v)), 3400);
    return () => {
      window.removeEventListener("artemis-spell", on);
      clearTimeout(safety);
    };
  }, [total]);

  return (
    <span className={className} aria-label={text}>
      {text.split("").map((ch, i) => {
        const gi = offset + i;
        const shown = gi < n;
        const edge = shown && gi === n - 1 && n < total;
        return (
          <span
            key={i}
            aria-hidden
            className="inline-block transition-[opacity,transform,filter] duration-200"
            style={{
              opacity: shown ? 1 : 0,
              transform: shown ? "none" : "translateY(0.18em)",
              filter: shown ? "none" : "blur(6px)",
            }}
          >
            {edge ? SCRAMBLE[(gi * 7 + n * 13) % SCRAMBLE.length] : ch === " " ? " " : ch}
          </span>
        );
      })}
    </span>
  );
}
