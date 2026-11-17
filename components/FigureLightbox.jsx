"use client";

import { useEffect, useRef, useState } from "react";

// Click a figure to open it. Wheel or +/- zooms, drag pans, caption stays
// with the plate, and the file can be downloaded.
export default function FigureLightbox({ src, alt, caption, children, className = "" }) {
  const [open, setOpen] = useState(false);
  const dlg = useRef(null);
  const stage = useRef(null);
  const [view, setView] = useState({ z: 1, x: 0, y: 0 });
  const drag = useRef(null);

  useEffect(() => {
    if (!open) return;
    const el = dlg.current;
    if (!el) return;
    if (!el.open) el.showModal();
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "+" || e.key === "=") setView((v) => ({ ...v, z: Math.min(6, v.z * 1.25) }));
      if (e.key === "-" || e.key === "_") setView((v) => ({ ...v, z: Math.max(1, v.z / 1.25) }));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) setView({ z: 1, x: 0, y: 0 });
  }, [open]);

  const onWheel = (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    setView((v) => ({ ...v, z: Math.min(6, Math.max(1, v.z * factor)) }));
  };

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, ox: view.x, oy: view.y };
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    setView((v) => ({ ...v, x: d.ox + e.clientX - d.x, y: d.oy + e.clientY - d.y }));
  };
  const onPointerUp = () => { drag.current = null; };

  const fileName = (src || "figure").split("/").pop();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group block w-full text-left cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet ${className}`}
        aria-haspopup="dialog"
        aria-label={alt ? `Open figure: ${alt}` : "Open figure"}
      >
        {children}
      </button>
      {open && (
        <dialog
          ref={dlg}
          className="fig-lightbox"
          aria-label={alt || "Figure"}
          onCancel={(e) => { e.preventDefault(); setOpen(false); }}
          onClose={() => setOpen(false)}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10">
            <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#9eeadf]">Figure</p>
            <div className="flex items-center gap-2">
              <button type="button" className="fig-lightbox-btn" onClick={() => setView((v) => ({ ...v, z: Math.max(1, v.z / 1.25) }))} aria-label="Zoom out">−</button>
              <button type="button" className="fig-lightbox-btn" onClick={() => setView((v) => ({ ...v, z: Math.min(6, v.z * 1.25) }))} aria-label="Zoom in">+</button>
              <button type="button" className="fig-lightbox-btn" onClick={() => setView({ z: 1, x: 0, y: 0 })}>Reset</button>
              <a className="fig-lightbox-btn" href={src} download={fileName}>Download</a>
              <button type="button" className="fig-lightbox-btn" onClick={() => { dlg.current?.close(); setOpen(false); }}>Close</button>
            </div>
          </div>
          <div
            ref={stage}
            className="relative flex flex-1 min-h-0 items-center justify-center overflow-hidden bg-[#050607] cursor-grab active:cursor-grabbing"
            onWheel={onWheel}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <img
              src={src}
              alt={alt || ""}
              draggable={false}
              className="max-h-full max-w-full object-contain select-none"
              style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.z})` }}
            />
          </div>
          {caption && (
            <div className="px-5 py-4 border-t border-white/10 max-h-[28vh] overflow-y-auto">
              <div className="text-[13.5px] leading-relaxed text-[#f4f1ea] max-w-4xl">{caption}</div>
              <p className="mt-2 font-mono text-[11px] text-white/55">Scroll to zoom · drag to pan</p>
            </div>
          )}
        </dialog>
      )}
    </>
  );
}
