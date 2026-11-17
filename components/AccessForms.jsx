"use client";

// Early-access and collaboration forms. The site is static (GitHub Pages) and
// has no form backend, so submitting composes a pre-filled email to Artemis in
// the visitor's own mail app. Nothing is sent from the page itself, and the UI
// says so — no simulated "received" state.
import { useEffect, useRef, useState } from "react";

export const CONTACT = "lbeharry@alumni.caltech.edu";
export const BOOKING = "https://calendar.app.google/Gcn7m6neU3P3ktQA8";

const DATA_TYPES = ["Spatial", "Single-cell", "Long-read", "Genomics", "Imaging", "Other"];

const FORMS = {
  "early-access": {
    title: "Request early access",
    kicker: "Early access",
    blurb: "Tell us about your lab and your data. We reply personally, usually with a proposed first analysis.",
    subject: "Early access request",
    fields: [
      ["name", "Name", "text", true],
      ["email", "Email", "email", true],
      ["institution", "Institution / lab", "text", true],
      ["role", "Role", "text", false, "PI, postdoc, graduate student, core staff…"],
      ["types", "Data type(s)", "chips", false],
      ["note", "Short note", "textarea", false, "Assay, organism, number of samples, the question you want answered…"],
    ],
  },
  collaborate: {
    title: "Suggest a collaboration",
    kicker: "Collaboration",
    blurb: "A dataset, a method, a joint project — propose it and we will come back with a plan.",
    subject: "Collaboration proposal",
    fields: [
      ["name", "Name", "text", true],
      ["email", "Email", "email", true],
      ["institution", "Institution", "text", true],
      ["project", "Proposed project / dataset", "textarea", true, "What you would like to do together, and on which data"],
      ["timeline", "Timeline", "text", false, "e.g. pilot this quarter, grant deadline in March…"],
      ["note", "Note", "textarea", false],
    ],
  },
};

function compose(kind, v) {
  const f = FORMS[kind];
  const lines = f.fields.map(([k, label]) => {
    const val = k === "types" ? (v.types || []).join(", ") : (v[k] || "").trim();
    return `${label}: ${val || "—"}`;
  });
  const subject = `${f.subject} · ${(v.institution || "").trim() || (v.name || "").trim()}`;
  const body = `${lines.join("\n")}\n\n— sent from artemislabs.bio`;
  return { subject, body, href: `mailto:${CONTACT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` };
}

export default function AccessForms() {
  const [kind, setKind] = useState(null);
  const [v, setV] = useState({});
  const [opened, setOpened] = useState(null);
  const [copied, setCopied] = useState(false);
  const dlg = useRef(null);
  const lastFocus = useRef(null);

  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.replace("#", "");
      if (FORMS[h]) { lastFocus.current = document.activeElement; setKind(h); setV({}); setOpened(null); setCopied(false); }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    const onClick = (e) => {
      const a = e.target.closest?.('a[href="#early-access"], a[href="#collaborate"]');
      if (!a) return;
      e.preventDefault();
      const h = a.getAttribute("href").slice(1);
      lastFocus.current = a; setKind(h); setV({}); setOpened(null); setCopied(false);
    };
    document.addEventListener("click", onClick);
    return () => { window.removeEventListener("hashchange", fromHash); document.removeEventListener("click", onClick); };
  }, []);

  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (kind && !d.open) d.showModal();
    if (!kind && d.open) d.close();
  }, [kind]);

  const close = () => {
    setKind(null);
    if (window.location.hash === "#early-access" || window.location.hash === "#collaborate") history.replaceState(null, "", window.location.pathname + window.location.search);
    lastFocus.current?.focus?.();
  };

  const f = kind ? FORMS[kind] : null;
  const submit = (e) => {
    e.preventDefault();
    const m = compose(kind, v);
    setOpened(m);
    window.location.href = m.href;
  };

  return (
    <dialog
      ref={dlg}
      onClose={close}
      onClick={(e) => { if (e.target === dlg.current) close(); }}
      className="access-dialog m-auto w-[min(640px,calc(100vw-24px))] max-h-[calc(100svh-24px)] rounded-[14px] border border-white/10 bg-[#0a0b0d] text-snow p-0 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)]"
      aria-labelledby="access-title"
    >
      {f && (
        <div className="p-6 md:p-9">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 id="access-title" className="mt-4 text-3xl md:text-4xl">{f.title}</h2>
              <p className="mt-3 text-[15px] text-dim leading-relaxed max-w-md">{f.blurb}</p>
            </div>
            <button type="button" onClick={close} aria-label="Close" className="shrink-0 h-9 w-9 rounded-full border border-white/10 text-dim hover:text-snow hover:border-white/30 transition-colors">×</button>
          </div>

          {!opened ? (
            <form onSubmit={submit} className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
              {f.fields.map(([k, label, type, req, ph]) => {
                const wide = type === "textarea" || type === "chips";
                const base = "mt-2 w-full bg-transparent border-0 border-b border-white/15 focus:border-violet outline-none py-2 text-[15px] text-snow placeholder:text-dim/60 transition-colors";
                return (
                  <label key={k} className={`block ${wide ? "sm:col-span-2" : ""}`}>
                    <span className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-dim">
                      {label}{req && <span className="text-violet"> *</span>}
                    </span>
                    {type === "chips" ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {DATA_TYPES.map((t) => {
                          const on = (v.types || []).includes(t);
                          return (
                            <button
                              type="button" key={t} aria-pressed={on}
                              onClick={() => setV((p) => ({ ...p, types: on ? p.types.filter((x) => x !== t) : [...(p.types || []), t] }))}
                              className={`rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${on ? "border-violet text-ink bg-violet" : "border-white/15 text-snow/80 hover:border-white/40"}`}
                            >
                              {t}
                            </button>
                          );
                        })}
                      </div>
                    ) : type === "textarea" ? (
                      <textarea rows={3} required={req} placeholder={ph} value={v[k] || ""} onChange={(e) => setV((p) => ({ ...p, [k]: e.target.value }))} className={`${base} resize-none`} />
                    ) : (
                      <input type={type} required={req} placeholder={ph} value={v[k] || ""} onChange={(e) => setV((p) => ({ ...p, [k]: e.target.value }))} className={base} autoComplete={k === "email" ? "email" : k === "name" ? "name" : "off"} />
                    )}
                  </label>
                );
              })}
              <div className="sm:col-span-2 mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="font-mono text-[11px] text-dim leading-relaxed max-w-xs">
                  Opens a pre-filled email to {CONTACT} in your mail app. Nothing is sent until you press send there.
                </p>
                <button type="submit" className="rounded-full bg-snow text-ink px-6 py-3 font-medium hover:bg-violet transition-colors">
                  Compose email →
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-8 rounded-[10px] border border-white/10 p-5">
              <p className="text-[15px] text-snow">Your mail app should now be open with this request pre-filled.</p>
              <p className="mt-2 text-[14px] text-dim leading-relaxed">
                It has not been sent yet — press send in your mail app. If nothing opened, copy the text below and email it to{" "}
                <a href={`mailto:${CONTACT}`} className="text-violet">{CONTACT}</a>.
              </p>
              <pre className="mt-4 max-h-48 overflow-auto whitespace-pre-wrap font-mono text-[12px] text-snow/80 bg-white/[0.03] rounded-[6px] p-3">{`Subject: ${opened.subject}\n\n${opened.body}`}</pre>
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" onClick={() => { navigator.clipboard?.writeText(`Subject: ${opened.subject}\n\n${opened.body}`).then(() => setCopied(true)).catch(() => {}); }} className="rounded-full border border-white/15 px-4 py-2 text-[13px] hover:border-violet transition-colors">
                  {copied ? "Copied" : "Copy text"}
                </button>
                <a href={opened.href} className="rounded-full border border-white/15 px-4 py-2 text-[13px] hover:border-violet transition-colors">Open mail app again</a>
                <a href={BOOKING} target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-4 py-2 text-[13px] hover:border-violet transition-colors">Or book a call ↗</a>
              </div>
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}
