"use client";

// Scroll-driven GBM use-case story. Every image is a real capture or figure:
// the GBM3 (GSE194329) figure page and marker maps, the /live GBM3 portal,
// the /live/explore visualizer, hosted public sections, and the GBM3 co-scientist.
import { useEffect, useRef, useState } from "react";
import { useScroll } from "framer-motion";

const STAGES = [
  {
    id: "report",
    label: "Custom bioinformatics report",
    src: "usecase/report.jpg",
    alt: "Figure page for public Visium section GBM3 (Ren et al., Nature Communications 2023, GSE194329): H&E, BANKSY cell states, and EGFR, SOX2, GFAP and CD68 expression.",
  },
  {
    id: "portals",
    label: "Portals",
    src: "usecase/portals.jpg",
    alt: "The live GBM Spatial Atlas portal open on section GBM3, with the spatial scatterplot, gene list, heatmap and co-scientist rail.",
  },
  {
    id: "figures",
    label: "Figures",
    src: "usecase/figures.jpg",
    alt: "Marker maps for public Visium section GBM3: EGFR, SOX2, GFAP and CD68.",
  },
  {
    id: "tools",
    label: "Analysis tools / software",
    src: "usecase/tools.jpg",
    alt: "The Artemis Explore tissue visualizer on a public glioblastoma Visium section, with paired H&E, expression-derived marker layers, and the annotate tool.",
  },
  {
    id: "public",
    label: "Unlimited access to public data",
    src: "usecase/public.jpg",
    alt: "Public glioblastoma sections hosted on the site: GBM1–4 and 10x Parent Visium, de Jong AT10, AT14 and AT15, and BANKSY domains on AT4-FO-2.",
  },
  {
    id: "support",
    label: "24/7 support",
    src: "usecase/support.jpg",
    alt: "The GBM3 portal co-scientist answering a question from this run’s marker report: which domains look hypoxic.",
  },
];

function opacityFor(progress, index, n) {
  const x = progress * (n - 1);
  const d = Math.abs(x - index);
  if (d >= 1) return 0;
  return 1 - d;
}

function StageList({ active, reduced }) {
  return (
    <ul
      className={`flex flex-wrap gap-x-5 gap-y-1 justify-center md:justify-between max-w-5xl mx-auto ${
        reduced ? "mt-6" : ""
      }`}
    >
      {STAGES.map((s, i) => (
        <li key={s.id}>
          <span
            className={`block font-mono text-[11px] md:text-[12px] tracking-wide transition-colors duration-300 ${
              i === active ? "text-snow" : "text-white/30"
            }`}
          >
            {s.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

function StaticStory() {
  return (
    <section id="use-case" className="relative bg-black px-6 md:px-14 py-16 md:py-24">
      <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-center">
        Explore a glioblastoma use case
      </h2>
      <div className="mt-10 max-w-5xl mx-auto flex flex-col gap-10">
        {STAGES.map((s, i) => (
          <figure key={s.id} className="m-0">
            <img
              src={s.src}
              alt={s.alt}
              className="w-full h-auto max-h-[70vh] object-contain mx-auto bg-black"
            />
            <figcaption className="mt-3 font-mono text-[12px] text-snow text-center">
              {s.label}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export default function GbmUseCase() {
  const wrapRef = useRef(null);
  const imgRefs = useRef([]);
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const set = () => setReduced(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  useEffect(() => {
    if (reduced) return undefined;
    const n = STAGES.length;
    const apply = (p) => {
      const x = Math.max(0, Math.min(1, p));
      imgRefs.current.forEach((el, i) => {
        if (!el) return;
        const o = opacityFor(x, i, n);
        el.style.opacity = String(o);
        el.style.transform = `scale(${0.98 + 0.02 * o})`;
        el.style.visibility = o > 0.001 ? "visible" : "hidden";
      });
      const idx = Math.min(n - 1, Math.max(0, Math.round(x * (n - 1))));
      setActive((prev) => (prev === idx ? prev : idx));
    };
    apply(scrollYProgress.get());
    const unsub = scrollYProgress.on("change", apply);
    return unsub;
  }, [scrollYProgress, reduced]);

  if (reduced) return <StaticStory />;

  return (
    <section id="use-case" ref={wrapRef} className="relative bg-black h-[520vh] md:h-[560vh]">
      <div className="sticky top-0 h-[100svh] flex flex-col overflow-hidden">
        <div className="px-6 md:px-14 pt-8 md:pt-12 shrink-0">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-center">
            Explore a glioblastoma use case
          </h2>
        </div>

        <div className="relative flex-1 min-h-0 mx-auto w-full max-w-6xl px-4 md:px-8 py-4 md:py-6">
          {STAGES.map((s, i) => (
            <figure
              key={s.id}
              ref={(el) => {
                imgRefs.current[i] = el;
              }}
              data-stage={s.id}
              className="absolute inset-0 m-0 flex items-center justify-center will-change-transform"
              style={{ opacity: i === 0 ? 1 : 0, visibility: i === 0 ? "visible" : "hidden" }}
              aria-hidden={i !== active}
            >
              <img
                src={s.src}
                alt={i === active ? s.alt : ""}
                className="max-w-full max-h-full w-auto h-auto object-contain"
              />
            </figure>
          ))}
        </div>

        <div className="px-6 md:px-14 pb-6 md:pb-10 shrink-0">
          <p className="md:hidden font-mono text-[12px] text-snow text-center mb-3">
            {STAGES[active].label}
          </p>
          <div className="hidden md:block">
            <StageList active={active} />
          </div>
        </div>
      </div>
    </section>
  );
}
