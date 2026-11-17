"use client";

// Hero background: a real 3D UMAP point cloud (Allen Brain Cell Atlas MERFISH
// subsample, embedded by Artemis) rendered with raw WebGL2. Points drift between
// three states — diffuse noise, the 3D UMAP manifold, and each cell's measured
// position in the brain — with a slow spiral orbit, breathing, and cursor
// parallax. Additive glow, brighter cell-type colours. Pauses offscreen /
// hidden tab; static poster only for reduced motion or no WebGL2. Mobile runs
// a thinner subsample so the cloud stays alive on smaller GPUs.
import { useEffect, useRef, useState } from "react";

const VS = `#version 300 es
precision highp float;
in vec3 a_umap; in vec3 a_tis; in vec3 a_col; in float a_seed;
uniform float u_t, u_mUmap, u_mTis, u_rot, u_tilt, u_size, u_aspect, u_shift, u_parX, u_parY;
out vec3 v_col; out float v_a;
vec3 hash3(float s){ return fract(sin(vec3(s*12.9898, s*78.233, s*37.719))*43758.5453)*2.0-1.0; }
void main(){
  vec3 noise = normalize(hash3(a_seed)+1e-4) * (0.55 + 0.6*fract(a_seed*7.13)) * 1.35;
  float d = fract(a_seed*3.7)*0.28;
  float mu = smoothstep(d, d+0.55, u_mUmap);
  float mt = smoothstep(d, d+0.55, u_mTis);
  vec3 p = mix(noise, a_umap, mu);
  p = mix(p, a_tis, mt);
  // living drift
  float w = u_t*0.7 + a_seed*6.283;
  p += 0.032*vec3(sin(w), cos(w*1.27), sin(w*0.73));
  // breath — the cloud expands and contracts
  p *= 1.0 + 0.045*sin(u_t*0.85 + a_seed*3.1);
  // spiral swirl around Y, stronger in UMAP than in tissue
  float swirl = (1.0 - mt) * u_t * 0.22;
  float cs = cos(swirl), ss = sin(swirl);
  p = vec3(cs*p.x + ss*p.z, p.y, -ss*p.x + cs*p.z);
  // orbit camera + cursor / scroll parallax
  float rot = u_rot + u_parX;
  float c = cos(rot), s = sin(rot);
  p = vec3(c*p.x + s*p.z, p.y, -s*p.x + c*p.z);
  float tilt = u_tilt + u_parY;
  float ct = cos(tilt), st = sin(tilt);
  p = vec3(p.x, ct*p.y - st*p.z, st*p.y + ct*p.z);
  float z = p.z + 2.9;
  gl_Position = vec4(p.x*2.0/(z*u_aspect) + u_shift, p.y*2.0/z, 0.0, 1.0);
  gl_PointSize = u_size * (2.9/z);
  v_col = a_col;
  v_a = 0.55 + 0.45*smoothstep(4.0, 2.0, z);
}`;
const FS = `#version 300 es
precision mediump float;
in vec3 v_col; in float v_a; out vec4 o;
uniform float u_gain;
void main(){
  vec2 q = gl_PointCoord*2.0-1.0; float r2 = dot(q,q);
  if (r2 > 1.0) discard;
  float g = exp(-r2*2.6);
  o = vec4(v_col * g * u_gain * v_a, 1.0);
}`;

function compile(gl, type, src) {
  const sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
  return sh;
}

// Lift cell-type colours so they read on black: more saturation, a little more punch.
function liftColor(r, g, b) {
  const gray = 0.299 * r + 0.587 * g + 0.114 * b;
  const s = 1.55;
  r = Math.min(1, gray + (r - gray) * s);
  g = Math.min(1, gray + (g - gray) * s);
  b = Math.min(1, gray + (b - gray) * s);
  const boost = 1.22;
  return [Math.min(1, r * boost + 0.03), Math.min(1, g * boost + 0.03), Math.min(1, b * boost + 0.03)];
}

// timeline (seconds): noise -> UMAP -> tissue -> UMAP, looping.
// First UMAP arrival is quick so an 8s hero hold already shows a living manifold.
const CYCLE = 28;
function phase(t) {
  const k = t % CYCLE;
  const ease = (x) => x * x * (3 - 2 * x);
  const ramp = (a, b) => ease(Math.min(1, Math.max(0, (k - a) / (b - a))));
  const first = t < CYCLE;
  const mUmap = first ? ramp(0.15, 2.8) : 1;
  const mTis = ramp(11, 15) * (1 - ramp(21, 25));
  const label = mTis > 0.5 ? "tissue" : mUmap > 0.5 ? "umap" : "noise";
  return { mUmap, mTis, label };
}

export default function HeroCloud({ onState }) {
  const canvasRef = useRef(null);
  const [mode, setMode] = useState("pending"); // pending | live | poster

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current;
    if (reduced || !canvas) { setMode("poster"); return; }
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: true, premultipliedAlpha: false });
    if (!gl) { setMode("poster"); return; }

    const small = window.innerWidth < 768;
    const stride = small ? 3 : 1; // keep the cloud alive on phones with fewer points
    let raf = 0, visible = true, disposed = false, last = performance.now(), clock = 0, N = 0;
    let prog, uni = {};
    const par = { x: 0, y: 0, tx: 0, ty: 0, scroll: 0 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, small ? 1 : 1.5);
      const w = canvas.clientWidth, h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      return dpr;
    };
    let dpr = resize();
    const ro = new ResizeObserver(() => { dpr = resize(); }); ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf && N) loop(); });
    io.observe(canvas);
    const onVis = () => { if (!document.hidden && visible && !raf && N) loop(); };
    document.addEventListener("visibilitychange", onVis);

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      par.tx = ((e.clientX - r.left) / Math.max(1, r.width) - 0.5) * 0.28;
      par.ty = ((e.clientY - r.top) / Math.max(1, r.height) - 0.5) * 0.18;
    };
    const onScroll = () => {
      const r = canvas.getBoundingClientRect();
      const mid = r.top + r.height * 0.5;
      par.scroll = ((window.innerHeight * 0.5 - mid) / window.innerHeight) * 0.16;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    function loop() {
      raf = 0;
      if (disposed || !visible || document.hidden) return;
      const now = performance.now(); clock += Math.min(0.05, (now - last) / 1000); last = now;
      par.x += (par.tx - par.x) * 0.05;
      par.y += (par.ty - par.y) * 0.05;
      const ph = phase(clock);
      onState?.(ph.label);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uni.u_t, clock);
      gl.uniform1f(uni.u_mUmap, ph.mUmap);
      gl.uniform1f(uni.u_mTis, ph.mTis);
      gl.uniform1f(uni.u_rot, clock * 0.13 + 0.55);
      gl.uniform1f(uni.u_tilt, 0.30 + 0.10 * Math.sin(clock * 0.07));
      gl.uniform1f(uni.u_size, (small ? 2.4 : 3.0) * dpr);
      gl.uniform1f(uni.u_aspect, canvas.width / canvas.height);
      gl.uniform1f(uni.u_gain, 0.92 + 0.14 * Math.sin(clock * 0.9));
      gl.uniform1f(uni.u_shift, 0.0);
      gl.uniform1f(uni.u_parX, par.x);
      gl.uniform1f(uni.u_parY, par.y + par.scroll);
      gl.drawArrays(gl.POINTS, 0, N);
      raf = requestAnimationFrame(loop);
    }

    (async () => {
      try {
        const [meta, buf] = await Promise.all([
          fetch("hero/umap_meta.json").then((r) => r.json()),
          fetch("hero/umap_cloud.bin").then((r) => r.arrayBuffer()),
        ]);
        if (disposed) return;
        const nAll = meta.n;
        const count = Math.floor(nAll / stride);
        const i16 = new Int16Array(buf, 0, nAll * 6);
        const u8 = new Uint8Array(buf, nAll * 12, nAll * 3);
        const umap = new Float32Array(count * 3), tis = new Float32Array(count * 3), col = new Float32Array(count * 3), seed = new Float32Array(count);
        for (let j = 0; j < count; j++) {
          const i = j * stride;
          for (let c = 0; c < 3; c++) {
            umap[j * 3 + c] = (i16[i * 6 + c] / 32767) * 1.25;
            tis[j * 3 + c] = i16[i * 6 + 3 + c] / 32767;
          }
          const [r, g, b] = liftColor(u8[i * 3] / 255, u8[i * 3 + 1] / 255, u8[i * 3 + 2] / 255);
          col[j * 3] = r; col[j * 3 + 1] = g; col[j * 3 + 2] = b;
          seed[j] = (i * 0.61803398875) % 1 + i * 1e-6;
        }
        N = count;
        prog = gl.createProgram();
        gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VS));
        gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FS));
        gl.linkProgram(prog); gl.useProgram(prog);
        const attr = (name, data, size) => {
          const loc = gl.getAttribLocation(prog, name); const b = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
          gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
        };
        attr("a_umap", umap, 3); attr("a_tis", tis, 3); attr("a_col", col, 3); attr("a_seed", seed, 1);
        ["u_t", "u_mUmap", "u_mTis", "u_rot", "u_tilt", "u_size", "u_aspect", "u_gain", "u_shift", "u_parX", "u_parY"].forEach((u) => (uni[u] = gl.getUniformLocation(prog, u)));
        gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
        setMode("live");
        last = performance.now();
        loop();
      } catch (e) {
        setMode("poster");
      }
    })();

    return () => {
      disposed = true; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [onState]);

  return (
    <div className="absolute inset-0" aria-hidden>
      <img
        src="hero/umap_poster.jpg"
        alt=""
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${mode === "live" ? "opacity-0" : mode === "poster" ? "opacity-90 hero-poster" : "opacity-0"}`}
      />
      <canvas ref={canvasRef} className={`absolute inset-0 h-full w-full transition-opacity duration-[1600ms] ${mode === "live" ? "opacity-100" : "opacity-0"}`} />
    </div>
  );
}
