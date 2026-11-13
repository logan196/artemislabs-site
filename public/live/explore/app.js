/* Artemis Explore — vanilla JS spatial tissue viewer.
   Data: de Jong et al., Nature 2026 (gbmspace.org). All numbers shown in the
   agent pane are precomputed at export time from the run itself. */
"use strict";

(() => {
  const $ = (id) => document.getElementById(id);
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const S = {
    data: null, W: 0, H: 0,
    heImg: null, statesImg: null,
    layers: new Map(),          // name -> layer record
    heOn: true, statesOn: false, split: true,
    active: null,               // active marker name (range slider shown)
    cam: { k: 1, tx: 0, ty: 0 },
    needsRender: true,
    defaultsOn: ["GFAP", "EGFR", "CD68"],
  };

  const panes = {
    L: { el: $("paneL"), canvas: $("paneL").querySelector("canvas"), ctx: null },
    R: { el: $("paneR"), canvas: $("paneR").querySelector("canvas"), ctx: null },
  };
  for (const p of Object.values(panes)) p.ctx = p.canvas.getContext("2d");

  /* ---------------- loading ---------------- */
  const loadImg = (src) => new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => rej(new Error("failed to load " + src));
    im.src = src;
  });

  async function boot() {
    const data = await (await fetch("data.json")).json();
    S.data = data; S.W = data.width; S.H = data.height;
    $("sampleId").textContent = data.sample;
    $("sampleSub").textContent = data.subtitle;
    $("citation").innerHTML =
      `Data: ${data.citation.replace("·", "·")} — ${data.n_spots.toLocaleString()} spots, ` +
      `${data.states.n_dominant_states} dominant cell states. Viewer: Artemis BioLabs.`;

    const [he, st, ...marks] = await Promise.all([
      loadImg(data.he), loadImg(data.states.file),
      ...data.markers.map((m) => loadImg(m.file)),
    ]);
    S.heImg = he; S.statesImg = st;
    data.markers.forEach((meta, i) => {
      S.layers.set(meta.name, {
        meta, img: marks[i], alpha: null, canvas: null,
        lo: 0, hi: meta.p99, enabled: S.defaultsOn.includes(meta.name),
      });
    });
    S.active = S.defaultsOn[0] || data.markers[0].name;

    buildMarkerRows();
    buildStates();
    wireUI();
    for (const L of S.layers.values()) if (L.enabled) rebuildTint(L);
    syncUI();
    resizeAll(true);
    requestAnimationFrame(frame);
  }

  /* ---------------- layer tinting ---------------- */
  function hexRGB(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function ensureAlpha(L) {
    if (L.alpha) return;
    const c = document.createElement("canvas");
    c.width = S.W; c.height = S.H;
    const x = c.getContext("2d", { willReadFrequently: true });
    x.drawImage(L.img, 0, 0);
    const d = x.getImageData(0, 0, S.W, S.H).data;
    const a = new Uint8ClampedArray(S.W * S.H);
    for (let i = 0; i < a.length; i++) a[i] = d[i * 4 + 3];
    L.alpha = a;
  }

  function rebuildTint(L) {
    ensureAlpha(L);
    if (!L.canvas) {
      L.canvas = document.createElement("canvas");
      L.canvas.width = S.W; L.canvas.height = S.H;
    }
    const id = new ImageData(S.W, S.H);
    const d = id.data, a = L.alpha;
    const [r, g, b] = hexRGB(L.meta.color);
    const lo = L.lo * 255, hi = Math.max(L.hi * 255, lo + 1);
    const inv = 255 / (hi - lo);
    for (let i = 0, j = 0; i < a.length; i++, j += 4) {
      d[j] = r; d[j + 1] = g; d[j + 2] = b;
      const v = (a[i] - lo) * inv;
      d[j + 3] = v < 0 ? 0 : v > 255 ? 255 : v;
    }
    L.canvas.getContext("2d").putImageData(id, 0, 0);
    S.needsRender = true;
  }

  /* ---------------- rendering ---------------- */
  function drawMarkers(ctx) {
    ctx.globalCompositeOperation = "lighter";
    for (const L of S.layers.values())
      if (L.enabled && L.canvas) ctx.drawImage(L.canvas, 0, 0);
    ctx.globalCompositeOperation = "source-over";
  }

  function renderPane(p, kind) {
    const { ctx, canvas } = p;
    const dpr = devicePixelRatio || 1;
    const { k, tx, ty } = S.cam;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(k * dpr, 0, 0, k * dpr, tx * dpr, ty * dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    if ((kind === "he" || kind === "both") && S.heOn) ctx.drawImage(S.heImg, 0, 0);
    if (kind === "markers" || kind === "both") drawMarkers(ctx);
    if (S.statesOn) {
      ctx.globalAlpha = 0.88;
      ctx.drawImage(S.statesImg, 0, 0);
      ctx.globalAlpha = 1;
    }
  }

  function frame() {
    if (S.needsRender) {
      S.needsRender = false;
      if (S.split) { renderPane(panes.L, "he"); renderPane(panes.R, "markers"); }
      else renderPane(panes.L, "both");
      updateScalebars();
    }
    requestAnimationFrame(frame);
  }

  /* ---------------- camera ---------------- */
  function fit() {
    const el = panes.L.el;
    const k = Math.min(el.clientWidth / S.W, el.clientHeight / S.H) * 0.98;
    S.cam.k = k;
    S.cam.tx = (el.clientWidth - S.W * k) / 2;
    S.cam.ty = (el.clientHeight - S.H * k) / 2;
    S.needsRender = true;
  }

  let lastPW = 0, lastPH = 0;
  function resizeAll(refit) {
    const dpr = devicePixelRatio || 1;
    for (const p of Object.values(panes)) {
      const w = p.el.clientWidth, h = p.el.clientHeight;
      if (w === 0 || h === 0) continue;
      if (p.canvas.width !== Math.round(w * dpr) || p.canvas.height !== Math.round(h * dpr)) {
        p.canvas.width = Math.round(w * dpr);
        p.canvas.height = Math.round(h * dpr);
      }
    }
    const pw = panes.L.el.clientWidth, ph = panes.L.el.clientHeight;
    if (refit || !lastPW) fit();
    else { // keep the image point at pane center fixed through resizes
      S.cam.tx += (pw - lastPW) / 2;
      S.cam.ty += (ph - lastPH) / 2;
    }
    lastPW = pw; lastPH = ph;
    S.needsRender = true;
  }

  function zoomAt(mx, my, factor) {
    const c = S.cam;
    const fitK = Math.min(panes.L.el.clientWidth / S.W, panes.L.el.clientHeight / S.H) * 0.98;
    const k2 = Math.min(Math.max(c.k * factor, fitK * 0.5), fitK * 60);
    c.tx = mx - (mx - c.tx) * (k2 / c.k);
    c.ty = my - (my - c.ty) * (k2 / c.k);
    c.k = k2;
    S.needsRender = true;
  }

  function wirePan(canvas) {
    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * 0.0016));
    }, { passive: false });
    let drag = null;
    canvas.addEventListener("pointerdown", (e) => {
      drag = { x: e.clientX, y: e.clientY };
      canvas.setPointerCapture(e.pointerId);
      canvas.classList.add("dragging");
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!drag) return;
      S.cam.tx += e.clientX - drag.x;
      S.cam.ty += e.clientY - drag.y;
      drag = { x: e.clientX, y: e.clientY };
      S.needsRender = true;
    });
    const end = (e) => { drag = null; canvas.classList.remove("dragging"); };
    canvas.addEventListener("pointerup", end);
    canvas.addEventListener("pointercancel", end);
    canvas.addEventListener("dblclick", (e) => {
      const r = canvas.getBoundingClientRect();
      zoomAt(e.clientX - r.left, e.clientY - r.top, 2);
    });
  }

  /* ---------------- scale bar ---------------- */
  const NICE_UM = [20, 50, 100, 200, 500, 1000, 2000, 5000];
  function updateScalebars() {
    const pxPerUm = S.cam.k / S.data.um_per_px;
    let um = NICE_UM[0];
    for (const n of NICE_UM) if (n * pxPerUm <= 170) um = n;
    const w = um * pxPerUm;
    const label = um >= 1000 ? `${um / 1000} mm` : `${um} µm`;
    document.querySelectorAll(".pane:not(.hidden) .scalebar").forEach((sb) => {
      sb.querySelector(".scalebar-line").style.width = `${w.toFixed(1)}px`;
      sb.querySelector(".scalebar-text").textContent = label;
    });
  }

  /* ---------------- sidebar: markers ---------------- */
  function buildMarkerRows() {
    const host = $("markerRows");
    for (const m of S.data.markers) {
      const row = document.createElement("div");
      row.className = "row";
      row.dataset.m = m.name;
      row.innerHTML =
        `<span class="chip" style="background:${m.color}"></span>` +
        `<span class="row-name">${m.name}</span>` +
        `<span class="row-role">${m.role}</span>` +
        `<input type="checkbox" aria-label="show ${m.name}"><span class="box"></span>`;
      const rangeWrap = document.createElement("div");
      rangeWrap.className = "range-wrap";
      rangeWrap.hidden = true;
      rangeWrap.style.setProperty("--chipc", m.color);
      rangeWrap.innerHTML =
        `<div class="range-head"><span>RANGE</span><span class="range-val"></span></div>` +
        `<div class="range-track-wrap"><div class="range-track"></div><div class="range-fill"></div>` +
        `<input type="range" class="r-lo" min="0" max="1" step="0.002">` +
        `<input type="range" class="r-hi" min="0" max="1" step="0.002"></div>`;
      host.appendChild(row); host.appendChild(rangeWrap);

      const L = S.layers.get(m.name);
      const box = row.querySelector(".box");
      const chk = row.querySelector("input");
      box.addEventListener("click", (e) => {
        e.stopPropagation();
        L.enabled = !L.enabled;
        if (L.enabled && !L.canvas) rebuildTint(L);
        S.needsRender = true;
        syncUI();
      });
      row.addEventListener("click", () => {
        S.active = m.name;
        if (!L.enabled) { L.enabled = true; if (!L.canvas) rebuildTint(L); }
        S.needsRender = true;
        syncUI();
      });

      const lo = rangeWrap.querySelector(".r-lo"), hi = rangeWrap.querySelector(".r-hi");
      let raf = 0;
      const onRange = (which) => {
        let a = +lo.value, b = +hi.value;
        if (which === "lo" && a > b - 0.01) { a = b - 0.01; lo.value = a; }
        if (which === "hi" && b < a + 0.01) { b = a + 0.01; hi.value = b; }
        L.lo = a; L.hi = b;
        updateRangeUI(m.name);
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => rebuildTint(L));
      };
      lo.addEventListener("input", () => onRange("lo"));
      hi.addEventListener("input", () => onRange("hi"));
    }
  }

  function updateRangeUI(name) {
    const L = S.layers.get(name);
    const wrap = document.querySelector(`.row[data-m="${name}"] + .range-wrap`);
    if (!wrap) return;
    wrap.querySelector(".r-lo").value = L.lo;
    wrap.querySelector(".r-hi").value = L.hi;
    wrap.querySelector(".range-val").textContent = `[${L.lo.toFixed(2)}, ${L.hi.toFixed(2)}]`;
    const fill = wrap.querySelector(".range-fill");
    fill.style.left = `${L.lo * 100}%`;
    fill.style.width = `${(L.hi - L.lo) * 100}%`;
  }

  function syncUI() {
    let on = S.heOn ? 1 : 0;
    document.querySelectorAll("#markerRows .row").forEach((row) => {
      const L = S.layers.get(row.dataset.m);
      row.querySelector("input").checked = L.enabled;
      row.classList.toggle("active", S.active === row.dataset.m);
      const wrap = row.nextElementSibling;
      wrap.hidden = S.active !== row.dataset.m;
      if (!wrap.hidden) updateRangeUI(row.dataset.m);
      if (L.enabled) on++;
    });
    $("chkHE").checked = S.heOn;
    $("chkStates").checked = S.statesOn;
    $("layerCount").textContent = `${on}/${1 + S.data.markers.length}`;
    $("btnSingle").classList.toggle("active", !S.split);
    $("btnSplit").classList.toggle("active", S.split);
    panes.R.el.classList.toggle("hidden", !S.split);
    $("labelL").textContent = S.split ? "H&E"
      : (S.heOn ? "H&E · MARKERS" : "MARKERS");
  }

  /* ---------------- sidebar: cell states ---------------- */
  function buildStates() {
    const st = S.data.states;
    $("statesNote").textContent = `${st.n_dominant_states} states`;
    $("statesMethod").textContent = st.method;
    const host = $("statesLegend");
    const rows = st.legend.concat([st.other]);
    for (const l of rows) {
      const div = document.createElement("div");
      div.className = "legend-row";
      div.innerHTML =
        `<span class="legend-chip" style="background:${l.color}"></span>` +
        `<span class="legend-label" title="${l.label}">${l.label}</span>` +
        `<span class="legend-n">${l.n.toLocaleString()} · ${(l.frac * 100).toFixed(1)}%</span>`;
      host.appendChild(div);
    }
  }

  function setStates(on, expand) {
    S.statesOn = on;
    if (expand !== undefined) {
      $("statesBody").hidden = !expand;
      $("statesToggle").setAttribute("aria-expanded", String(expand));
    }
    S.needsRender = true;
    syncUI();
  }

  /* ---------------- agent typewriter ---------------- */
  let typing = false;
  function annotate() {
    if (typing) return;
    const body = $("agentBody");
    const text = S.data.agent_script.join("\n");
    const triggerAt = text.indexOf("top cell states");
    if (REDUCED) {
      body.textContent = text;
      setStates(true, true);
      $("statesGroup").scrollIntoView({ block: "start" });
      body.scrollTop = body.scrollHeight;
      return;
    }
    typing = true;
    $("btnAnnotate").disabled = true;
    let i = 0, fired = false;
    body.textContent = "";
    const cursor = document.createElement("span");
    cursor.className = "cursor";
    const tick = () => {
      i = Math.min(i + 3, text.length);           // ~180 chars/s, deterministic text
      body.textContent = text.slice(0, i);
      body.appendChild(cursor);
      body.scrollTop = body.scrollHeight;
      if (!fired && triggerAt >= 0 && i >= triggerAt) {
        fired = true;
        setStates(true, true);                    // agent turns the overlay on
        $("statesGroup").scrollIntoView({ behavior: "smooth", block: "start" });
      }
      if (i < text.length) requestAnimationFrame(tick);
      else {
        cursor.remove();
        typing = false;
        $("btnAnnotate").disabled = false;
      }
    };
    requestAnimationFrame(tick);
  }

  /* ---------------- top bar actions ---------------- */
  function toast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("show"), 1800);
  }

  function screenshot() {
    const vis = S.split ? [["H&E", panes.L], ["MARKERS", panes.R]] : [[$("labelL").textContent, panes.L]];
    const w = vis.reduce((s, [, p]) => s + p.canvas.width, 0);
    const h = Math.max(...vis.map(([, p]) => p.canvas.height));
    const c = document.createElement("canvas");
    c.width = w; c.height = h + 28;
    const x = c.getContext("2d");
    x.fillStyle = "#000"; x.fillRect(0, 0, c.width, c.height);
    let ox = 0;
    x.font = "600 12px ui-monospace, monospace";
    for (const [label, p] of vis) {
      x.drawImage(p.canvas, ox, 0);
      x.fillStyle = "#cfcfd6";
      x.fillText(label, ox + 10, h + 18);
      ox += p.canvas.width;
    }
    x.fillStyle = "#8b8b95";
    x.textAlign = "right";
    x.fillText(`${S.data.sample} · ${S.data.citation}`, c.width - 10, h + 18);
    const a = document.createElement("a");
    a.download = `artemis-explore-${S.data.sample}.png`;
    a.href = c.toDataURL("image/png");
    a.click();
    toast("screenshot saved");
  }

  /* ---------------- wiring ---------------- */
  function wireUI() {
    wirePan(panes.L.canvas);
    wirePan(panes.R.canvas);
    new ResizeObserver(() => resizeAll(false)).observe(panes.L.el);

    $("btnSingle").addEventListener("click", () => { S.split = false; syncUI(); resizeAll(false); });
    $("btnSplit").addEventListener("click", () => { S.split = true; syncUI(); resizeAll(false); });
    $("btnShot").addEventListener("click", screenshot);
    $("btnShare").addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(location.href); toast("link copied"); }
      catch { toast(location.href); }
    });
    $("btnFull").addEventListener("click", () => {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen();
    });

    $("rowHE").addEventListener("click", (e) => {
      e.preventDefault();
      S.heOn = !S.heOn;
      S.needsRender = true;
      syncUI();
    });

    const statesBox = $("boxStates");
    statesBox.addEventListener("click", (e) => {
      e.stopPropagation();
      setStates(!S.statesOn);
    });
    $("statesToggle").addEventListener("click", () => {
      const open = $("statesBody").hidden;
      $("statesBody").hidden = !open;
      $("statesToggle").setAttribute("aria-expanded", String(open));
    });

    $("btnAnnotate").addEventListener("click", annotate);

    $("search").addEventListener("input", (e) => {
      const q = e.target.value.trim().toLowerCase();
      document.querySelectorAll("#markerRows .row").forEach((row) => {
        const hit = !q || row.dataset.m.toLowerCase().includes(q) ||
          row.querySelector(".row-role").textContent.toLowerCase().includes(q);
        row.classList.toggle("filtered", !hit);
        row.nextElementSibling.hidden = !hit || S.active !== row.dataset.m;
      });
    });

    addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT") return;
      if (e.key === "s") { S.split = !S.split; syncUI(); resizeAll(false); }
      if (e.key === "0" || e.key === "r") fit();
    });
    addEventListener("resize", () => resizeAll(false));
  }

  boot().catch((err) => {
    $("agentBody").textContent = "failed to load viewer data: " + err.message;
  });
})();
