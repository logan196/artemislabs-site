/* Artemis portal loader: white screen, the Artemis dodecahedron crystallising from particles with the
   partner institution's logo inside it, and a co-branded lockup underneath. Shows for at least MIN ms,
   fades once the page has loaded, never longer than CAP ms. Falls back to the static SVG mark without WebGL.
   Usage (first thing in <body>):
   <script src="/live/loader/portal-loader.js" data-inst="Caltech" data-logo="logos/caltech-wordmark.png"
           data-mark="logos/caltech-seal.svg"></script>   (paths relative to this script's folder) */
(function () {
  var me = document.currentScript; if (!me) return;
  var qs = location.search;
  try { if (window.self !== window.top) return; } catch (e) { return; }
  if (/[?&](embed|noloader)=/.test(qs)) return;
  var base = new URL(".", me.src).href, ds = me.dataset;
  var MIN = 2000, CAP = 3000, FADE = 450, t0 = performance.now();
  var inst = ds.inst || "", logo = ds.logo ? new URL(ds.logo, base).href : "", mark = ds.mark ? new URL(ds.mark, base).href : logo;
  var css = "#a-ldr{position:fixed;inset:0;z-index:2147483646;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(14px,3vh,26px);font:400 12px/1.4 ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#55808a;transition:opacity " + FADE + "ms cubic-bezier(.2,.7,.2,1);-webkit-font-smoothing:antialiased}" +
    "#a-ldr.out{opacity:0;pointer-events:none}" +
    "#a-ldr .al-st{position:relative;width:min(70vw,44vh,340px);aspect-ratio:1}" +
    "#a-ldr .al-st canvas{position:absolute;inset:0;width:100%;height:100%}" +
    "#a-ldr .al-fb{position:absolute;inset:6%;display:none;animation:alb 2.4s ease-in-out infinite}#a-ldr .al-fb img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}" +
    "#a-ldr .al-fb .al-in{inset:30%;width:40%;height:40%}" +
    "#a-ldr.fb .al-fb{display:block}" +
    "@keyframes alb{0%,100%{transform:scale(.97);opacity:.85}50%{transform:scale(1);opacity:1}}" +
    "#a-ldr .al-lk{display:flex;align-items:center;gap:clamp(12px,3vw,22px);opacity:0;transform:translateY(6px);animation:ali .7s cubic-bezier(.2,.7,.2,1) .35s forwards}" +
    "#a-ldr .al-lk img{display:block;height:clamp(30px,6vw,42px);width:auto;max-width:38vw;object-fit:contain}" +
    "#a-ldr .al-lk i{width:1px;height:clamp(26px,5vw,36px);background:#d5dfdb}" +
    "#a-ldr .al-cap{letter-spacing:.16em;text-transform:uppercase;font-size:10.5px;color:#7b9aa0;opacity:0;animation:ali .7s cubic-bezier(.2,.7,.2,1) .55s forwards}" +
    "#a-ldr .al-bar{width:min(42vw,180px);height:1px;background:#e4ebe8;overflow:hidden}#a-ldr .al-bar i{display:block;height:100%;width:100%;background:#0f766e;transform-origin:left;transform:scaleX(0);animation:alp " + CAP + "ms cubic-bezier(.3,.6,.2,1) forwards}" +
    "@keyframes ali{to{opacity:1;transform:none}}@keyframes alp{to{transform:scaleX(1)}}" +
    "@media (prefers-reduced-motion:reduce){#a-ldr .al-fb{animation:none}}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  var el = document.createElement("div"); el.id = "a-ldr"; el.setAttribute("role", "status");
  el.setAttribute("aria-label", "Loading" + (inst ? ", Artemis Biolabs \u00d7 " + inst : ""));
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  el.innerHTML = '<div class="al-st"><div class="al-fb"><img src="' + base + 'artemis-mark.png" alt="">' + (mark ? '<img class="al-in" src="' + esc(mark) + '" alt="">' : "") + '</div></div>' +
    '<div class="al-lk"><img src="' + base + 'artemis-lockup.svg" alt="Artemis Biolabs">' + (logo ? '<i></i><img src="' + esc(logo) + '" alt="' + esc(inst) + '">' : "") + '</div>' +
    '<div class="al-cap">' + (inst ? "Artemis Biolabs \u00d7 " + esc(inst) : "Loading portal") + '</div><div class="al-bar"><i></i></div>';
  (document.body || document.documentElement).appendChild(el);
  // A portal's own intro overlay (e.g. the GBM console boot) is hidden while this loader owns the screen.
  if (ds.replace) { var hideRep = function () { var r = document.querySelector(ds.replace); if (r) r.style.display = "none"; return !!r; };
    if (!hideRep()) document.addEventListener("DOMContentLoaded", hideRep, { once: true }); }
  el.addEventListener("click", function () { finish(); });
  var handle = null, done = false, loaded = document.readyState === "complete";
  function fallback() { el.classList.add("fb"); }
  var hold = /[?&]loaderhold=/.test(qs); // screenshot/QA aid: keep the loader up
  function finish() {
    if (done || hold) return; done = true;
    el.classList.add("out");
    setTimeout(function () { try { handle && handle.stop(); } catch (e) {} el.remove(); st.remove(); }, FADE + 50);
  }
  function maybe() { if (loaded && performance.now() - t0 >= MIN) finish(); }
  window.addEventListener("load", function () { loaded = true; setTimeout(maybe, Math.max(0, MIN - (performance.now() - t0))); });
  setTimeout(maybe, MIN); setTimeout(finish, CAP);
  var gl = null; try { var c = document.createElement("canvas"); gl = c.getContext("webgl2") || c.getContext("webgl"); } catch (e) {}
  if (!gl) return fallback();
  try { var lc = gl.getExtension("WEBGL_lose_context"); lc && lc.loseContext(); } catch (e) {} // free the probe context
  var img = new Image(); img.decoding = "async"; if (mark) img.src = mark;
  var ready = mark ? (img.decode ? img.decode().catch(function () {}) : Promise.resolve()) : Promise.resolve();
  Promise.all([import(base + "particles.js"), ready]).then(function (r) {
    if (done) return;
    handle = r[0].start(el.querySelector(".al-st"), { img: mark && img.naturalWidth ? img : null, logoScale: parseFloat(ds.scale || ".5") });
  }).catch(function (e) { console.warn("Artemis loader: particles unavailable", e); fallback(); });
})();
