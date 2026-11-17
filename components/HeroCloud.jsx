"use client";

// Hero background: a real 3D UMAP point cloud (Allen Brain Cell Atlas MERFISH
// subsample, embedded by Artemis) rendered with raw WebGL2. Points drift between
// three states — diffuse noise, the 3D UMAP manifold, and each cell's measured
// position in the brain. Additive glow on a deep ground, slow orbiting camera.
// Lazy-loads its ~1.8 MB asset, caps DPR, pauses offscreen / hidden tab, and
// falls back to a static poster for reduced motion, no WebGL2, or small screens.
import { useEffect, useRef, useState } from "react";

const VS = `#version 300 es
precision highp float;
in vec3 a_umap; in vec3 a_tis; in vec3 a_col; in float a_seed;
uniform float u_t, u_mUmap, u_mTis, u_rot, u_tilt, u_size, u_aspect, u_shift;
out vec3 v_col; out float v_a;
vec3 hash3(float s){ return fract(sin(vec3(s*12.9898, s*78.233, s*37.719))*43758.5453)*2.0-1.0; }
void main(){
  vec3 noise = normalize(hash3(a_seed)+1e-4) * (0.55 + 0.6*fract(a_seed*7.13)) * 1.35;
  // staggered morph: each point leaves on its own beat, so the cloud flows
  float d = fract(a_seed*3.7)*0.35;
  float mu = smoothstep(d, d+0.65, u_mUmap);
  float mt = smoothstep(d, d+0.65, u_mTis);
  vec3 p = mix(noise, a_umap, mu);
  p = mix(p, a_tis, mt);
  // gentle living drift
  float w = u_t*0.35 + a_seed*6.283;
  p += 0.012*vec3(sin(w), cos(w*1.3), sin(w*0.7));
  // orbit camera
  float c = cos(u_rot), s = sin(u_rot);
  p = vec3(c*p.x + s*p.z, p.y, -s*p.x + c*p.z);
  float ct = cos(u_tilt), st = sin(u_tilt);
  p = vec3(p.x, ct*p.y - st*p.z, st*p.y + ct*p.z);
  float z = p.z + 2.9;
  gl_Position = vec4(p.x*2.0/(z*u_aspect) + u_shift, p.y*2.0/z, 0.0, 1.0);
  gl_PointSize = u_size * (2.9/z);
  v_col = a_col;
  v_a = 0.45 + 0.55*smoothstep(4.0, 2.0, z);
}`;
const FS = `#version 300 es
precision mediump float;
in vec3 v_col; in float v_a; out vec4 o;
uniform float u_gain;
void main(){
  vec2 q = gl_PointCoord*2.0-1.0; float r2 = dot(q,q);
  if (r2 > 1.0) discard;
  float g = exp(-r2*3.2);
  o = vec4(v_col * g * u_gain * v_a, 1.0);
}`;

function compile(gl, type, src) {
  const sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
  return sh;
}

// timeline (seconds): noise -> UMAP -> tissue -> UMAP, looping
const CYCLE = 30;
function phase(t) {
  const k = t % CYCLE;
  const ease = (x) => x * x * (3 - 2 * x);
  const ramp = (a, b) => ease(Math.min(1, Math.max(0, (k - a) / (b - a))));
  const first = t < CYCLE; // only the very first pass starts from noise
  const mUmap = first ? ramp(0.3, 4.5) : 1;
  const mTis = ramp(13, 17) * (1 - ramp(24, 28));
  const label = mTis > 0.5 ? "tissue" : mUmap > 0.5 ? "umap" : "noise";
  return { mUmap, mTis, label };
}

export default function HeroCloud({ onState }) {
  const canvasRef = useRef(null);
  const [mode, setMode] = useState("pending"); // pending | live | poster

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 768;
    const lowPower = (navigator.hardwareConcurrency || 8) <= 2 || navigator.connection?.saveData;
    const canvas = canvasRef.current;
    const gl = !reduced && !small && !lowPower && canvas?.getContext("webgl2", { antialias: false, alpha: true, premultipliedAlpha: false });
    if (!gl) { setMode("poster"); return; }

    let raf = 0, visible = true, disposed = false, t0 = performance.now(), last = t0, clock = 0, N = 0;
    let prog, uni = {};
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
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

    function loop() {
      raf = 0;
      if (disposed || !visible || document.hidden) return;
      const now = performance.now(); clock += Math.min(0.05, (now - last) / 1000); last = now;
      const ph = phase(clock);
      onState?.(ph.label);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uni.u_t, clock);
      gl.uniform1f(uni.u_mUmap, ph.mUmap);
      gl.uniform1f(uni.u_mTis, ph.mTis);
      gl.uniform1f(uni.u_rot, clock * 0.06 + 0.6);
      gl.uniform1f(uni.u_tilt, 0.28 + 0.08 * Math.sin(clock * 0.05));
      gl.uniform1f(uni.u_size, 2.3 * dpr);
      gl.uniform1f(uni.u_aspect, canvas.width / canvas.height);
      gl.uniform1f(uni.u_gain, 0.30);
      gl.uniform1f(uni.u_shift, canvas.width > canvas.height * 1.2 ? 0.32 : 0.0);
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
        N = meta.n;
        const i16 = new Int16Array(buf, 0, N * 6);
        const u8 = new Uint8Array(buf, N * 12, N * 3);
        const umap = new Float32Array(N * 3), tis = new Float32Array(N * 3), col = new Float32Array(N * 3), seed = new Float32Array(N);
        for (let i = 0; i < N; i++) {
          for (let c = 0; c < 3; c++) {
            umap[i * 3 + c] = (i16[i * 6 + c] / 32767) * 1.25;
            tis[i * 3 + c] = i16[i * 6 + 3 + c] / 32767;
            col[i * 3 + c] = u8[i * 3 + c] / 255;
          }
          seed[i] = (i * 0.61803398875) % 1 + i * 1e-6;
        }
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
        ["u_t", "u_mUmap", "u_mTis", "u_rot", "u_tilt", "u_size", "u_aspect", "u_gain", "u_shift"].forEach((u) => (uni[u] = gl.getUniformLocation(prog, u)));
        gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE); // additive glow
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
