(function () {
  "use strict";

  var HTML = [
    '<section id="workbench-live" class="relative px-6 md:px-14 py-20 md:py-28 max-w-7xl mx-auto">',
    '  <style>#workbench-live iframe{width:100%;height:640px;border:0;display:block;background:#000}#workbench-live .wb-live-tag{font:500 11px/1 ui-monospace,Menlo,monospace;color:#7eefe0;padding:8px 2px}@media(max-width:720px){#workbench-live iframe{height:860px}}</style>',
    '  <p class="font-mono text-xs tracking-wide mb-4" style="color:#2dd4bf;letter-spacing:.16em;">LIVE WORKBENCH · UMAP AND SPATIAL</p>',
    '  <h2 class="text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl">Lasso a cluster. <span style="color:#7eefe0">See it in the tissue.</span></h2>',
    '  <p class="mt-6 max-w-2xl text-lg leading-relaxed" style="color:#9b988f">A public glioblastoma section, 1,775 spots, with UMAP and spatial views linked. Color by a gene, draw a lasso on either plot, and the same cells light up in the other.</p>',
    '  <div class="mt-10 flex flex-wrap items-center gap-3">',
    '    <a href="/live/workbench/" target="_blank" rel="noreferrer" class="rounded-[3px] px-5 py-2 text-[15px] font-medium" style="background:#7eefe0;color:#08110f">Open full screen</a>',
    '    <a href="/live/explore/index.html" target="_blank" rel="noreferrer" class="rounded-[3px] border px-5 py-2 text-[15px]" style="border-color:rgba(255,255,255,.22);color:#cfc8bc">Histology explorer</a>',
    '    <a href="/live/GBM3/portal.html" target="_blank" rel="noreferrer" class="rounded-[3px] border px-5 py-2 text-[15px]" style="border-color:rgba(255,255,255,.22);color:#cfc8bc">GBM3 portal</a>',
    '    <span class="wb-live-tag">live · linked views, not a screenshot</span>',
    '  </div>',
    '  <div class="mt-5 relative overflow-hidden rounded-[6px] border" style="background:#000;border-color:#1a1c28">',
    '    <iframe src="/live/workbench/index.html?embed=1" title="Linked UMAP and spatial workbench for a public GBM3 Visium section" loading="lazy"></iframe>',
    '  </div>',
    '  <p class="mt-4 text-[13.5px] leading-relaxed" style="color:#8a867c">Ren et al. 2023 (GSE194329). Public 10x Visium data. SOX2, EGFR and CD68 are log-normalized expression.</p>',
    '</section>'
  ].join("");

  var watching = false;

  function addNavLink() {
    var spatial = document.getElementById("spatial");
    if (!spatial) return;
    var nav = spatial.querySelector("nav");
    if (!nav) return;
    if (nav.querySelector('a[href="/live/workbench/"]')) return;
    var a = document.createElement("a");
    a.href = "/live/workbench/";
    a.textContent = "Linked workbench";
    nav.appendChild(a);
  }

  function makeSection() {
    var wrap = document.createElement("div");
    wrap.innerHTML = HTML;
    return wrap.querySelector("#workbench-live");
  }

  function place() {
    var viewer = document.getElementById("viewer");
    var section = document.getElementById("workbench-live");
    var parent = viewer && viewer.parentNode;
    if (section && parent && section.parentNode === parent && section.nextElementSibling === viewer) {
      viewer.hidden = true;
      viewer.setAttribute("aria-hidden", "true");
      addNavLink();
      return;
    }
    if (!section) section = makeSection();
    if (parent) {
      parent.insertBefore(section, viewer);
      viewer.hidden = true;
      viewer.setAttribute("aria-hidden", "true");
    } else if (!section.parentNode) {
      var contact = document.getElementById("contact");
      if (contact && contact.parentNode) contact.parentNode.insertBefore(section, contact);
      else document.body.appendChild(section);
    }
    addNavLink();
    if (parent && !watching) {
      watching = true;
      new MutationObserver(function () { place(); }).observe(parent, { childList: true });
    }
  }

  function start() {
    place();
    [200, 600, 1500, 3000].forEach(function (ms) { setTimeout(place, ms); });
  }

  if (document.readyState === "complete") start();
  else window.addEventListener("load", start);
})();
