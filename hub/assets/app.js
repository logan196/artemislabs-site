// Artemis Biolabs client hub. Hash routes: #/  #/lab/<id>  #/lab/<id>/<report>
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const main = $("#main");
const I = {
  arrow: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  back: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
  chev: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>',
  share: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v13M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg>',
  ext: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
  grid: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/></svg>',
  spatial: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="6" cy="7" r="2"/><circle cx="12" cy="5" r="1.6"/><circle cx="17.5" cy="8" r="2.2"/><circle cx="8" cy="13" r="1.6"/><circle cx="14" cy="12.5" r="2"/><circle cx="6.5" cy="18.5" r="1.8"/><circle cx="12.5" cy="18.5" r="1.4"/><circle cx="18" cy="16.5" r="1.7"/></svg>',
  report: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/></svg>',
  slides: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 16v4M8 20h8"/></svg>',
  model: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="5" cy="7" r="2"/><circle cx="5" cy="17" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="7" r="2"/><circle cx="19" cy="17" r="2"/><path d="M7 7.8 10 11M7 16.2l3-3.2M14 11l3-3.2M14 13l3 3.2"/></svg>',
  atlas: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.6 2.6 14.4 0 17M12 3.5c-2.6 2.6-2.6 14.4 0 17"/></svg>',
  review: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 5.5C6.5 4 9.5 4 12 6c2.5-2 5.5-2 8-.5V19c-2.5-1.5-5.5-1.5-8 .5-2.5-2-5.5-2-8-.5z"/><path d="M12 6v13.5"/></svg>',
  volume: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3 20 7.5v9L12 21l-8-4.5v-9z"/><path d="M12 12 20 7.5M12 12 4 7.5M12 12v9"/></svg>',
};
let DATA, REND = { items: [] }, landing = null, LANDMOD = null;

const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
const liveCount = L => L.reports.filter(r => r.status === "live").length;
function toast(t) { const el = $("#toast"); el.textContent = t; el.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove("on"), 1800); }
const footer = () => `<footer class="foot"><span>Artemis Biolabs. Public-data reports are independent demos, not endorsed by the labs shown.</span><span><a href="${DATA.site}" target="_blank" rel="noopener">artemislabs.bio</a> · <a href="${DATA.booking}" target="_blank" rel="noopener">Book a call</a></span></footer>`;
const ext = r => r.url && r.url.includes("kusminski") ? "noopener nofollow noreferrer" : "noopener";

function renderingsBlock(labId) {
  const items = (REND.items || []).filter(x => !labId || x.lab === labId);
  if (!items.length) return "";
  return `<section class="rend" id="renderings"><p class="over">Renderings</p>
  <div class="rgal">${items.map(x => `<figure>${x.kind === "video"
    ? `<video src="${esc(x.file)}" ${x.poster ? `poster="${esc(x.poster)}"` : ""} muted loop playsinline autoplay preload="metadata"></video>`
    : `<img src="${esc(x.file)}" alt="${esc(x.title)}" loading="lazy" decoding="async">`}<figcaption><b>${esc(x.title)}</b>${esc(x.caption || "")}</figcaption></figure>`).join("")}</div></section>`;
}

function hub() {
  document.title = "All labs · Artemis Biolabs";
  main.innerHTML = `<section class="page"><div class="head"><p class="over">Client hub</p><h1>All labs</h1><p class="sub">Every lab and the work we built for it.</p></div>
    <div class="list">${DATA.labs.map((L, i) => {
      const n = liveCount(L);
      return `<a class="row" style="--i:${i}" href="#/lab/${L.id}"><img class="av" src="${esc(L.photo)}" alt="" width="36" height="36" loading="lazy" decoding="async">
        <span class="t"><h3>${esc(L.name)}${n ? "" : '<span class="tag">Soon</span>'}</h3><p>${esc(L.institution.name)} · ${n ? plural(n, "report") : "Coming soon"}</p></span><span class="arr">${I.arrow}</span></a>`;
    }).join("")}</div>${renderingsBlock(null)}</section>${footer()}`;
}

function lab(L) {
  document.title = `${L.name} · Artemis Biolabs`;
  const n = liveCount(L), inst = L.institution;
  main.innerHTML = `<section class="page">
    <nav class="crumb" aria-label="Breadcrumb"><a href="#/">All labs</a><i>/</i><span>${esc(L.name)}</span></nav>
    <span class="lablogo${inst.wide ? "" : " sq"}"><img src="${esc(inst.wide ? inst.logo : inst.logoMark)}" alt="${esc(inst.name)} logo"></span>
    <div class="head"><p class="over">Reports</p><h1>${esc(L.name)}</h1>
      <p class="meta"><span>${esc(L.dept || inst.name)}</span><span>${n ? plural(n, "report") : "Coming soon"}</span></p>
      ${L.note ? `<p class="lnote">${esc(L.note)}</p>` : ""}</div>
    <div class="list reps">${L.reports.map((r, i) => `<a class="row" style="--i:${i}" href="#/lab/${L.id}/${r.id}"><span class="ico">${I[r.icon] || I.report}</span>
      <span class="t"><h3>${esc(r.title)}${r.status !== "live" ? '<span class="tag">Soon</span>' : ""}</h3><p>${esc(r.desc)}</p></span><span class="arr">${I.arrow}</span></a>`).join("")}</div>
    ${renderingsBlock(L.id)}</section>${footer()}`;
}

async function report(L, r) {
  document.title = `${r.title} · ${L.name} · Artemis Biolabs`;
  document.body.classList.add("app");
  const live = r.status === "live";
  const pills = r.pills.filter(p => p.on).slice(0, 3);
  main.innerHTML = `<div class="bar">
      <a class="home" href="#/" title="All labs"><img src="assets/marks/artemis_mark.svg" alt="Artemis Biolabs, all labs"></a><span class="sep s1">/</span>
      <a class="home nm" href="#/lab/${L.id}">${esc(L.name)}</a><span class="sep s1">/</span>
      <label class="pick"><span class="skip">Report</span><select id="rsel" aria-label="Switch report">${L.reports.map(x => `<option value="${x.id}" ${x.id === r.id ? "selected" : ""}>${esc(x.title)}</option>`).join("")}</select>${I.chev}</label>
      <span class="sp"></span>
      <button class="ib" id="shareBtn" title="Share" aria-label="Share this report">${I.share}</button>
      <a class="ib" href="${live ? esc(r.url) : "#"}" target="_blank" rel="${ext(r)}" title="Open in a new tab" aria-label="Open the report in a new tab" ${live ? "" : 'aria-disabled="true"'}>${I.ext}</a>
    </div>
    <div class="loading" id="loading"><i class="spin"></i>Loading report...</div>
    <section class="land">
      <div class="stage" id="stage" role="img" aria-label="Particles forming the Artemis Biolabs mark and the ${esc(L.institution.name)} logo"><span class="div"></span></div>
      <div class="copy">
        <p class="ov"><span>${esc(L.institution.short)}</span><i></i><span>${esc(L.name)}</span></p>
        <h1>${esc(r.title)}</h1>
        <p class="subj">${esc(r.subject)}${r.citation ? `. ${esc(r.citation)}` : ""}${r.accession && r.accession !== r.citation ? `, ${esc(r.accession)}` : ""}.</p>
        <div class="pills">${pills.map(p => `<span class="pill"><i></i>${esc(p.label)}</span>`).join("")}</div>
        <div class="ctas">${live ? `<a class="btn" id="openBtn" href="${esc(r.url)}" target="_blank" rel="${ext(r)}">Open the ${r.kind === "Walkthrough" ? "walkthrough" : r.kind === "Briefing" ? "briefing" : "report"} ${I.arrow}</a>` : `<a class="btn" aria-disabled="true">Coming soon</a>`}
          <a class="lnk" href="${DATA.booking}" target="_blank" rel="noopener">Book a call</a></div>
        <p class="fine">${L.client ? esc(L.note) : `Independent demo built from public data. Not affiliated with or endorsed by the ${esc(L.name)}.`}</p>
      </div>
    </section>`;
  $("#rsel").onchange = e => { location.hash = `#/lab/${L.id}/${e.target.value}`; };
  $("#shareBtn").onclick = async () => {
    const url = location.href;
    try { if (navigator.share && matchMedia("(pointer:coarse)").matches) await navigator.share({ title: r.title, url }); else { await navigator.clipboard.writeText(url); toast("Link copied"); } }
    catch { toast(url); }
  };
  const t0 = performance.now(), logo = new Image(); logo.src = L.institution.logo;
  let h = null;
  try {
    [LANDMOD] = await Promise.all([LANDMOD || import("./landing.js"), logo.decode().catch(() => {})]);
    const st = $("#stage"); if (!st) return;
    h = LANDMOD.start(st, { mode: "report", img: logo, inst: L.institution });
  } catch (e) { console.warn("Landing animation unavailable", e); }
  await new Promise(res => setTimeout(res, Math.max(0, 600 - (performance.now() - t0))));
  if (!$("#stage")?.isConnected) { h?.stop(); return; }
  landing = h;
  document.body.classList.add("lit");
  $("#loading")?.classList.add("done");
}

function route() {
  landing?.stop(); landing = null;
  document.body.classList.remove("app", "lit");
  const [, , id, rid] = (location.hash || "#/").split("/");
  const L = DATA.labs.find(x => x.id === id);
  if (L && rid) { const r = L.reports.find(x => x.id === rid); if (r) return report(L, r); }
  if (L) lab(L); else hub();
  scrollTo(0, 0);
  main.focus({ preventScroll: true });
}

(async () => {
  DATA = await (await fetch("data/labs.json")).json();
  route();
  addEventListener("hashchange", route);
  try { REND = await (await fetch("data/renderings.json")).json(); if (REND.items?.length) route(); } catch {}
})();
