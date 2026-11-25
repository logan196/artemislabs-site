// Portal loader particles: dots crystallise into the Artemis dodecahedron with the partner
// institution's logo held inside it. Light-ground variant of the hub landing (hub/site/assets/landing.js).
import * as THREE from "./three.module.min.js";

const PHI = (1 + Math.sqrt(5)) / 2;
function dodeca() {
  const v = [];
  for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) v.push([x, y, z]);
  for (const a of [-1, 1]) for (const b of [-1, 1]) { v.push([0, a / PHI, b * PHI]); v.push([a / PHI, b * PHI, 0]); v.push([a * PHI, 0, b / PHI]); }
  const d2 = (p, q) => (p[0]-q[0])**2 + (p[1]-q[1])**2 + (p[2]-q[2])**2;
  const E = 4 / (PHI * PHI) + 1e-6, edges = [];
  for (let i = 0; i < 20; i++) for (let j = i + 1; j < 20; j++) if (d2(v[i], v[j]) < E) edges.push([i, j]);
  const ic = [];
  for (const a of [-1, 1]) for (const b of [-1, 1]) { ic.push([0, a, b * PHI]); ic.push([a, b * PHI, 0]); ic.push([a * PHI, 0, b]); }
  const faces = ic.map(c => { const n = Math.hypot(...c); const u = c.map(x => x / n);
    const vs = v.map((p, i) => [i, p[0]*u[0] + p[1]*u[1] + p[2]*u[2]]).sort((a, b) => b[1] - a[1]).slice(0, 5).map(x => x[0]);
    return { n: u, vs }; });
  const s = 1 / Math.sqrt(3);
  return { v: v.map(p => p.map(x => x * s)), edges, faces };
}
function ang(p, c, n, ref) {
  const a = [ref[0]-c[0], ref[1]-c[1], ref[2]-c[2]], b = [p[0]-c[0], p[1]-c[1], p[2]-c[2]];
  const cr = [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
  return Math.atan2(cr[0]*n[0] + cr[1]*n[1] + cr[2]*n[2], a[0]*b[0] + a[1]*b[1] + a[2]*b[2]);
}
// Crystal on white: deep teal edges, pale sage faces (the colours of artemis_mark.svg).
function sampleDodeca(N) {
  const { v, edges, faces } = dodeca(), pts = [], col = [], c = new THREE.Color();
  const nEdge = Math.floor(N * .62), nFace = N - nEdge;
  const edgeCols = ["#0f766e", "#14b8a6", "#55808a", "#0d9488"], faceCols = ["#a9c4bd", "#c6d3cc", "#8fb3ad"];
  for (let i = 0; i < nEdge; i++) {
    const [a, b] = edges[i % edges.length], t = Math.random(), j = () => (Math.random() - .5) * .012;
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
  return { pts, col };
}
// Institution logo sampled from its own pixels and kept in its own colours, so it reads as theirs.
function sampleImage(img, N) {
  const W = 320, H = 320, cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const g = cv.getContext("2d", { willReadFrequently: true });
  const k = Math.min(W / img.naturalWidth, H / img.naturalHeight), w = img.naturalWidth * k, h = img.naturalHeight * k;
  g.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
  const d = g.getImageData(0, 0, W, H).data, on = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4; if (d[i + 3] > 140 && (d[i] + d[i + 1] + d[i + 2]) / 3 < 236) on.push(x, y, i);
  }
  if (on.length < 300) return null;
  const s = 2 / Math.max(w, h), pts = [], col = [], M = on.length / 3;
  for (let n = 0; n < N; n++) {
    const j = Math.floor(Math.random() * M) * 3, i = on[j + 2];
    pts.push((on[j] - W / 2 + Math.random() - .5) * s, -(on[j + 1] - H / 2 + Math.random() - .5) * s, (Math.random() - .5) * .03);
    col.push(d[i] / 255, d[i + 1] / 255, d[i + 2] / 255);
  }
  return { pts, col };
}

export function start(stage, opts = {}) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = stage.clientWidth < 420;
  const NA = small ? 3600 : 6000;
  const B = opts.img && opts.img.naturalWidth ? sampleImage(opts.img, small ? 3200 : 5200) : null;
  const NB = B ? B.pts.length / 3 : 0, N = NA + NB;
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0xffffff, 0);
  stage.prepend(renderer.domElement);
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, .1, 100);
  const A = sampleDodeca(NA);
  const home = new Float32Array(N * 3), from = new Float32Array(N * 3), pos = new Float32Array(N * 3), col = new Float32Array(N * 3), delay = new Float32Array(N), size = new Float32Array(N);
  home.set(A.pts, 0); col.set(A.col, 0);
  const LS = opts.logoScale || .5; // logo sits inside the crystal (inradius ~0.79 * SC)
  if (B) { for (let i = 0; i < B.pts.length; i++) home[NA * 3 + i] = B.pts[i] * LS; col.set(B.col, NA * 3); }
  const SC = 1.12;
  for (let i = 0; i < N; i++) {
    const r = 2.2 + Math.random() * 1.6, th = Math.random() * Math.PI * 2;
    from[i*3] = Math.cos(th) * r; from[i*3+1] = Math.sin(th) * r * .8; from[i*3+2] = (Math.random() - .5) * 2.4;
    delay[i] = Math.random() * .45 + (i >= NA ? .3 : 0);
    size[i] = i < NA ? (i < NA * .62 ? .95 + Math.random() * .45 : .6 + Math.random() * .35) : .9 + Math.random() * .4;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  geo.setAttribute("size", new THREE.BufferAttribute(size, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, vertexColors: true, blending: THREE.NormalBlending,
    uniforms: { uPx: { value: 1 }, uA: { value: 0 } },
    vertexShader: `attribute float size; varying vec3 vC; uniform float uPx;
      void main(){ vC = color; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv; gl_PointSize = size * uPx * (12.0 / -mv.z); }`,
    fragmentShader: `varying vec3 vC; uniform float uA;
      void main(){ vec2 p = gl_PointCoord - .5; float d = length(p); if (d > .5) discard; float core = smoothstep(.5, .1, d); gl_FragColor = vec4(vC, uA * core * .92);
      #include <colorspace_fragment>
      }`,
  });
  scene.add(new THREE.Points(geo, mat));
  const rot = new THREE.Euler(), q = new THREE.Quaternion(), v3 = new THREE.Vector3();
  let raf = 0, alive = true; const t0 = performance.now();
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false);
    cam.aspect = w / h; const need = 2.7, tf = Math.tan(cam.fov * Math.PI / 360);
    cam.position.set(0, 0, Math.max(need / 2 / tf, need / 2 / tf / cam.aspect)); cam.updateProjectionMatrix();
    mat.uniforms.uPx.value = renderer.getPixelRatio() * (h / 300);
  }
  const ro = new ResizeObserver(resize); ro.observe(stage); resize();
  const ease = t => t < 0 ? 0 : t > 1 ? 1 : 1 - Math.pow(1 - t, 4); // quart-out: quick gather, soft landing
  function frame(now) {
    if (!alive) return;
    const t = reduce ? 99 : (now - t0) / 1000;
    mat.uniforms.uA.value = Math.min(1, t * 2.2);
    rot.set(.42 + Math.sin(t * .6) * .05, .35 + t * .55, .08); q.setFromEuler(rot);
    for (let i = 0; i < N; i++) {
      const k = i * 3; let hx, hy, hz;
      if (i < NA) { v3.set(home[k] * SC, home[k+1] * SC, home[k+2] * SC).applyQuaternion(q); hx = v3.x; hy = v3.y; hz = v3.z; }
      else { hx = home[k]; hy = home[k+1]; hz = home[k+2] + .02; }
      const e = ease((t - delay[i]) / 1.25);
      pos[k] = from[k] + (hx - from[k]) * e; pos[k+1] = from[k+1] + (hy - from[k+1]) * e; pos[k+2] = from[k+2] + (hz - from[k+2]) * e;
    }
    geo.attributes.position.needsUpdate = true;
    renderer.render(scene, cam);
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  return { stop() { alive = false; cancelAnimationFrame(raf); ro.disconnect(); geo.dispose(); mat.dispose(); renderer.dispose(); renderer.forceContextLoss?.(); renderer.domElement.remove(); } };
}
