/* Text link back to the marketing page, fixed at the top right of live portals. */
(function () {
  if (document.querySelector("[data-artemis-home]")) return;
  var css = document.createElement("style");
  css.textContent = [
    ".artemis-home-link{position:fixed;top:12px;right:12px;z-index:90;",
    "font:600 11px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;",
    "letter-spacing:.12em;text-transform:uppercase;text-decoration:none;",
    "color:#f4f1ea;background:rgba(6,16,18,.82);",
    "border:1px solid rgba(255,255,255,.22);border-radius:4px;",
    "padding:7px 10px;}",
    ".artemis-home-link:hover,.artemis-home-link:focus-visible{color:#fff;border-color:#5fc9b8;outline:none;}"
  ].join("");
  document.head.appendChild(css);
  var a = document.createElement("a");
  a.href = "/";
  a.className = "artemis-home-link";
  a.dataset.artemisHome = "1";
  a.textContent = "Main page";
  document.body.appendChild(a);
})();
