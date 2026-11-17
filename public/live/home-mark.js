/* Small dodecahedron on the right of every live portal. Hover lights it;
   click returns to the marketing page. */
(function () {
  if (document.querySelector("[data-artemis-home]")) return;
  var css = document.createElement("style");
  css.textContent = [
    ".artemis-home-mark{position:fixed;top:12px;right:12px;z-index:90;display:grid;place-items:center;",
    "width:40px;height:40px;border-radius:10px;background:rgba(6,16,18,.78);",
    "border:1px solid rgba(95,201,184,.45);text-decoration:none;",
    "transition:transform .2s ease,box-shadow .2s ease,filter .2s ease;}",
    ".artemis-home-mark img{width:26px;height:26px;display:block;}",
    ".artemis-home-mark:hover,.artemis-home-mark:focus-visible{transform:scale(1.08);",
    "box-shadow:0 0 0 1px rgba(247,244,234,.9),0 0 18px rgba(255,255,255,.8);",
    "filter:drop-shadow(0 0 8px rgba(247,244,234,.95));outline:none;}"
  ].join("");
  document.head.appendChild(css);
  var a = document.createElement("a");
  a.href = "/";
  a.className = "artemis-home-mark";
  a.dataset.artemisHome = "1";
  a.setAttribute("aria-label", "Back to the Artemis BioLabs main page");
  a.title = "Back to the main page";
  var img = document.createElement("img");
  img.src = "/artemis_mark.svg";
  img.alt = "";
  a.appendChild(img);
  document.body.appendChild(a);
})();
