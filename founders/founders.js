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

  /* ---- 1,400 real cells (GEO GSE339006, glioblastoma Xenium) flow from their tissue layout into a
     dodecahedron; orange cells converge into the Caltech wordmark at its centre; then back to tissue ---- */
  var cv = document.getElementById("af-hunt-canvas");
  if (cv && cv.getContext) (function () {
    var ctx = cv.getContext("2d"), W = 760, H = 400, dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = W * dpr; cv.height = H * dpr; ctx.scale(dpr, dpr);
    var ORANGE = [255, 108, 12]; /* Caltech orange #FF6C0C */
    var PAL = [[249,115,22],[100,116,139],[59,130,246],[139,92,246],[234,179,8],[20,184,166],[236,72,153],[244,63,94],[163,230,53],[239,68,68],[34,211,238],[251,191,36]];
    var CX = 380, CY = 200, RS = 132, TS = 236; /* solid radius, tissue half-width (px) */
    var N = 0, TX, TY, GX, GY, GZ, TYP, ROLE, DEL, SPR = {}, logo = null, frozen = false;
    var CYCLE = 11, t0 = null, running = false, raf = 0, last = 0, ready = false, pendingStill = false;
    function sprite(c) { /* soft glow dot, cached per colour, scaled at draw time */
      var k = c.join(); if (SPR[k]) return SPR[k];
      var s = document.createElement("canvas"), d = 32; s.width = s.height = d;
      var g = s.getContext("2d"), gr = g.createRadialGradient(d / 2, d / 2, 0, d / 2, d / 2, d / 2);
      gr.addColorStop(0, "rgba(" + c + ",.95)"); gr.addColorStop(.22, "rgba(" + c + ",.4)"); gr.addColorStop(1, "rgba(" + c + ",0)");
      g.fillStyle = gr; g.fillRect(0, 0, d, d); return (SPR[k] = s);
    }
    function mix(a, b, t) { return [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), Math.round(a[2] + (b[2] - a[2]) * t)]; }
    var MINT = [94, 234, 212];
    function colorFor(i, k) { /* k: 0 tissue colour .. 1 role colour, quantised so sprites stay cached */
      var base = PAL[TYP[i]] || MINT, role = ROLE[i], tgt = role === 3 ? ORANGE : mix(base, MINT, role === 2 ? .7 : .45);
      return mix(base, tgt, Math.round(k * 4) / 4);
    }
    function cl(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
    function smooth(x) { x = cl(x); return x * x * (3 - 2 * x); }
    fetch("founders/cells.bin").then(function (r) { return r.arrayBuffer(); }).then(function (buf) {
      N = buf.byteLength / 12;
      var q = new Int16Array(buf, 0, N * 5), u = new Uint8Array(buf, N * 10);
      TX = new Float32Array(N); TY = new Float32Array(N); GX = new Float32Array(N); GY = new Float32Array(N); GZ = new Float32Array(N); DEL = new Float32Array(N);
      for (var i = 0; i < N; i++) {
        TX[i] = q[2 * i] / 16000; TY[i] = q[2 * i + 1] / 16000;
        GX[i] = q[2 * N + 3 * i] / 16000; GY[i] = q[2 * N + 3 * i + 1] / 16000; GZ[i] = q[2 * N + 3 * i + 2] / 16000;
        DEL[i] = ((TX[i] + 1) * .5) * .55 + ((i * 2654435761) % 1000) / 1000 * .25; /* sweep left to right, with jitter */
      }
      TYP = u.subarray(0, N); ROLE = u.subarray(N, 2 * N); ready = true;
      if (pendingStill || RM) draw(5.5); else if (!running) draw(0);
    }).catch(function () {});
    var img = new Image(); img.src = "founders/caltech-wordmark.png";
    img.onload = function () { /* the wordmark recoloured to Caltech orange, shape untouched */
      var c = document.createElement("canvas"); c.width = img.naturalWidth; c.height = img.naturalHeight;
      var g = c.getContext("2d"); g.drawImage(img, 0, 0); g.globalCompositeOperation = "source-in"; g.fillStyle = "#FF6C0C"; g.fillRect(0, 0, c.width, c.height);
      logo = c; if (RM || frozen) draw(5.5);
    };
    var LW = 0.62 * 2 * RS, LH = LW * 110 / 450;
    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      if (!ready) return;
      /* phases: tissue 0-1.2, flow 1.2-3.8, solid 3.8-8.6, flow back 8.6-11 */
      var fwd = t < 8.6, rotA = t * .32, rotB = .42 + Math.sin(t * .23) * .18;
      var ca = Math.cos(rotA), sa = Math.sin(rotA), cb = Math.cos(rotB), sb = Math.sin(rotB);
      var logoOn = smooth((t - 4.1) / .9) * (1 - smooth((t - 8.2) / .6));
      /* halo */
      var form = fwd ? smooth((t - 1.6) / 2.2) : 1 - smooth((t - 8.6) / 2.0);
      var g = ctx.createRadialGradient(CX, CY, 8, CX, CY, 210);
      g.addColorStop(0, "rgba(20,184,166," + (.07 * form) + ")"); g.addColorStop(.5, "rgba(255,108,12," + (.03 * logoOn) + ")"); g.addColorStop(1, "rgba(20,184,166,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      for (var i = 0; i < N; i++) {
        var k = fwd ? smooth((t - 1.2 - DEL[i] * 1.2) / 1.4) : 1 - smooth((t - 8.6 - (1 - DEL[i]) * .8) / 1.4);
        /* target: rotate solid points; logo points stay facing the viewer */
        var gx = GX[i], gy = GY[i], gz = GZ[i], px, py, pz;
        if (ROLE[i] === 3) { px = gx; py = gy; pz = .6; }
        else { var x1 = gx * ca + gz * sa, z1 = -gx * sa + gz * ca; px = x1; py = gy * cb - z1 * sb; pz = gy * sb + z1 * cb; }
        var tx = TX[i] * TS, ty = TY[i] * TS + Math.sin(t * .6 + i) * .6;
        var sx = px * RS, sy = py * RS;
        /* curved path: bulge sideways mid-flight */
        var bend = Math.sin(k * Math.PI) * 26 * (((i * 7919) % 200) / 100 - 1);
        var x = CX + tx + (sx - tx) * k + bend, y = CY + ty + (sy - ty) * k - bend * .4;
        var depth = (pz + 1) / 2; /* 0 back .. 1 front */
        var role = ROLE[i], r, a;
        if (role === 3) { r = 1.15 + .25 * k; a = (.28 + .25 * k) * (1 - .6 * logoOn); }
        else { r = (1.05 + (role === 2 ? .75 : role === 1 ? .12 : 0) * k) * (1 + .3 * depth * k); a = (.55 + .2 * (1 - k)) * (k ? (.3 + .7 * depth) * (role === 0 ? .38 : role === 1 ? .7 : .95) : 1); }
        a *= 1 - .45 * Math.sin(k * Math.PI); /* thin the swarm mid-flight so additive light never clips to white */
        if (role !== 3 && logoOn && pz > -.1 && Math.abs(x - CX) < LW * .55 && Math.abs(y - CY) < LH * .7) a *= 1 - .55 * logoOn; /* keep the mark clear */
        ctx.globalAlpha = a > 1 ? 1 : a;
        var spr = sprite(colorFor(i, k));
        ctx.drawImage(spr, x - r * 2.2, y - r * 2.2, r * 4.4, r * 4.4);
      }
      ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
      if (logo && logoOn > 0) {
        ctx.save(); ctx.globalAlpha = .3 * logoOn; ctx.shadowColor = "rgba(255,108,12,.7)"; ctx.shadowBlur = 12; /* glow pass */
        ctx.drawImage(logo, CX - LW / 2, CY - LH / 2, LW, LH); ctx.restore();
        ctx.globalAlpha = logoOn; ctx.drawImage(logo, CX - LW / 2, CY - LH / 2, LW, LH); ctx.globalAlpha = 1; /* crisp pass */
      }
    }
    function frame(now) {
      if (!running) return;
      if (t0 == null) t0 = now;
      var t = ((now - t0) / 1000) % CYCLE;
      if (now - last > 24) { draw(t); last = now; } /* up to ~40fps */
      raf = requestAnimationFrame(frame);
    }
    function start() { if (running || RM || frozen) return; running = true; raf = requestAnimationFrame(frame); }
    function stop() { running = false; cancelAnimationFrame(raf); }
    cv.__afFrame = function (t) { frozen = true; stop(); pendingStill = true; draw(t); }; /* deterministic frame, for screenshots */
    if (RM) return; /* still frame drawn once the data and wordmark load */
    if (hasIO) new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? start() : stop(); }); }, { threshold: 0.15 }).observe(cv);
    else start();
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else if (!hasIO) start(); });
    cv.parentNode.addEventListener("click", function () { t0 = null; frozen = false; start(); });
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


/* --------------------------------------------------------------------
   USE CASES availability guard (deploy-time addition, Nov 25 2026).
   Links in #usecases are checked when pressed. If the destination does
   not answer, an "under construction" panel explains the state instead
   of dropping the visitor on an error page. Destinations are preserved:
   the panel always offers the original link so a restored portal is
   reachable without a code change.
-------------------------------------------------------------------- */
(function () {
  "use strict";

  var PENDING_ID = "uc-avail-pending";
  var PANEL_ID = "uc-avail-panel";

  function dismiss() {
    [PENDING_ID, PANEL_ID].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.remove();
    });
  }

  function toast(msg, id) {
    var t = document.createElement("div");
    t.id = id;
    t.setAttribute("role", "status");
    t.textContent = msg;
    t.style.cssText =
      "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:9999;" +
      "background:#101414;color:#e8f0ef;border:1px solid #2dd4bf55;border-radius:6px;" +
      "padding:10px 16px;font:13px/1.4 ui-monospace,monospace;box-shadow:0 8px 30px rgba(0,0,0,.5)";
    document.body.appendChild(t);
  }

  function showPanel(href) {
    dismiss();
    var wrap = document.createElement("div");
    wrap.id = PANEL_ID;
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");
    wrap.setAttribute("aria-label", "Under construction");
    wrap.style.cssText =
      "position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;" +
      "background:rgba(4,8,8,.72);backdrop-filter:blur(3px);padding:20px";
    var card = document.createElement("div");
    card.style.cssText =
      "max-width:440px;width:100%;background:#0d1112;border:1px solid #2dd4bf44;border-radius:10px;" +
      "padding:26px 26px 22px;color:#e8f0ef;font-family:inherit;box-shadow:0 20px 60px rgba(0,0,0,.6)";
    var h = document.createElement("p");
    h.style.cssText = "margin:0 0 4px;font:600 12px/1 ui-monospace,monospace;letter-spacing:.14em;color:#2dd4bf;text-transform:uppercase";
    h.textContent = "Under construction";
    var b = document.createElement("p");
    b.style.cssText = "margin:10px 0 0;font-size:15px;line-height:1.55;color:#c9d6d4";
    b.textContent = "This portal is temporarily unavailable. Please check back soon.";
    var dest = document.createElement("p");
    dest.style.cssText = "margin:14px 0 0;font:12px/1.5 ui-monospace,monospace;color:#7b8a88;word-break:break-all";
    dest.textContent = href;
    var row = document.createElement("div");
    row.style.cssText = "margin-top:20px;display:flex;gap:10px;flex-wrap:wrap";
    var go = document.createElement("a");
    go.href = href;
    go.textContent = "Open it anyway";
    go.style.cssText =
      "flex:1;text-align:center;padding:9px 14px;border-radius:6px;border:1px solid #2dd4bf;color:#2dd4bf;" +
      "font:500 13px/1.2 inherit;text-decoration:none";
    var close = document.createElement("button");
    close.type = "button";
    close.textContent = "Close";
    close.style.cssText =
      "padding:9px 16px;border-radius:6px;border:1px solid #33403e;background:transparent;color:#c9d6d4;" +
      "font:500 13px/1.2 inherit;cursor:pointer";
    close.addEventListener("click", dismiss);
    wrap.addEventListener("click", function (ev) { if (ev.target === wrap) dismiss(); });
    document.addEventListener("keydown", function onKey(ev) {
      if (ev.key === "Escape") { dismiss(); document.removeEventListener("keydown", onKey); }
    });
    row.appendChild(go);
    row.appendChild(close);
    card.appendChild(h);
    card.appendChild(b);
    card.appendChild(dest);
    card.appendChild(row);
    wrap.appendChild(card);
    document.body.appendChild(wrap);
    close.focus();
  }

  function checkAndGo(href) {
    dismiss();
    toast("Checking availability…", PENDING_ID);
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, 8000);
    fetch(href, { cache: "no-store", signal: ctrl.signal, headers: { Range: "bytes=0-0" } })
      .then(function (res) {
        clearTimeout(timer);
        if (res.ok || res.status === 206) { dismiss(); window.location.href = href; }
        else showPanel(href);
      })
      .catch(function () { clearTimeout(timer); showPanel(href); });
  }

  document.addEventListener("click", function (ev) {
    if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    var a = ev.target && ev.target.closest ? ev.target.closest('#usecases a[href]') : null;
    if (!a) return;
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#" || /^(mailto:|tel:)/i.test(href)) return;
    ev.preventDefault();
    checkAndGo(href);
  }, true);
})();
