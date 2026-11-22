(function () {
  "use strict";

  /* Homepage GBM3 workbench tour.
     Style the 04 card in the search-to-portal story and play the intro when
     that card scrolls into view. Do not hide or retarget #portal: that id
     belongs to the live Gudjonsson explorer further down the page. */

  var STYLE_ID = "wb-portal-style";
  var STYLE_TEXT =
    "#search-live-workbench{width:100%;display:block;background:#07060b;border:0;height:min(500px,54svh)}" +
    ".wb-story-card{max-width:min(62rem,calc(100% - 7.5rem));margin-left:auto;margin-right:auto;border-color:rgba(20,184,166,.32)!important;box-shadow:0 0 0 1px rgba(20,184,166,.12),0 28px 80px -36px rgba(20,184,166,.3);border-radius:12px;background:#07060b}" +
    ".wb-story-card iframe{height:min(500px,54svh)!important}" +
    "@media(max-width:720px){#search-live-workbench,.wb-story-card iframe{height:min(760px,88svh)!important}.wb-story-card{max-width:100%!important;margin-left:0!important;margin-right:0!important}}";

  var watching = false;
  var listening = false;

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = STYLE_TEXT;
    document.head.appendChild(s);
  }

  function visible(iframe) {
    if (!iframe) return false;
    var r = iframe.getBoundingClientRect();
    return r.height > 40 && r.top < window.innerHeight * 0.92 && r.bottom > window.innerHeight * 0.08;
  }

  function sendPlay(iframe) {
    if (!iframe) return;
    try {
      if (iframe.contentWindow) iframe.contentWindow.postMessage({ type: "wb-play" }, "*");
    } catch (e) {}
  }

  function playWhenVisible(iframe) {
    if (!iframe) return;
    if (iframe.dataset.wbHook === "1") {
      if (visible(iframe)) sendPlay(iframe);
      return;
    }
    iframe.dataset.wbHook = "1";
    if (typeof IntersectionObserver !== "undefined") {
      var io = new IntersectionObserver(function (ents) {
        if (ents.some(function (e) { return e.isIntersecting && e.intersectionRatio >= 0.15; })) sendPlay(iframe);
      }, { threshold: [0.15, 0.3, 0.5, 0.7] });
      io.observe(iframe);
    }
    iframe.addEventListener("load", function () { if (visible(iframe)) sendPlay(iframe); });
    if (visible(iframe)) sendPlay(iframe);
    [400, 1000, 1800, 3200, 5000].forEach(function (ms) {
      setTimeout(function () { if (visible(iframe)) sendPlay(iframe); }, ms);
    });
  }

  function enhancePipelineCard() {
    var iframe = document.getElementById("search-live-workbench");
    if (!iframe) return;
    if (iframe.dataset.wbV !== "7") {
      var src = iframe.getAttribute("src") || "/live/workbench/index.html?embed=1";
      if (src.indexOf("v=7") === -1) {
        var base = src.split("?")[0];
        iframe.setAttribute("src", base + "?embed=1&v=7");
      }
      iframe.dataset.wbV = "7";
    }
    var card = iframe.parentElement;
    if (card && !card.classList.contains("wb-story-card")) {
      card.classList.add("wb-story-card");
      card.style.maxWidth = "min(62rem, calc(100% - 7.5rem))";
    }
    playWhenVisible(iframe);
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
      });
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
