"use client";

import { useEffect, useRef, useState } from "react";

// Tetsuwan-style decode: text resolves out of a glyph scramble, left to right.
const SCRAMBLE = "ACGT#%&@*+=<>/\\|01";

export default function Decode({ text, delay = 0, speed = 28, className = "", as: Tag = "span" }) {
  const [out, setOut] = useState("");
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOut(text);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting || started.current) return;
      started.current = true;
      io.disconnect();
      let frame = 0;
      const total = text.length;
      const timer = setInterval(() => {
        frame++;
        const resolved = Math.floor(frame * 0.6);
        let s = "";
        for (let i = 0; i < total; i++) {
          if (i < resolved || text[i] === " " || text[i] === "\n") s += text[i];
          else if (i < resolved + 7) s += SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];
          else s += " ";
        }
        setOut(s);
        if (resolved >= total) { setOut(text); clearInterval(timer); }
      }, speed);
      // honor delay by pre-waiting
    }, { rootMargin: "-40px" });
    const t = setTimeout(() => io.observe(el), delay);
    return () => { clearTimeout(t); io.disconnect(); };
  }, [text, delay, speed]);

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {out || " "}
    </Tag>
  );
}
