(function () {
  "use strict";

  /* Replace only the #portal still image with the live workbench.
     Do not touch the opening sequence, nav, or any other section. */

  var FRAME =
    '<div id="wb-portal-box" class="relative overflow-hidden rounded-[6px] border" style="background:#000;border-color:rgba(255,255,255,.18)">' +
    '<iframe id="wb-portal-frame" src="/live/workbench/index.html?embed=1" title="Linked UMAP and spatial workbench for a public GBM3 Visium section" loading="lazy" style="width:100%;height:640px;border:0;display:block;background:#000"></iframe>' +
    "</div>";

  var LINKS =
    '<div id="wb-portal-links" class="mt-8 flex flex-wrap items-center gap-3">' +
    '<a href="/live/workbench/" target="_blank" rel="noreferrer" class="rounded-[3px] px-5 py-2 text-[15px] font-medium" style="background:#7eefe0;color:#08110f">Open full screen</a>' +
    '<a href="/live/explore/index.html" target="_blank" rel="noreferrer" class="rounded-[3px] border px-5 py-2 text-[15px]" style="border-color:rgba(255,255,255,.22);color:#cfc8bc">Histology explorer</a>' +
    '<span style="font:500 11px/1 ui-monospace,Menlo,monospace;color:#7eefe0">live · linked views, not a screenshot</span>' +
    "</div>";

  var STYLE_ID = "wb-portal-style";
  var STYLE_TEXT =
    "@media(max-width:720px){#wb-portal-frame{height:860px!important}}";

  var CAPTION =
    "Ren et al. 2023 (GSE194329). Public 10x Visium glioblastoma section, 1,775 spots. Lasso on either plot to highlight the same cells in the other. Color by SOX2, EGFR or CD68.";

  var SUB =
    "Lasso a cluster on the UMAP or the tissue, and the same cells light up in the other view. A public glioblastoma Visium section, live in the browser.";

  var watching = false;

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = STYLE_TEXT;
    document.head.appendChild(s);
  }

  function setText(el, text) {
    if (!el) return;
    if (el.textContent !== text) el.textContent = text;
  }

  function enhance() {
    var portal = document.getElementById("portal");
    if (!portal) return;

    ensureStyle();

    var still = portal.querySelector('img[src*="still_GBM1_portal"], img[src*="still_"]');
    var box = document.getElementById("wb-portal-box");

    if (still) {
      var host = still.parentNode;
      if (host) {
        host.innerHTML = FRAME;
        box = document.getElementById("wb-portal-box");
      }
    }

    if (box && !document.getElementById("wb-portal-links")) {
      box.insertAdjacentHTML("afterend", LINKS);
    }

    var cap = portal.querySelector("p.text-\\[13\\.5px\\], p[class*='text-[13']");
    if (!cap) {
      var ps = portal.querySelectorAll("p");
      cap = ps.length ? ps[ps.length - 1] : null;
    }
    setText(cap, CAPTION);

    var intro = portal.querySelector("p.text-lg, p[class*='text-lg']");
    if (intro && /heatmap|Vitessce|gene list/i.test(intro.textContent)) {
      setText(intro, SUB);
    }

    if (portal && !watching) {
      watching = true;
      new MutationObserver(function () {
        if (portal.querySelector('img[src*="still_"]') || !document.getElementById("wb-portal-frame")) {
          enhance();
        }
      }).observe(portal, { childList: true, subtree: true });
    }
  }

  function start() {
    enhance();
    [200, 600, 1500, 3000].forEach(function (ms) {
      setTimeout(enhance, ms);
    });
  }

  if (document.readyState === "complete") start();
  else window.addEventListener("load", start);
})();
