// Particle canvas: dots crystallise into the Artemis dodecahedron (hub), or the dodecahedron
// plus the institution logo (report landing). Drag to rotate. Three.js r170, vendored.
import * as THREE from "../vendor/three.module.min.js";

const PHI = (1 + Math.sqrt(5)) / 2;
function dodeca() {
  const v = [];
  for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) v.push([x, y, z]);
  for (const a of [-1, 1]) for (const b of [-1, 1]) { v.push([0, a / PHI, b * PHI]); v.push([a / PHI, b * PHI, 0]); v.push([a * PHI, 0, b / PHI]); }
  const d2 = (p, q) => (p[0]-q[0])**2 + (p[1]-q[1])**2 + (p[2]-q[2])**2;
  const E = 4 / (PHI * PHI) + 1e-6, edges = [];
  for (let i = 0; i < 20; i++) for (let j = i + 1; j < 20; j++) if (d2(v[i], v[j]) < E) edges.push([i, j]);
  // faces: centers are normalized icosahedron vertices
  const ic = [];
  for (const a of [-1, 1]) for (const b of [-1, 1]) { ic.push([0, a, b * PHI]); ic.push([a, b * PHI, 0]); ic.push([a * PHI, 0, b]); }
  const faces = ic.map(c => { const n = Math.hypot(...c); const u = c.map(x => x / n);
    const vs = v.map((p, i) => [i, p[0]*u[0] + p[1]*u[1] + p[2]*u[2]]).sort((a, b) => b[1] - a[1]).slice(0, 5).map(x => x[0]);
    return { n: u, vs }; });
  const s = 1 / Math.sqrt(3);
  return { v: v.map(p => p.map(x => x * s)), edges, faces };
}

// Fable-style crystal: glowing cyan wireframe, faint faces, and a DNA helix inside.
function sampleDodeca(N, helix = 0) {
  const { v, edges, faces } = dodeca(), pts = [], col = [], c = new THREE.Color();
  const nEdge = Math.floor(N * (helix ? .58 : .55)), nHelix = Math.floor(N * helix), nFace = N - nEdge - nHelix;
  const edgeCols = ["#5eead4", "#2dd4bf", "#14b8a6", "#99f6e4"], faceCols = ["#123f3b", "#0f766e", "#1d4f4a"];
  for (let i = 0; i < nEdge; i++) {
    const [a, b] = edges[i % edges.length], t = Math.random(), j = () => (Math.random() - .5) * .014;
    pts.push(v[a][0] + (v[b][0]-v[a][0]) * t + j(), v[a][1] + (v[b][1]-v[a][1]) * t + j(), v[a][2] + (v[b][2]-v[a][2]) * t + j());
    c.set(edgeCols[(i * 7) % 4]); col.push(c.r, c.g, c.b);
  }
  for (let i = 0; i < nFace; i++) {
    const f = faces[i % 12], k = Math.floor(Math.random() * 5);
    const A = v[f.vs[0]]; const cen = [0, 1, 2].map(d => f.vs.reduce((s, q) => s + v[q][d], 0) / 5);
    const ord = f.vs.slice().sort((p, q) => ang(v[p], cen, f.n, A) - ang(v[q], cen, f.n, A));
    const P = v[ord[k]], Q = v[ord[(k + 1) % 5]];
    let r1 = Math.random(), r2 = Math.random(); if (r1 + r2 > 1) { r1 = 1 - r1; r2 = 1 - r2; }
    pts.push(...[0, 1, 2].map(d => cen[d] + (P[d]-cen[d]) * r1 + (Q[d]-cen[d]) * r2));
    c.set(faceCols[i % 3]); col.push(c.r, c.g, c.b);
  }
  const R = .2, Hh = .58, turns = 2.2;
  for (let i = 0; i < nHelix; i++) {
    const u = Math.random(), th = u * turns * Math.PI * 2, y = (u - .5) * 2 * Hh, kind = i % 5;
    if (kind < 2) { const ph = kind ? Math.PI : 0; pts.push(Math.cos(th + ph) * R, y, Math.sin(th + ph) * R); c.set(kind ? "#f0a6ca" : "#34d399"); }
    else { const s = Math.random() * 2 - 1, ts = Math.round(u * 26) / 26, th2 = ts * turns * Math.PI * 2; pts.push(Math.cos(th2) * R * s, (ts - .5) * 2 * Hh, Math.sin(th2) * R * s); c.set("#1f6f68"); }
    col.push(c.r, c.g, c.b);
  }
  return { pts, col };
}
function ang(p, c, n, ref) {
  const a = [ref[0]-c[0], ref[1]-c[1], ref[2]-c[2]], b = [p[0]-c[0], p[1]-c[1], p[2]-c[2]];
  const cr = [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
  return Math.atan2(cr[0]*n[0] + cr[1]*n[1] + cr[2]*n[2], a[0]*b[0] + a[1]*b[1] + a[2]*b[2]);
}

const BRAND = ["#5eead4", "#99f6e4", "#14b8a6", "#e6fffa", "#34d399"];
function sampleMark(text, N) {
  const W = 512, H = 512, cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const g = cv.getContext("2d"); let fs = 400;
  g.font = `400 ${fs}px "Instrument Serif", Georgia, serif`;
  const w = g.measureText(text).width; fs = Math.min(400, fs * (W * 0.92) / w);
  g.font = `400 ${fs}px "Instrument Serif", Georgia, serif`; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillStyle = "#000"; g.fillText(text, W / 2, H / 2 + fs * 0.04);
  const d = g.getImageData(0, 0, W, H).data, on = [];
  for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if (d[(y * W + x) * 4 + 3] > 128) on.push(x, y);
  let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
  for (let i = 0; i < on.length; i += 2) { minX = Math.min(minX, on[i]); maxX = Math.max(maxX, on[i]); minY = Math.min(minY, on[i+1]); maxY = Math.max(maxY, on[i+1]); }
  const s = 1.9 / Math.max(maxX - minX, maxY - minY, 1), cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  const pts = [], col = [], c = new THREE.Color(), M = on.length / 2;
  for (let i = 0; i < N; i++) {
    const k = Math.floor(Math.random() * M) * 2;
    pts.push((on[k] - cx + Math.random() * 2) * s, -(on[k+1] - cy + Math.random() * 2) * s, (Math.random() - .5) * .12);
    c.set(BRAND[i % 5]); col.push(c.r, c.g, c.b);
  }
  return { pts, col };
}

// Institution logo sampled from its pixels, recoloured into the brand range (no seal colours).
function sampleImage(img, N) {
  const W = 360, H = 360, cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const g = cv.getContext("2d", { willReadFrequently: true });
  const k = Math.min(W / img.naturalWidth, H / img.naturalHeight), w = img.naturalWidth * k, h = img.naturalHeight * k;
  g.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
  const d = g.getImageData(0, 0, W, H).data; let on = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4, a = d[i + 3], lum = (d[i] + d[i + 1] + d[i + 2]) / 3;
    if (a > 140 && lum < 236) on.push(x, y, lum);
  }
  if (on.length < 300) return null;
  // Seals and crests are mostly opaque: keep their darker strokes so the emblem keeps its structure.
  const ls = []; for (let j = 2; j < on.length; j += 3) ls.push(on[j]); ls.sort((a, b) => a - b);
  const pc = p => ls[Math.floor(p * (ls.length - 1))];
  if (pc(.9) - pc(.1) > 45 && on.length / 3 > W * H * .18) {
    const cut = pc(.45), keep = []; for (let j = 0; j < on.length; j += 3) if (on[j + 2] <= cut) keep.push(on[j], on[j + 1], on[j + 2]);
    if (keep.length > 900) on = keep;
  }
  const s = 2.1 / Math.max(w, h), cx = W / 2, cy = H / 2, pts = [], col = [], c = new THREE.Color(), lo = new THREE.Color("#0f766e"), hi = new THREE.Color("#c6d3cc"), M = on.length / 3;
  for (let n = 0; n < N; n++) {
    const j = Math.floor(Math.random() * M) * 3, x = on[j], y = on[j + 1], lum = on[j + 2] / 255;
    pts.push((x - cx + Math.random() - .5) * s, -(y - cy + Math.random() - .5) * s, (Math.random() - .5) * .08);
    c.copy(lo).lerp(hi, Math.min(1, (1 - lum) * .9 + Math.random() * .35)); col.push(c.r, c.g, c.b);
  }
  return { pts, col };
}

export function start(stage, opts = {}) {
  const hubMode = opts.mode !== "report";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = stage.clientWidth < 560;
  const NA = hubMode ? (small ? 5200 : 9000) : (small ? 2400 : 4200);
  const NB = hubMode ? 0 : (small ? 3000 : 5600);
  const ND = hubMode ? (small ? 900 : 1600) : 0; // ambient dust only in the hub variant
  const N = NA + NB + ND;
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  stage.prepend(renderer.domElement);
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, .1, 100);
  const A = sampleDodeca(NA, hubMode ? .22 : 0);
  const B = NB ? ((opts.img && opts.img.naturalWidth && sampleImage(opts.img, NB)) || sampleMark(opts.inst?.mark || "", NB)) : { pts: [], col: [] };
  const home = new Float32Array(N * 3), from = new Float32Array(N * 3), pos = new Float32Array(N * 3), col = new Float32Array(N * 3), delay = new Float32Array(N), size = new Float32Array(N);
  home.set(A.pts, 0); home.set(B.pts, NA * 3); col.set(A.col, 0); col.set(B.col, NA * 3);
  const OFF = hubMode ? 0 : 1.35, SC = hubMode ? 1.18 : .92, spanX = hubMode ? 2.4 : 3.6, spanY = hubMode ? 2.2 : 1.9;
  const dust = new THREE.Color();
  for (let i = 0; i < N; i++) {
    from[i*3] = (Math.random() * 2 - 1) * spanX; from[i*3+1] = (Math.random() * 2 - 1) * spanY; from[i*3+2] = (Math.random() - .5) * 2.4;
    delay[i] = Math.random() * .9 + (i >= NA && i < NA + NB ? .35 : 0);
    size[i] = hubMode ? (i < NA ? (i < NA * .58 ? 1.0 + Math.random() * .7 : .7 + Math.random() * .5) : .5 + Math.random() * .7) : (i < NA ? (i < NA * .55 ? .95 + Math.random() * .45 : .6 + Math.random() * .35) : .75 + Math.random() * .45);
    if (i >= NA + NB) { dust.set(i % 3 ? "#1f4d49" : "#2a6b64"); col[i*3] = dust.r; col[i*3+1] = dust.g; col[i*3+2] = dust.b; }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  geo.setAttribute("size", new THREE.BufferAttribute(size, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, vertexColors: true, blending: hubMode ? THREE.AdditiveBlending : THREE.NormalBlending,
    uniforms: { uPx: { value: 1 }, uA: { value: 0 } },
    vertexShader: `attribute float size; varying vec3 vC; uniform float uPx;
      void main(){ vC = color; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv; gl_PointSize = size * uPx * (12.0 / -mv.z); }`,
    fragmentShader: `varying vec3 vC; uniform float uA;
      void main(){ vec2 p = gl_PointCoord - .5; float d = length(p); if (d > .5) discard; float core = smoothstep(.5, .12, d); gl_FragColor = vec4(vC, uA * core * .9);
      #include <colorspace_fragment>
      }`,
  });
  const pts = new THREE.Points(geo, mat); scene.add(pts);
  const rot = new THREE.Euler(), q = new THREE.Quaternion(), v3 = new THREE.Vector3();
  let raf = 0, t0 = performance.now(), alive = true, last = t0;
  let yaw = 0, pitch = .38, vy = 0, vp = 0, drag = null;
  const down = e => { drag = { x: e.clientX, y: e.clientY }; stage.classList.add("used"); try { stage.setPointerCapture(e.pointerId); } catch {} };
  const move = e => { if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag = { x: e.clientX, y: e.clientY };
    vy = dx * .0065; vp = dy * .0045; yaw += vy; pitch = Math.max(-1.1, Math.min(1.1, pitch + vp)); };
  const up = () => { drag = null; };
  stage.addEventListener("pointerdown", down); stage.addEventListener("pointermove", move);
  stage.addEventListener("pointerup", up); stage.addEventListener("pointercancel", up);
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false);
    cam.aspect = w / h; const needW = hubMode ? 3.25 : 2 * OFF + 3.0, needH = hubMode ? 3.25 : 2.9, tf = Math.tan(cam.fov * Math.PI / 360);
    const dist = Math.max(needH / 2 / tf, needW / 2 / tf / cam.aspect);
    cam.position.set(0, hubMode ? -.04 : .06, dist); cam.updateProjectionMatrix();
    mat.uniforms.uPx.value = renderer.getPixelRatio() * (h / 380) * (small ? 1.25 : 1);
  }
  const ro = new ResizeObserver(resize); ro.observe(stage); resize();
  const ease = t => t < 0 ? 0 : t > 1 ? 1 : t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  function frame(now) {
    if (!alive) return;
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    const t = reduce ? 99 : (now - t0) / 1000;
    mat.uniforms.uA.value = Math.min(1, t * 1.1);
    if (!drag) { yaw += (reduce ? 0 : .22 * dt) + vy; vy *= .94; vp *= .9; pitch += (.38 + Math.sin(t * .2) * .08 - pitch) * .02; }
    rot.set(pitch, yaw, .08); q.setFromEuler(rot);
    for (let i = 0; i < N; i++) {
      const k = i * 3; let hx, hy, hz;
      if (i < NA) { v3.set(home[k] * SC, home[k+1] * SC, home[k+2] * SC).applyQuaternion(q); hx = v3.x - OFF; hy = v3.y; hz = v3.z; }
      else if (i < NA + NB) { hx = home[k] + OFF; hy = home[k+1] + Math.sin(t * 1.1 + i) * .005; hz = home[k+2]; }
      else { pos[k] = from[k] + Math.sin(t * .17 + i) * .06; pos[k+1] = from[k+1] + Math.cos(t * .13 + i * 1.7) * .05; pos[k+2] = from[k+2]; continue; }
      const e = ease((t - delay[i]) / 2.6);
      pos[k] = from[k] + (hx - from[k]) * e; pos[k+1] = from[k+1] + (hy - from[k+1]) * e; pos[k+2] = from[k+2] + (hz - from[k+2]) * e;
    }
    geo.attributes.position.needsUpdate = true;
    renderer.render(scene, cam);
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  const vis = () => { cancelAnimationFrame(raf); if (!document.hidden && alive) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  document.addEventListener("visibilitychange", vis);
  return { stop() { alive = false; cancelAnimationFrame(raf); ro.disconnect(); document.removeEventListener("visibilitychange", vis);
    stage.removeEventListener("pointerdown", down); stage.removeEventListener("pointermove", move); stage.removeEventListener("pointerup", up); stage.removeEventListener("pointercancel", up);
    geo.dispose(); mat.dispose(); renderer.dispose(); renderer.forceContextLoss?.(); renderer.domElement.remove(); } };
}
