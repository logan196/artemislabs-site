/* Founders section: scroll reveals, the arrow-and-polyhedron canvas, and the lazy Vitessce portal.
   No dependencies. Honors prefers-reduced-motion; pauses off-screen. */
(function () {
  "use strict";
function init() {
  var sec = document.getElementById("founders");
  var cvx = document.getElementById("af-hunt-canvas");
  if (!sec || !cvx || cvx.__afInit) return;
  cvx.__afInit = 1;
  var RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  /* ---- reveals ---- */
  var rev = sec.querySelectorAll("[data-af-reveal]");
  if (hasIO && !RM) {
    sec.classList.add("af-ready");
    var k = 0, io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target; io.unobserve(el);
        setTimeout(function () { el.classList.add("af-in"); }, (k++ % 3) * 110);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    rev.forEach(function (el) { io.observe(el); });
  } else rev.forEach(function (el) { el.classList.add("af-in"); });

  /* ---- a wireframe dodecahedron assembles, an arrow strikes it, the Caltech wordmark lights up inside ---- */
  var cv = document.getElementById("af-hunt-canvas");
  if (cv && cv.getContext) (function () {
    var ctx = cv.getContext("2d"), W = 600, H = 380, dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = W * dpr; cv.height = H * dpr; ctx.scale(dpr, dpr);
    var p = (1 + Math.sqrt(5)) / 2, q = 1 / p, V = [];
    [-1, 1].forEach(function (a) { [-1, 1].forEach(function (b) { [-1, 1].forEach(function (c) { V.push([a, b, c]); }); }); });
    [-1, 1].forEach(function (a) { [-1, 1].forEach(function (b) { V.push([0, a * q, b * p]); V.push([a * q, b * p, 0]); V.push([a * p, 0, b * q]); }); });
    var E = [], d2 = 4 * q * q;
    for (var i = 0; i < V.length; i++) for (var j = i + 1; j < V.length; j++) {
      var dx = V[i][0] - V[j][0], dy = V[i][1] - V[j][1], dz = V[i][2] - V[j][2];
      if (Math.abs(dx * dx + dy * dy + dz * dz - d2) < 1e-6) E.push([i, j]);
    }
    var CX = 318, CY = 190, R = 128, MINT = "94,234,212", TEAL = "20,184,166";
    var logo = new Image(), LW = 168, LH = LW * 110 / 450; /* the wordmark's own 450:110 aspect, never stretched */
    logo.src = "founders/caltech-wordmark.png";
    function rot(v, a, b) {
      var x = v[0], y = v[1], z = v[2], ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
      var x1 = x * ca + z * sa, z1 = -x * sa + z * ca, y1 = y * cb - z1 * sb, z2 = y * sb + z1 * cb;
      return [CX + x1 * R / 1.75, CY + y1 * R / 1.75, z2];
    }
    var rnd = (function (s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })(11);
    var EO = E.map(function () { return rnd(); });
    var DOTS = []; for (i = 0; i < 46; i++) DOTS.push({ a: rnd() * 6.283, r: 1.15 + rnd() * .5, s: .5 + rnd() * 1.2, w: .15 + rnd() * .25 });
    var frozen = false, REV = 0; /* wordmark reveal 0..1: front edges dim so they never obscure the mark */
    var CYCLE = 10, t0 = null, running = false, raf = 0, last = 0;
    function cl(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
    function ease(x) { x = cl(x); return 1 - Math.pow(1 - x, 3); }
    function edges(P, front, al, grow, spread) {
      ctx.lineCap = "round";
      E.forEach(function (e, k) {
        var A = P[e[0]], B = P[e[1]], z = (A[2] + B[2]) / 2;
        if ((z >= 0) !== front) return;
        var f = cl(grow * 1.7 - EO[k] * .7); if (f <= 0) return;
        var ax = A[0], ay = A[1], bx = B[0], by = B[1];
        if (spread) { var mx = (ax + bx) / 2 - CX, my = (ay + by) / 2 - CY; ax += mx * spread; bx += mx * spread; ay += my * spread; by += my * spread; }
        bx = ax + (bx - ax) * f; by = ay + (by - ay) * f;
        var depth = .3 + .7 * (z + 1.8) / 3.6;
        ctx.strokeStyle = "rgba(" + MINT + "," + (al * depth * (front ? 1 - .5 * REV : .55)).toFixed(3) + ")";
        ctx.lineWidth = front ? 1.6 : 1.1;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      });
    }
    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      var a = t * .38, b = .45 + Math.sin(t * .27) * .22;
      var P = V.map(function (v) { return rot(v, a, b); });
      var grow = ease(t / 1.8), fly = (t - 1.5) / .8, hit = t - 2.3;
      var reveal = ease((t - 2.3) / .8), out = ease((t - 8.4) / .8);
      var al = 1 - out, spread = out * .35;
      REV = reveal * (1 - out);
      var g = ctx.createRadialGradient(CX, CY, 6, CX, CY, 190);
      g.addColorStop(0, "rgba(" + TEAL + "," + (.18 * grow * al) + ")");
      g.addColorStop(.45, "rgba(255,110,30," + (.07 * reveal * al) + ")");
      g.addColorStop(1, "rgba(" + TEAL + ",0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      DOTS.forEach(function (d) {
        var an = d.a + t * d.w, x = CX + Math.cos(an) * R * d.r, y = CY + Math.sin(an) * R * d.r * .42;
        ctx.fillStyle = "rgba(" + MINT + "," + (.35 * grow * al).toFixed(3) + ")"; ctx.beginPath(); ctx.arc(x, y, d.s, 0, 6.283); ctx.fill();
      });
      edges(P, false, al, grow, spread);
      if (reveal > 0 && logo.complete && logo.naturalWidth) {
        var la = reveal * (1 - out), sc = .9 + .1 * reveal, w = LW * sc, h = LH * sc;
        var plate = ctx.createRadialGradient(CX, CY, 4, CX, CY, w * .75);
        plate.addColorStop(0, "rgba(7,6,11," + (.75 * la) + ")"); plate.addColorStop(1, "rgba(7,6,11,0)");
        ctx.fillStyle = plate; ctx.fillRect(CX - w, CY - w, w * 2, w * 2);
        ctx.save(); ctx.globalAlpha = la; ctx.shadowColor = "rgba(255,110,30,.55)"; ctx.shadowBlur = 22 * la;
        ctx.drawImage(logo, CX - w / 2, CY - h / 2, w, h); ctx.restore();
      }
      edges(P, true, al, grow, spread);
      if (grow >= 1 && !out) P.forEach(function (v) { ctx.fillStyle = "rgba(" + MINT + "," + (.35 + .55 * (v[2] + 1.8) / 3.6).toFixed(3) + ")"; ctx.beginPath(); ctx.arc(v[0], v[1], 1.8, 0, 6.283); ctx.fill(); });
      if (fly > -0.02 && hit < .3) {
        var k = ease(Math.max(fly, 0)), tipX = -30 + CX * k, tipY = CY + 30 * (1 - k) * (1 - k) - 10 * (1 - k);
        var a2 = hit > 0 ? 1 - hit / .3 : 1;
        var tr = ctx.createLinearGradient(tipX - 190, 0, tipX, 0); tr.addColorStop(0, "rgba(" + MINT + ",0)"); tr.addColorStop(1, "rgba(" + MINT + "," + (.35 * a2) + ")");
        ctx.strokeStyle = tr; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(tipX - 190, tipY + 2); ctx.lineTo(tipX - 14, tipY); ctx.stroke();
        ctx.strokeStyle = "rgba(248,250,252," + a2 + ")"; ctx.lineWidth = 1.7;
        ctx.beginPath(); ctx.moveTo(tipX - 100, tipY); ctx.lineTo(tipX, tipY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(tipX, tipY); ctx.lineTo(tipX - 12, tipY - 5.5); ctx.lineTo(tipX - 12, tipY + 5.5); ctx.closePath(); ctx.fillStyle = "rgba(248,250,252," + a2 + ")"; ctx.fill();
        ctx.strokeStyle = "rgba(" + MINT + "," + a2 + ")"; ctx.lineWidth = 1.2;
        for (var f2 = 0; f2 < 3; f2++) { var fx = tipX - 100 + f2 * 6; ctx.beginPath(); ctx.moveTo(fx, tipY); ctx.lineTo(fx - 8, tipY - 7); ctx.moveTo(fx, tipY); ctx.lineTo(fx - 8, tipY + 7); ctx.stroke(); }
      }
      if (hit > 0 && hit < 1) { ctx.strokeStyle = "rgba(" + MINT + "," + ((1 - hit) * .7).toFixed(3) + ")"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(CX, CY, 12 + hit * 170, 0, 6.283); ctx.stroke(); }
    }
    function frame(now) {
      if (!running) return;
      if (t0 == null) t0 = now;
      var t = ((now - t0) / 1000) % CYCLE;
      if (now - last > 30) { draw(t); last = now; }
      raf = requestAnimationFrame(frame);
    }
    function start() { if (running || RM || frozen) return; running = true; raf = requestAnimationFrame(frame); }
    function stop() { running = false; cancelAnimationFrame(raf); }
    cv.__afFrame = function (t) { frozen = true; stop(); draw(t); }; /* deterministic frame, for screenshots */
    if (RM) { var still = function () { draw(4.2); }; still(); logo.onload = still; return; }
    draw(0);
    if (hasIO) new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? start() : stop(); }); }, { threshold: 0.15 }).observe(cv);
    else start();
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else if (!hasIO) start(); });
    cv.parentNode.addEventListener("click", function () { t0 = null; start(); });
  })();

  /* ---- live Vitessce portal, loaded only when it scrolls into view (desktop) or on tap (phones) ---- */
  var stage = document.getElementById("af-portal"), btn = document.getElementById("af-load");
  if (stage && btn) {
    var loaded = false;
    var load = function () {
      if (loaded) return; loaded = true;
      stage.classList.add("af-loading"); btn.lastChild.nodeValue = "Loading the live explorer…";
      var f = document.createElement("iframe");
      f.src = stage.getAttribute("data-src"); f.title = "Live Vitessce explorer: public glioblastoma Xenium sections, GEO GSE339006";
      f.loading = "lazy"; f.setAttribute("allow", "fullscreen");
      f.addEventListener("load", function () { setTimeout(function () { stage.classList.add("af-live"); }, 900); });
      stage.appendChild(f);
    };
    btn.addEventListener("click", load);
    var small = window.matchMedia && matchMedia("(max-width: 640px), (pointer: coarse)").matches;
    if (hasIO && !small) {
      var pio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { pio.disconnect(); load(); } }); }, { rootMargin: "200px 0px", threshold: 0.01 });
      pio.observe(stage);
    }
  }
}
  init();
  /* React may re-create this section's DOM on the client (it does on some phones after a
     hydration mismatch elsewhere on the page). Re-run init on the new nodes when that happens. */
  if ("MutationObserver" in window) {
    var mo = new MutationObserver(function () { var c = document.getElementById("af-hunt-canvas"); if (c && !c.__afInit) init(); });
    mo.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(function () { mo.disconnect(); }, 30000);
  }
})();
