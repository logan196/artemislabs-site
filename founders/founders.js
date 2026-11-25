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

  /* ---- the hunt: arrow strikes a wireframe dodecahedron, it shatters into data, re-forms ---- */
  var cv = document.getElementById("af-hunt-canvas");
  if (cv && cv.getContext) (function () {
    var ctx = cv.getContext("2d"), W = 560, H = 300, dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = W * dpr; cv.height = H * dpr; ctx.scale(dpr, dpr);
    var p = (1 + Math.sqrt(5)) / 2, q = 1 / p, V = [];
    [-1, 1].forEach(function (a) { [-1, 1].forEach(function (b) { [-1, 1].forEach(function (c) { V.push([a, b, c]); }); }); });
    [-1, 1].forEach(function (a) { [-1, 1].forEach(function (b) { V.push([0, a * q, b * p]); V.push([a * q, b * p, 0]); V.push([a * p, 0, b * q]); }); });
    var E = [], d2 = 4 * q * q;
    for (var i = 0; i < V.length; i++) for (var j = i + 1; j < V.length; j++) {
      var dx = V[i][0] - V[j][0], dy = V[i][1] - V[j][1], dz = V[i][2] - V[j][2];
      if (Math.abs(dx * dx + dy * dy + dz * dz - d2) < 1e-6) E.push([i, j]);
    }
    var CX = 380, CY = 146, R = 92, MINT = "94,234,212", TEAL = "20,184,166";
    function rot(v, a, b) {
      var x = v[0], y = v[1], z = v[2], ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
      var x1 = x * ca + z * sa, z1 = -x * sa + z * ca, y1 = y * cb - z1 * sb, z2 = y * sb + z1 * cb;
      return [CX + x1 * R / 1.8, CY + y1 * R / 1.8, z2];
    }
    /* shards: each edge splits into two halves with their own drift and spin */
    var rnd = (function (s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })(7);
    var S = [];
    E.forEach(function (e) { for (var h = 0; h < 2; h++) S.push({ e: e, h: h, vx: (rnd() - .35) * 210, vy: (rnd() - .5) * 190, sp: (rnd() - .5) * 7 }); });
    var D = []; for (i = 0; i < 70; i++) D.push({ a: rnd() * 6.283, r: 18 + rnd() * 110, s: .6 + rnd() * 1.6, t: rnd() });
    var CYCLE = 8.2, t0 = null, running = false, raf = 0, last = 0;
    function ease(x) { return x < 0 ? 0 : x > 1 ? 1 : 1 - Math.pow(1 - x, 3); }
    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      var a = t * .45, b = .5 + Math.sin(t * .3) * .25;
      var P = V.map(function (v) { return rot(v, a, b); });
      var build = ease(t / 1.3), fly = (t - 1.25) / .75, hit = t - 2.0, back = ease((t - 6.0) / 1.6);
      var burst = hit > 0 ? ease(Math.min(hit / 2.4, 1)) * (1 - back) : 0;
      /* glow halo */
      var g = ctx.createRadialGradient(CX, CY, 4, CX, CY, 120);
      g.addColorStop(0, "rgba(" + TEAL + "," + (0.16 + (hit > 0 && hit < .5 ? (.5 - hit) : 0)) + ")"); g.addColorStop(1, "rgba(" + TEAL + ",0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      /* edges or shards */
      ctx.lineCap = "round";
      S.forEach(function (s) {
        var A = P[s.e[0]], B = P[s.e[1]], m = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
        var p0 = s.h ? m : [A[0], A[1]], p1 = s.h ? [B[0], B[1]] : m;
        var depth = (A[2] + B[2]) / 2, al = (.35 + .45 * (depth + 1.8) / 3.6) * (burst > 0 ? 1 - burst * .75 : 1);
        if (t < 1.3) { /* draw-in */ var f = Math.max(0, Math.min(1, build * 1.6 - (s.e[0] % 7) * .07)); p1 = [p0[0] + (p1[0] - p0[0]) * f, p0[1] + (p1[1] - p0[1]) * f]; }
        if (burst > 0) {
          var c = [(p0[0] + p1[0]) / 2 + s.vx * burst, (p0[1] + p1[1]) / 2 + s.vy * burst], ang = s.sp * burst, hx = (p1[0] - p0[0]) / 2, hy = (p1[1] - p0[1]) / 2;
          var ca = Math.cos(ang), sa = Math.sin(ang), rx = hx * ca - hy * sa, ry = hx * sa + hy * ca;
          p0 = [c[0] - rx, c[1] - ry]; p1 = [c[0] + rx, c[1] + ry];
        }
        ctx.strokeStyle = "rgba(" + MINT + "," + al.toFixed(3) + ")"; ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke();
      });
      if (!burst) P.forEach(function (v) { ctx.fillStyle = "rgba(" + MINT + "," + (.4 + .5 * (v[2] + 1.8) / 3.6).toFixed(3) + ")"; ctx.beginPath(); ctx.arc(v[0], v[1], 1.6, 0, 6.283); ctx.fill(); });
      /* data points released by the strike */
      if (burst > 0) D.forEach(function (d) {
        var r = d.r * burst, x = CX + Math.cos(d.a + burst * .6) * r * 1.25, y = CY + Math.sin(d.a + burst * .6) * r * .62;
        ctx.fillStyle = "rgba(" + (d.t > .82 ? "245,158,11" : MINT) + "," + (burst * .85).toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(x, y, d.s, 0, 6.283); ctx.fill();
      });
      /* the arrow */
      if (fly > -0.05 && hit < .35) {
        var k = ease(Math.min(Math.max(fly, 0), 1)), tipX = -40 + (CX - 6 + 40) * k, tipY = CY + 26 * (1 - k) * (1 - k) - 8 * (1 - k);
        var al2 = hit > 0 ? 1 - hit / .35 : 1;
        var tr = ctx.createLinearGradient(tipX - 170, 0, tipX, 0); tr.addColorStop(0, "rgba(" + MINT + ",0)"); tr.addColorStop(1, "rgba(" + MINT + "," + (.35 * al2) + ")");
        ctx.strokeStyle = tr; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(tipX - 170, tipY + 2); ctx.lineTo(tipX - 14, tipY); ctx.stroke();
        ctx.strokeStyle = "rgba(248,250,252," + al2 + ")"; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(tipX - 92, tipY); ctx.lineTo(tipX, tipY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(tipX, tipY); ctx.lineTo(tipX - 11, tipY - 5); ctx.lineTo(tipX - 11, tipY + 5); ctx.closePath(); ctx.fillStyle = "rgba(248,250,252," + al2 + ")"; ctx.fill();
        ctx.strokeStyle = "rgba(" + MINT + "," + al2 + ")"; ctx.lineWidth = 1.2;
        for (var f2 = 0; f2 < 3; f2++) { var fx = tipX - 92 + f2 * 6; ctx.beginPath(); ctx.moveTo(fx, tipY); ctx.lineTo(fx - 8, tipY - 7); ctx.moveTo(fx, tipY); ctx.lineTo(fx - 8, tipY + 7); ctx.stroke(); }
      }
      /* impact ring */
      if (hit > 0 && hit < .9) { ctx.strokeStyle = "rgba(" + MINT + "," + (1 - hit / .9) * .8 + ")"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(CX, CY, 10 + hit * 150, 0, 6.283); ctx.stroke(); }
    }
    function frame(now) {
      if (!running) return;
      if (t0 == null) t0 = now;
      var t = ((now - t0) / 1000) % CYCLE;
      if (now - last > 30) { draw(t); last = now; } /* ~30fps is plenty and kind to phones */
      raf = requestAnimationFrame(frame);
    }
    function start() { if (running || RM) return; running = true; raf = requestAnimationFrame(frame); }
    function stop() { running = false; cancelAnimationFrame(raf); }
    if (RM) { draw(1.3); return; } /* static, assembled polyhedron */
    draw(0);
    if (hasIO) new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? start() : stop(); }); }, { threshold: 0.15 }).observe(cv);
    else start();
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : (hasIO ? 0 : start()); });
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
