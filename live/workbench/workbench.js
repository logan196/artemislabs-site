(function () {
  "use strict";

  const PLASMA = [
    [13, 8, 135], [75, 3, 161], [125, 3, 168], [168, 34, 150],
    [203, 71, 119], [229, 107, 93], [248, 148, 64], [253, 195, 40], [240, 249, 33]
  ];

  function lerpColor(t) {
    t = Math.min(1, Math.max(0, t));
    const n = PLASMA.length - 1;
    const x = t * n;
    const i = Math.min(n - 1, Math.floor(x));
    const f = x - i;
    const a = PLASMA[i];
    const b = PLASMA[i + 1];
    return [
      a[0] + (b[0] - a[0]) * f,
      a[1] + (b[1] - a[1]) * f,
      a[2] + (b[2] - a[2]) * f
    ];
  }

  function hexToRgb(hex) {
    return [1, 3, 5].map((k) => parseInt(hex.slice(k, k + 2), 16));
  }

  function insidePoly(x, y, poly) {
    let odd = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1];
      const xj = poly[j][0], yj = poly[j][1];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi + 0.0) + xi) odd = !odd;
    }
    return odd;
  }

  function shortName(d) {
    return d.replace(/\s*\(cells\)\s*/g, "").replace("/smooth muscle", "");
  }

  const ICONS = {
    pan: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2.5a1.5 1.5 0 0 0-3 0V11H8.5A1.5 1.5 0 1 0 8.5 14H10v1.5a1.5 1.5 0 0 0 3 0V14h1.5a1.5 1.5 0 0 0 0-3H13V2.5Z"/></svg>',
    lasso: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.5 5.5c2.4-2 6.6-2 9.2.4 2.2 2.1 2.5 5.3.9 7.4-1.4 1.9-4 2.7-6.3 1.9l-.5 1.6c3.3 1.1 7.1-.1 9.1-2.8 2.4-3.1 2-7.6-1.1-10.5C15.4.3 9.7.2 6.3 3.1 3.4 5.5 2.6 9.6 4.2 13l1.5-.9C4.5 9.2 5.2 6.1 7.5 5.5Zm1.7 7.2c-.8.3-1.4 1-1.6 1.9-.2 1.2.4 2.3 1.5 2.8 1.6.7 3.4-.4 3.5-2.1.1-1.3-.8-2.4-2.1-2.6-.4 0-.9 0-1.3 0Z"/></svg>',
    reset: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5a7 7 0 1 1-6.3 4H8l-3.2 4.2L1.5 9h2.3A9 9 0 1 0 12 3v2Zm0 4.5a1.2 1.2 0 0 0-1.2 1.2V12a1.2 1.2 0 0 0 2.4 0v-1.3A1.2 1.2 0 0 0 12 9.5Z"/></svg>'
  };

  const state = {
    data: null,
    umapId: 1,
    colorBy: "SOX2",
    tool: { umap: "pan", spatial: "pan" },
    selected: null, // Uint8Array or null
    hover: -1,
    views: {
      umap: { scale: 1, tx: 0, ty: 0, fitted: false },
      spatial: { scale: 1, tx: 0, ty: 0, fitted: false }
    }
  };

  const els = {};
  const dprCap = 2;

  function $(sel) { return document.querySelector(sel); }

  function resizeCanvas(canvas) {
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const tw = Math.max(1, Math.round(w * dpr));
    const th = Math.max(1, Math.round(h * dpr));
    if (canvas.width !== tw || canvas.height !== th) {
      canvas.width = tw;
      canvas.height = th;
    }
    return { w, h, dpr };
  }

  function boundsOf(xs, ys) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < xs.length; i++) {
      const x = xs[i], y = ys[i];
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    return { minX, maxX, minY, maxY };
  }

  function fitView(name, xs, ys, w, h) {
    const b = boundsOf(xs, ys);
    const pad = 28;
    const bw = Math.max(1e-6, b.maxX - b.minX);
    const bh = Math.max(1e-6, b.maxY - b.minY);
    const scale = Math.min((w - pad * 2) / bw, (h - pad * 2) / bh);
    const tx = (w - scale * (b.minX + b.maxX)) / 2;
    const ty = (h - scale * (b.minY + b.maxY)) / 2;
    state.views[name] = { scale, tx, ty, fitted: true, minX: b.minX, maxX: b.maxX, minY: b.minY, maxY: b.maxY };
  }

  function toScreen(view, x, y, flipY) {
    const yy = flipY ? (view.minY + view.maxY - y) : y;
    return [view.tx + x * view.scale, view.ty + yy * view.scale];
  }

  function fromScreen(view, sx, sy, flipY) {
    const x = (sx - view.tx) / view.scale;
    const yy = (sy - view.ty) / view.scale;
    const y = flipY ? (view.minY + view.maxY - yy) : yy;
    return [x, y];
  }

  function dataFor(name) {
    const d = state.data;
    if (name === "spatial") return d.settings[0];
    return d.settings[state.umapId] || d.settings[1];
  }

  function vmaxFor(gene) {
    const vals = state.data.markers[gene];
    let m = 0;
    for (let i = 0; i < vals.length; i++) if (vals[i] > m) m = vals[i];
    return m || 1;
  }

  function colorOf(i) {
    const d = state.data;
    if (state.colorBy === "domain") return hexToRgb(d.palette[d.labels[i]]);
    const vmax = state._vmax || 1;
    return lerpColor(d.markers[state.colorBy][i] / vmax);
  }

  function drawPane(name) {
    const canvas = els[name];
    if (!canvas || !state.data) return;
    const { w, h, dpr } = resizeCanvas(canvas);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);

    const src = dataFor(name);
    const view = state.views[name];
    if (!view.fitted) fitView(name, src.x, src.y, w, h);
    const v = state.views[name];
    const n = state.data.n_shown;
    const sel = state.selected;
    const hasSel = !!sel;
    const base = Math.min(w, h);
    const radius = Math.max(1.45, Math.min(3.4, 2.05 * (base / 640) * Math.sqrt(Math.max(0.7, v.scale / ((base - 56) / Math.max(v.maxX - v.minX, v.maxY - v.minY, 1e-6))))));

    const order = state._order;
    for (let k = 0; k < n; k++) {
      const i = order[k];
      const [sx, sy] = toScreen(v, src.x[i], src.y[i], true);
      if (sx < -6 || sy < -6 || sx > w + 6 || sy > h + 6) continue;
      const rgb = colorOf(i);
      const dim = hasSel && !sel[i];
      const alpha = dim ? 0.09 : 0.92;
      ctx.beginPath();
      ctx.arc(sx, sy, radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(" + (rgb[0] | 0) + "," + (rgb[1] | 0) + "," + (rgb[2] | 0) + "," + alpha + ")";
      ctx.fill();
    }

    if (state.hover >= 0) {
      const i = state.hover;
      const [sx, sy] = toScreen(v, src.x[i], src.y[i], true);
      ctx.beginPath();
      ctx.arc(sx, sy, radius + 3, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,.9)";
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }

    const countEl = document.getElementById("count-" + name);
    if (countEl) {
      const total = n.toLocaleString("en-US");
      if (hasSel) {
        let c = 0;
        for (let i = 0; i < n; i++) if (sel[i]) c++;
        countEl.textContent = c.toLocaleString("en-US") + " of " + total + " cells";
      } else {
        countEl.textContent = total + " cells";
      }
    }
  }

  function drawAll() {
    drawPane("umap");
    drawPane("spatial");
    updateClear();
  }

  function updateLegend() {
    const show = state.colorBy !== "domain";
    document.querySelectorAll(".wb-legend").forEach((el) => {
      el.hidden = !show;
      if (show) {
        el.querySelector(".name").textContent = state.colorBy;
        el.querySelector(".hi span:last-child").textContent = (state._vmax || 0).toFixed(1);
      }
    });
  }

  function setColor(next) {
    state.colorBy = next;
    state._vmax = next === "domain" ? 1 : vmaxFor(next);
    document.querySelectorAll("[data-color]").forEach((btn) => {
      btn.classList.toggle("on", btn.getAttribute("data-color") === next);
    });
    // Recolor draw order: low expression first so hot points sit on top
    const n = state.data.n_shown;
    const order = new Array(n);
    for (let i = 0; i < n; i++) order[i] = i;
    if (next !== "domain") {
      const vals = state.data.markers[next];
      order.sort((a, b) => vals[a] - vals[b]);
    }
    state._order = order;
    updateLegend();
    drawAll();
  }

  function setTool(pane, tool) {
    state.tool[pane] = tool;
    const wrap = document.getElementById("pane-" + pane);
    wrap.classList.toggle("is-lasso", tool === "lasso");
    wrap.querySelectorAll(".wb-tool").forEach((btn) => {
      btn.classList.toggle("on", btn.getAttribute("data-tool") === tool);
    });
  }

  function updateClear() {
    const btn = document.getElementById("wb-clear");
    if (!btn) return;
    btn.hidden = !state.selected;
  }

  function clearSelection() {
    state.selected = null;
    drawAll();
  }

  function applyLasso(pane, poly) {
    if (!poly || poly.length < 3) return;
    const src = dataFor(pane);
    const view = state.views[pane];
    const n = state.data.n_shown;
    const sel = new Uint8Array(n);
    let any = 0;
    for (let i = 0; i < n; i++) {
      const [sx, sy] = toScreen(view, src.x[i], src.y[i], true);
      if (insidePoly(sx, sy, poly)) {
        sel[i] = 1;
        any++;
      }
    }
    state.selected = any ? sel : null;
    drawAll();
  }

  function hitTest(pane, sx, sy) {
    const src = dataFor(pane);
    const view = state.views[pane];
    const n = state.data.n_shown;
    let best = -1, bestD = 10;
    for (let i = 0; i < n; i++) {
      const [x, y] = toScreen(view, src.x[i], src.y[i], true);
      const d = (x - sx) * (x - sx) + (y - sy) * (y - sy);
      if (d < bestD * bestD) {
        bestD = Math.sqrt(d);
        best = i;
      }
    }
    return best;
  }

  function bindPane(name) {
    const canvas = els[name];
    const overlay = document.getElementById("lasso-" + name);
    const octx = overlay.getContext("2d");
    let drag = null;

    function syncOverlay() {
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (overlay.width !== Math.round(w * dpr) || overlay.height !== Math.round(h * dpr)) {
        overlay.width = Math.round(w * dpr);
        overlay.height = Math.round(h * dpr);
      }
      octx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w, h };
    }

    function drawLasso(poly, closed) {
      const { w, h } = syncOverlay();
      octx.clearRect(0, 0, w, h);
      if (!poly || poly.length < 2) return;
      octx.beginPath();
      octx.moveTo(poly[0][0], poly[0][1]);
      for (let i = 1; i < poly.length; i++) octx.lineTo(poly[i][0], poly[i][1]);
      if (closed) octx.closePath();
      octx.strokeStyle = "rgba(126,239,224,.95)";
      octx.lineWidth = 1.4;
      octx.stroke();
      octx.fillStyle = "rgba(126,239,224,.12)";
      if (closed || poly.length > 2) octx.fill();
    }

    canvas.addEventListener("pointerdown", (ev) => {
      ev.preventDefault();
      canvas.setPointerCapture(ev.pointerId);
      const rect = canvas.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      const tool = state.tool[name];
      if (tool === "reset") return;
      if (tool === "lasso") {
        drag = { kind: "lasso", poly: [[x, y]] };
        drawLasso(drag.poly, false);
      } else {
        drag = { kind: "pan", x, y, tx: state.views[name].tx, ty: state.views[name].ty };
      }
    });

    canvas.addEventListener("pointermove", (ev) => {
      const rect = canvas.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      if (!drag) {
        const i = hitTest(name, x, y);
        if (i !== state.hover) {
          state.hover = i;
          drawAll();
        }
        return;
      }
      if (drag.kind === "pan") {
        state.views[name].tx = drag.tx + (x - drag.x);
        state.views[name].ty = drag.ty + (y - drag.y);
        drawPane(name);
      } else if (drag.kind === "lasso") {
        const last = drag.poly[drag.poly.length - 1];
        if ((x - last[0]) * (x - last[0]) + (y - last[1]) * (y - last[1]) > 4) {
          drag.poly.push([x, y]);
          drawLasso(drag.poly, false);
        }
      }
    });

    function endDrag(ev) {
      if (!drag) return;
      if (drag.kind === "lasso") {
        applyLasso(name, drag.poly);
        const { w, h } = syncOverlay();
        octx.clearRect(0, 0, w, h);
      }
      drag = null;
    }
    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);
    canvas.addEventListener("pointerleave", () => {
      if (!drag && state.hover !== -1) {
        state.hover = -1;
        drawAll();
      }
    });

    canvas.addEventListener("wheel", (ev) => {
      ev.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      const v = state.views[name];
      const factor = ev.deltaY < 0 ? 1.12 : 1 / 1.12;
      const next = Math.max(0.4, Math.min(25, v.scale * factor));
      const k = next / v.scale;
      v.tx = x - (x - v.tx) * k;
      v.ty = y - (y - v.ty) * k;
      v.scale = next;
      drawPane(name);
    }, { passive: false });

    canvas.addEventListener("dblclick", () => {
      state.views[name].fitted = false;
      drawPane(name);
    });
  }

  function bindTools() {
    document.querySelectorAll(".wb-tool").forEach((btn) => {
      btn.addEventListener("click", () => {
        const pane = btn.getAttribute("data-pane");
        const tool = btn.getAttribute("data-tool");
        if (tool === "reset") {
          state.views[pane].fitted = false;
          drawPane(pane);
          return;
        }
        setTool(pane, tool);
      });
    });
    document.querySelectorAll("[data-color]").forEach((btn) => {
      btn.addEventListener("click", () => setColor(btn.getAttribute("data-color")));
    });
    const clear = document.getElementById("wb-clear");
    if (clear) clear.addEventListener("click", clearSelection);
    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape") clearSelection();
    });
  }

  function showError(msg) {
    const el = document.getElementById("wb-status");
    if (!el) return;
    el.classList.add("err");
    el.textContent = msg;
  }

  function hideStatus() {
    const el = document.getElementById("wb-status");
    if (el) el.remove();
  }

  async function init() {
    els.umap = document.getElementById("cv-umap");
    els.spatial = document.getElementById("cv-spatial");
    if (new URLSearchParams(location.search).has("embed")) {
      document.body.classList.add("embed");
    }
    bindTools();
    bindPane("umap");
    bindPane("spatial");
    setTool("umap", "pan");
    setTool("spatial", "pan");

    const dataUrl = document.body.getAttribute("data-payload") || "/plots/umap_params.json";
    let data;
    try {
      const res = await fetch(dataUrl);
      if (!res.ok) throw new Error("Could not load " + dataUrl);
      data = await res.json();
    } catch (err) {
      showError("The workbench data did not load. " + err.message);
      return;
    }
    state.data = data;
    state._order = Array.from({ length: data.n_shown }, (_, i) => i);
    hideStatus();
    setColor("SOX2");
    window.addEventListener("resize", () => {
      state.views.umap.fitted = false;
      state.views.spatial.fitted = false;
      drawAll();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
