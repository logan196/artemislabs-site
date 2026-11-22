(function () {
  "use strict";

  /* Homepage GBM3 workbench tour.
     Style the 04 card in the search-to-portal story. Do not attach the
     workbench iframe (or load Vitessce / h5ad / h5wasm) until Act 4 is
     actually showing. Do not hide or retarget #portal: that id belongs
     to the live Gudjonsson explorer further down the page. */

  var WB_SRC = "/live/workbench/index.html?embed=1&v=13";
  var ACT4_PROGRESS = 0.75;
  var STYLE_ID = "wb-portal-style";
  var STYLE_TEXT =
    "#search-live-workbench{width:100%;display:block;background:#1a1a1a;border:0;height:min(500px,calc(100svh - 16rem))}" +
    ".wb-story-card{max-width:min(68rem,calc(100% - 5rem));margin:0 auto 14px;border-color:#2a2a2a!important;box-shadow:none!important;border-radius:2px;background:#1a1a1a;position:relative;z-index:20}" +
    ".wb-story-card iframe{height:min(500px,calc(100svh - 16rem))!important}" +
    "#pipeline .sticky>[aria-hidden]{z-index:0!important}" +
    "@media(max-width:720px){#search-live-workbench,.wb-story-card iframe{height:min(520px,calc(100svh - 12rem))!important}.wb-story-card{max-width:100%!important;margin-left:0!important;margin-right:0!important;margin-bottom:16px}}";

  var watching = false;
  var listening = false;
  var scrollHooked = false;

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = STYLE_TEXT;
    document.head.appendChild(s);
  }

  function pipelineProgress() {
    var el = document.getElementById("pipeline");
    if (!el) return 0;
    var r = el.getBoundingClientRect();
    var range = Math.max(1, el.offsetHeight - window.innerHeight);
    return Math.max(0, Math.min(1, -r.top / range));
  }

  function act4Showing() {
    return pipelineProgress() >= ACT4_PROGRESS;
  }

  function visible(iframe) {
    if (!iframe) return false;
    if (!act4Showing()) return false;
    var r = iframe.getBoundingClientRect();
    return r.height > 40 && r.top < window.innerHeight * 0.92 && r.bottom > window.innerHeight * 0.08;
  }

  function send(iframe, type) {
    if (!iframe || !iframe.contentWindow) return;
    try { iframe.contentWindow.postMessage({ type: type }, "*"); } catch (e) {}
  }

  function sendPlay(iframe) {
    send(iframe, "wb-play");
  }

  function attachIframe(iframe) {
    if (!iframe || iframe.dataset.wbAttached === "1") return;
    var src = iframe.getAttribute("data-wb-src") || WB_SRC;
    iframe.dataset.wbAttached = "1";
    iframe.dataset.wbV = "12";
    iframe.setAttribute("src", src);
    iframe.addEventListener("load", function () {
      send(iframe, "wb-load");
      if (visible(iframe)) sendPlay(iframe);
    });
  }

  function holdIframe(iframe) {
    if (!iframe || iframe.dataset.wbHeld === "1") return;
    iframe.dataset.wbHeld = "1";
    var existing = iframe.getAttribute("src") || "";
    var held = iframe.getAttribute("data-wb-src") || "";
    if (!held) {
      if (existing && existing !== "about:blank" && existing.indexOf("workbench") !== -1) {
        held = existing.indexOf("v=") === -1
          ? existing + (existing.indexOf("?") >= 0 ? "&" : "?") + "v=13"
          : existing.replace(/v=\d+/, "v=13");
      } else {
        held = WB_SRC;
      }
      iframe.setAttribute("data-wb-src", held);
    }
    if (existing && existing !== "about:blank") {
      iframe.setAttribute("src", "about:blank");
    }
  }

  function maybeAttach() {
    var iframe = document.getElementById("search-live-workbench");
    if (!iframe) return;
    holdIframe(iframe);
    if (act4Showing()) attachIframe(iframe);
  }

  function playWhenVisible(iframe) {
    if (!iframe || iframe.dataset.wbHook === "1") {
      if (iframe && visible(iframe)) sendPlay(iframe);
      return;
    }
    iframe.dataset.wbHook = "1";
    iframe.addEventListener("load", function () { if (visible(iframe)) sendPlay(iframe); });
    if (visible(iframe)) sendPlay(iframe);
  }

  function clearCaption() {
    var iframe = document.getElementById("search-live-workbench");
    var card = document.querySelector(".wb-story-card");
    if (!iframe || !card) return;
    var fig = null;
    var root = document.getElementById("pipeline") || document;
    var ps = root.querySelectorAll("p");
    for (var i = 0; i < ps.length; i++) {
      if (/Fig\.\s*1/.test(ps[i].innerText || "")) { fig = ps[i]; break; }
    }
    if (!fig) return;
    var overflow = Math.ceil(card.getBoundingClientRect().bottom - fig.getBoundingClientRect().top + 10);
    if (overflow <= 0) return;
    var h = iframe.getBoundingClientRect().height;
    var next = Math.max(window.innerWidth < 720 ? 420 : 400, Math.round(h - overflow));
    if (next < h - 0.5) {
      iframe.style.setProperty("height", next + "px", "important");
    }
  }

  function enhancePipelineCard() {
    maybeAttach();
    var iframe = document.getElementById("search-live-workbench");
    if (!iframe) return;
    var card = iframe.parentElement;
    if (card && !card.classList.contains("wb-story-card")) {
      card.classList.add("wb-story-card");
    }
    if (iframe.dataset.wbAttached === "1") playWhenVisible(iframe);
    requestAnimationFrame(function () {
      clearCaption();
      setTimeout(clearCaption, 400);
      setTimeout(clearCaption, 1200);
    });
    return card;
  }

  function enhance() {
    ensureStyle();
    enhancePipelineCard();
    if (!listening) {
      listening = true;
      window.addEventListener("message", function (ev) {
        var d = ev.data || {};
        if (d.type !== "wb-ready") return;
        var iframe = document.getElementById("search-live-workbench");
        if (iframe && ev.source === iframe.contentWindow && visible(iframe)) sendPlay(iframe);
        setTimeout(clearCaption, 50);
      });
      window.addEventListener("resize", clearCaption);
    }
    if (!scrollHooked) {
      scrollHooked = true;
      window.addEventListener("scroll", function () {
        maybeAttach();
        var iframe = document.getElementById("search-live-workbench");
        if (iframe && iframe.dataset.wbAttached === "1" && visible(iframe)) sendPlay(iframe);
      }, { passive: true });
    }
    if (!watching) {
      watching = true;
      new MutationObserver(function () {
        enhancePipelineCard();
      }).observe(document.documentElement, { childList: true, subtree: true });
    }
  }

  function start() {
    enhance();
    [200, 600, 1500, 3000].forEach(function (ms) { setTimeout(enhance, ms); });
  }

  if (document.readyState === "complete") start();
  else window.addEventListener("load", start);
})();
