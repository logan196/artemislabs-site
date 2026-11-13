import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
import { EffectComposer } from './vendor/EffectComposer.js';
import { RenderPass } from './vendor/RenderPass.js';
import { UnrealBloomPass } from './vendor/UnrealBloomPass.js';

const Q = new URLSearchParams(location.search);
const FILM_V = Q.get('film');
const FILM = FILM_V === '1' || FILM_V === 'merfish';
const MAX_SHARDS = Q.get('shards') ? +Q.get('shards') : 99;
let SEEK = parseFloat(Q.get('t') || 'NaN');
window.__setT = (t)=>{
  SEEK = t;
  uniforms.u_progress.value = 0; uniforms.u_hlLevel.value = -1;
  camera.position.set(1.55,0.85,2.65); controls.target.set(0,0,0);
  uniAnim.length = 0; camPath = null; curScene = -1;
  for (const s of tl){
    if (s.t1 <= t){
      if (s.u){ if (s.u.progress!==undefined) uniforms.u_progress.value = s.u.progress;
        if (s.u.mode!==undefined) setMode(s.u.mode); if (s.u.gene!==undefined) setGene(s.u.gene); }
      if (s.dive){ camera.position.set(0.05,-0.45,1.05); controls.target.set(0,-0.35,0.1); }
      else if (s.back){ camera.position.set(1.55,0.85,2.65); controls.target.set(0,0,0); }
    }
  }
};
const GENES = ['Slc17a6','Slc32a1','Tac2','Slc6a5','Slc17a7','Slc17a8','Slc6a3','Slc6a4'];
const GENE_COLORS = {0:'#ff8a3d',1:'#3dd6ff',2:'#ff5e78',3:'#9d7bff',4:'#ff9e4d',5:'#ffb14d',6:'#ffc94d',7:'#ff4dd2'};
const MERFISH_COLORS = ['#ff8c1a','#ff2fd6','#b18cff','#41d9ff','#19e3ff','#7cff4f','#ffe135','#54ff9f'];
const PAL = { NT:0, CLASS:16, SUB:64, CL:512 };

const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({canvas, antialias:false, powerPreference:'high-performance'});
renderer.setClearColor(0x04060c, 1);
let pixelRatio = Math.min(devicePixelRatio || 1, 2);
renderer.setPixelRatio(pixelRatio);
renderer.setSize(innerWidth, innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(46, innerWidth/innerHeight, 0.01, 100);
camera.position.set(1.55, 0.85, 2.65);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.28, 0.4, 0.55);
composer.addPass(bloom);
let useBloom = !matchMedia('(max-width:640px)').matches && Q.get('nobloom') !== '1';

const uniforms = {
  u_palette:{value:null}, u_boundsMin:{value:new THREE.Vector3()}, u_boundsRange:{value:new THREE.Vector3(1,1,1)},
  u_center:{value:new THREE.Vector3()}, u_fit:{value:1},
  u_mode:{value:0}, u_gene:{value:6}, u_geneColor:{value:new THREE.Color(GENE_COLORS[6])},
  u_geneColors:{value: null},
  u_hlLevel:{value:-1}, u_hlId:{value:-1}, u_hlId2:{value:-1}, u_hlColor:{value:new THREE.Color(1.0,0.79,0.30)},
  u_progress:{value:0}, u_alpha:{value:1}, u_size:{value:2.0}, u_px:{value:pixelRatio},
  u_clipZ:{value:1.0}, u_dim:{value:0}, u_exposure:{value:1.0}, u_maxdot:{value: parseFloat(Q.get('maxdot')|| String(Math.min(42, Math.max(16, innerWidth/30))))},
};

const VERT = `
precision highp float;
attribute float a_class;   // u8
attribute float a_sub;     // u16
attribute float a_cl;      // u16
attribute float a_nt;      // u8
attribute vec4 a_geneA;    // normalized
attribute vec4 a_geneB;
uniform sampler2D u_palette;
uniform vec3 u_boundsMin, u_boundsRange, u_center;
uniform float u_fit, u_size, u_px, u_progress, u_alpha, u_clipZ, u_dim, u_exposure, u_maxdot;
uniform int u_mode, u_gene, u_hlLevel, u_hlId, u_hlId2;
uniform vec3 u_geneColor;
uniform vec3 u_geneColors[8];
uniform vec3 u_hlColor;
varying vec3 v_color;
varying float v_alpha;
float hash(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719)))*43758.5453); }
void main(){
  vec3 pn = position / 65535.0;                       // 0..1
  vec3 mm = u_boundsMin + pn * u_boundsRange;      // mm in CCF
  vec3 target = (mm - u_center) * u_fit;           // centered, fit units
  // intro scatter (deterministic per point)
  float h1 = hash(pn), h2 = hash(pn.yzx + 1.7), h3 = hash(pn.zxy + 4.2);
  vec3 dir = normalize(vec3(h1,h2,h3) * 2.0 - 1.0 + 0.001);
  float t = clamp((u_progress - h3 * 0.55) / 0.45, 0.0, 1.0);
  t = t*t*(3.0 - 2.0*t);
  vec3 pos = mix(dir * (1.7 + h2 * 1.6), target, t);
  // slice clip on normalized z
  float edge = u_clipZ;
  float sliceA = 1.0 - smoothstep(edge - 0.015, edge, pn.z);
  // color resolve
  int id = 0;
  if (u_mode == 0) id = ${PAL.NT} + int(a_nt + 0.5);
  else if (u_mode == 1) id = ${PAL.CLASS} + int(a_class + 0.5);
  else if (u_mode == 2) id = ${PAL.SUB} + int(a_sub + 0.5);
  else id = ${PAL.CL} + int(a_cl + 0.5);
  vec3 base = texelFetch(u_palette, ivec2(id, 0), 0).rgb;
  float a = 1.0;
  float sz = u_size;
  if (u_mode == 4) {
    float v = (u_gene < 4) ? a_geneA[u_gene] : a_geneB[u_gene - 4];
    base = mix(vec3(0.045,0.06,0.11), u_geneColor, pow(v, 0.55));
    a = 0.14 + 0.86 * v; sz = u_size * (0.6 + 2.4 * v);
  }
  else if (u_mode == 5) {
    float g0=a_geneA[0], g1=a_geneA[1], g2=a_geneA[2], g3=a_geneA[3];
    float g4=a_geneB[0], g5=a_geneB[1], g6=a_geneB[2], g7=a_geneB[3];
    float best = max(max(max(g0,g1),max(g2,g3)),max(max(g4,g5),max(g6,g7)));
    if (best <= 0.001) { base = vec3(0.030,0.040,0.075); a = 0.09; sz = u_size * 0.5; }
    else {
      vec3 gc;
      if (best == g4) gc = u_geneColors[4]; else if (best == g1) gc = u_geneColors[1];
      else if (best == g6) gc = u_geneColors[6]; else if (best == g0) gc = u_geneColors[0];
      else if (best == g7) gc = u_geneColors[7]; else if (best == g5) gc = u_geneColors[5];
      else if (best == g2) gc = u_geneColors[2]; else gc = u_geneColors[3];
      base = gc * (0.25 + 0.75 * pow(best, 0.5));
      a = 0.22 + 0.78 * best; sz = u_size * (0.7 + 2.6 * best);
    }
  }
  if (u_hlLevel >= 0) {
    int hid = u_hlLevel == 0 ? int(a_nt+0.5) : u_hlLevel == 1 ? int(a_class+0.5) : u_hlLevel == 2 ? int(a_sub+0.5) : int(a_cl+0.5);
    if (hid == u_hlId || hid == u_hlId2) { base = u_hlColor; a = 1.0; sz = u_size * 2.2; }
    else { a = 0.10; }
  }
  v_color = base;
  v_alpha = a * sliceA * u_alpha * (0.25 + 0.75 * t) * (1.0 - u_dim);
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp(sz * u_px * (2.4 / -mv.z), 1.0, u_maxdot);
}`;
const FRAG = `
precision highp float;
uniform float u_exposure;
in vec3 v_color;
in float v_alpha;
out vec4 fragColor;
void main(){
  vec2 d = gl_PointCoord - 0.5;
  float r = length(d);
  float m = smoothstep(0.5, 0.12, r);
  fragColor = vec4(v_color * u_exposure, v_alpha * m);
}`;

let manifest = null, pointClouds = [], loadedCells = 0;

function buildPalette(m){
  const W = 8192, data = new Uint8Array(W*4);
  const put = (off, levels) => levels.forEach((L,i)=>{
    let c = L.color && /^#?[0-9a-fA-F]{6}/.test(L.color) ? L.color.replace('#','') : '888888';
    if (L.name === '') c = '2b3242';
    data[(off+i)*4]   = parseInt(c.slice(0,2),16);
    data[(off+i)*4+1] = parseInt(c.slice(2,4),16);
    data[(off+i)*4+2] = parseInt(c.slice(4,6),16);
    data[(off+i)*4+3] = 255;
  });
  put(PAL.NT, m.levels.neurotransmitter); put(PAL.CLASS, m.levels.class);
  put(PAL.SUB, m.levels.subclass); put(PAL.CL, m.levels.cluster);
  const tex = new THREE.DataTexture(data, W, 1, THREE.RGBAFormat);
  tex.needsUpdate = true; tex.minFilter = tex.magFilter = THREE.NearestFilter;
  return tex;
}

function makePoints(buf, count){
  const ib = new THREE.InterleavedBuffer(buf, 5); // stride 5 floats = 20 bytes
  const geo = new THREE.BufferGeometry();
  const u16 = (off,len)=> new THREE.InterleavedBufferAttribute(ib, len, off, false);
  // InterleavedBuffer is float-typed in three; we need raw views -> use attributes on typed views instead
  const dv = new DataView(buf);
  // Simpler: create typed-array views per attribute over the same buffer
  const u16arr = new Uint16Array(buf), u8arr = new Uint8Array(buf);
  // per-record byte offset 20: pos u16 @0, sub u16 @6, cl u16 @8, class u8 @10, nt u8 @11, genes u8 @12
  const strided = (arr, strideElems, offElems, comps) => {
    const out = new arr.constructor(count * comps);
    for (let i=0;i<count;i++) for (let c=0;c<comps;c++) out[i*comps+c] = arr[i*strideElems + offElems + c];
    return out;
  };
  // u16 view: 10 elems per record; pos @0, sub @3, cl @4 ; u8 view: 20 per record; class @10, nt @11, genes @12
  geo.setAttribute('position', new THREE.BufferAttribute(strided(u16arr,10,0,3), 3));
  geo.setAttribute('a_sub', new THREE.BufferAttribute(strided(u16arr,10,3,1), 1));
  geo.setAttribute('a_cl',  new THREE.BufferAttribute(strided(u16arr,10,4,1), 1));
  geo.setAttribute('a_class', new THREE.BufferAttribute(strided(u8arr,20,10,1), 1));
  geo.setAttribute('a_nt',  new THREE.BufferAttribute(strided(u8arr,20,11,1), 1));
  const gA = new Uint8Array(count*4), gB = new Uint8Array(count*4);
  for (let i=0;i<count;i++){
    const o = i*20+12;
    gA[i*4]=u8arr[o]; gA[i*4+1]=u8arr[o+1]; gA[i*4+2]=u8arr[o+2]; gA[i*4+3]=u8arr[o+3];
    gB[i*4]=u8arr[o+4]; gB[i*4+5-4]=u8arr[o+5]; gB[i*4+2]=u8arr[o+6]; gB[i*4+3]=u8arr[o+7];
  }
  geo.setAttribute('a_geneA', new THREE.BufferAttribute(gA, 4, true));
  geo.setAttribute('a_geneB', new THREE.BufferAttribute(gB, 4, true));
  const mat = new THREE.ShaderMaterial({uniforms, vertexShader:VERT, fragmentShader:FRAG, glslVersion: THREE.GLSL3,
    transparent:true, depthWrite:true, blending:THREE.NormalBlending});
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  return pts;
}

// ---------- loading ----------
const $ = id => document.getElementById(id);
let totalBytes = 0, gotBytes = 0;
async function loadShard(i){
  const r = await fetch(`data/shard_${i}.bin`);
  const len = +r.headers.get('content-length') || 0; totalBytes += len;
  const reader = r.body.getReader();
  const chunks = []; let got = 0;
  for(;;){
    const {done, value} = await reader.read();
    if (done) break;
    chunks.push(value); got += value.length; gotBytes += value.length;
    const mb = (gotBytes/1048576).toFixed(1);
    $('mb').textContent = `${mb} MB streamed · ${loadedCells.toLocaleString()} cells live`;
    $('bar').style.width = Math.min(99, gotBytes/ (manifest.cells*20) * 100) + '%';
  }
  const buf = new Uint8Array(got); let o = 0;
  for (const c of chunks){ buf.set(c, o); o += c.length; }
  const count = got / 20;
  const pts = makePoints(buf.buffer, count);
  scene.add(pts); pointClouds.push(pts); loadedCells += count;
  $('cellcount').textContent = loadedCells.toLocaleString();
}

// ---------- camera + controls ----------
const controls = new OrbitControls(camera, canvas);
controls.addEventListener('start', ()=>{ diveAnim = null; camPath = null; });
controls.enableDamping = true; controls.dampingFactor = 0.06;
controls.enabled = false; controls.autoRotate = false; controls.autoRotateSpeed = 0.5;

// ---------- timeline ----------
const cap = $('caption');
function setCaption(html, small){ cap.innerHTML = html + (small?`<small>${small}</small>`:''); cap.classList.add('show'); }
function hideCaption(){ cap.classList.remove('show'); }

let camPath = null;
function flyTo(t0, t1, from, to, lookFrom, lookTo){
  const ar = innerWidth/innerHeight;
  if (ar < 0.9){ const k = Math.min(2.4, 0.95/Math.max(ar,0.35)); to = to.clone().sub(lookTo).multiplyScalar(k).add(lookTo); }
  camPath = {t0,t1,from,to,lookFrom,lookTo}; }

const INTRO = [
  {t0:0.0, t1:2.2, enter(){ hideCaption(); setCaption('This is not an AI-generated brain.'); }, u:{progress:0, dim:0.0}},
  {t0:2.2, t1:7.5, enter(m){ setCaption(`${m.cells.toLocaleString()} real cells. One real mouse brain.`, 'every dot one measured cell · whole-brain MERFISH · Yao et al., Nature 2023'); }, u:{progress:1, mode:1}},
  {t0:7.5, t1:11.5, enter(){ setCaption('Every cell molecularly typed.', 'official Allen taxonomy colors — glutamate, GABA, modulatory systems'); }, u:{mode:0}},
  {t0:11.5, t1:16.0, enter(){ setCaption('Dopamine neurons, lit from real measurements.', 'Slc6a3 (dopamine transporter) expression per cell'); }, u:{mode:4, gene:6}, dive:true},
  {t0:16.0, t1:19.5, enter(){ setCaption('The whole brain. In your browser.', 'drag to orbit · slice it · search a cell type'); }, u:{mode:2}, back:true},
];
const FILM_TL = [
  {t0:0.0, t1:2.5, enter(){ setCaption('This is not an AI-generated brain.'); }, u:{progress:0},
   anno:{rail:[['ASSAY','MERFISH'],['DATA','measured xyz + counts']]}},
  {t0:2.5, t1:8.5, enter(m){ setCaption(`${m.cells.toLocaleString()} real cells.`, 'one adult mouse brain · whole-brain MERFISH · Yao et al., Nature 2023'); }, u:{progress:1, mode:1},
   anno:{rail:[['SOURCE','Yao et al. 2023'],['CELLS','3,938,808'],['PANEL','550 genes']]}},
  {t0:8.5, t1:13.5, enter(){ setCaption('Every cell molecularly typed.', '338 subclasses · official Allen taxonomy colors'); }, u:{mode:0},
   anno:{rail:[['VIEW','subclass colors'],['TYPES','338']]}},
  {t0:13.5, t1:19.0, enter(){ setCaption('Dopamine neurons — measured, not imagined.', 'Slc6a3 expression, per cell'); }, u:{mode:4, gene:6}, dive:true,
   anno:{rail:[['GENE','Slc6a3'],['MEASURED','217,516']]}},
  {t0:19.0, t1:24.0, anno:{rail:[['GENE','Slc6a4'],['MEASURED','223,031']]}, enter(){ uniforms.u_dim.value = -0.7; setCaption('Serotonin system, same brain.', 'Slc6a4 expression, per cell');
   this.anno && 0; animateUniform('u_exposure', 1.25, 19.0, 21.0); }, u:{mode:4, gene:7}, back:true, orbit:true},
  {t0:24.0, t1:26.8, anno:{rail:[['INTERACTIVE','link in post'],['SOURCE','Allen Brain Cell Atlas']]}, enter(){ uniforms.u_dim.value = 0; setCaption('Fly through it yourself.', 'link below · open source · data: Allen Brain Cell Atlas'); animateUniform('u_exposure', 1.0, 24.0, 25.0); }, u:{mode:2}, back:true, orbit:true},
  {t0:26.8, t1:29.0, anno:{foot:true, title:'real measured data, rendered live', sub:'Yao et al., Nature 2023 · MERFISH whole mouse brain'}, enter(){ setCaption('ARTEMIS', 'real data, rendered live'); }, u:{mode:2}, back:true, orbit:true},
];

const MERFISH_TL = [
  {t0:0.0, t1:2.6, enter(){ clearHl(); uniforms.u_dim.value = 0.93; setCaption('This is what MERFISH data looks like.', 'multiplexed error-robust FISH · 550 genes measured per cell · Yao et al., Nature 2023'); }, u:{progress:1, mode:5},
   anno:{rail:[['ASSAY','MERFISH'],['PANEL','550 genes'],['SOURCE','Yao et al. 2023']]}},
  {t0:2.6, t1:6.0, enter(){ clearHl(); uniforms.u_dim.value = 0; setCaption('Glutamatergic neurons - cortex and hippocampus light up.', 'Slc17a7, the excitatory marker · real counts per cell'); }, u:{mode:4, gene:4}, geneColor:'#19e3ff',
   anno:{rail:[['GENE','Slc17a7'],['TYPE','glutamatergic'],['WHERE','cortex · hippocampus']]}},
  {t0:6.0, t1:9.2, enter(){ setCaption('GABAergic neurons - the inhibitory half.', 'Slc32a1, same brain, real counts per cell'); }, u:{mode:4, gene:1}, geneColor:'#ff2fd6',
   anno:{rail:[['GENE','Slc32a1'],['TYPE','GABAergic']]}},
  {t0:9.2, t1:12.4, enter(){ clearHl(); setMode(2); setHl(2, 45); setCaption('The cerebellum, cell by cell.', '208,692 granule cells in a single subclass · taxonomy-defined, real positions'); },
   anno:{rail:[['REGION','cerebellum'],['CELLS','208,692'],['TYPE','granule cells']]}},
  {t0:12.4, t1:15.6, enter(){ clearHl(); setMode(2); setHl(2, 144, 99); setCaption('The striatum - accelerator and brake.', '111,539 D1 + 105,586 D2 medium spiny neurons'); },
   anno:{rail:[['REGION','striatum'],['D1','111,539'],['D2','105,586']]}},
  {t0:15.6, t1:18.8, enter(){ clearHl(); setCaption('Dopamine neurons of the midbrain.', 'Slc6a3, the dopamine transporter · 217,516 measured cells'); }, u:{mode:4, gene:6}, geneColor:'#ffe135', dive:true,
   anno:{rail:[['GENE','Slc6a3'],['MEASURED','217,516'],['WHERE','midbrain']]}},
  {t0:18.8, t1:21.8, enter(){ uniforms.u_dim.value = -0.5; setCaption('Serotonin neurons of the raphe.', 'Slc6a4, the serotonin transporter · 223,031 measured cells'); }, u:{mode:4, gene:7}, geneColor:'#54ff9f', back:true,
   anno:{rail:[['GENE','Slc6a4'],['MEASURED','223,031'],['WHERE','raphe']]}},
  {t0:21.8, t1:25.2, enter(){ uniforms.u_dim.value = 0; setCaption('All channels at once - 3,938,808 cells.', 'each dot: its strongest measured gene of the 8 shown · from the 550-gene panel'); animateUniform('u_exposure', 1.2, 21.8, 23.6); }, u:{mode:5}, back:true, orbit:true,
   anno:{rail:[['CELLS','3,938,808'],['BRAIN','1 adult mouse']]}},
  {t0:25.2, t1:27.5, enter(){ setCaption('Every dot: one measured cell.', 'nothing simulated · data: Allen Brain Cell Atlas'); }, u:{mode:5}, back:true, orbit:true,
   anno:{foot:true, title:'Yao et al., Nature 2023 · MERFISH whole mouse brain · 550-gene panel', sub:'artemislabs.bio/live/brain'}},
];
const TOUR_TL = [
  {t0:0.0, t1:3.0, enter(){ clearHl(); setCaption('Guided tour: the cast of a real brain.', '8 stops · every number from the data'); }, u:{mode:2}},
  {t0:3.0, t1:10.5, enter(){ clearHl(); setMode(1); setHl(1, 2, -1, WM_COLOR); diveTo(2, 2, 563280);
     setCaption('White matter - the insulation crew.', '563,280 oligodendrocyte-lineage cells tracing the brain\'s wiring (class 31 OPC-Oligo)'); }},
  {t0:10.5, t1:18.0, enter(){ clearHl(); setMode(2); setHl(2, 13, 41); diveTo(2, 13, 504245);
     setCaption('Astrocytes - the support network.', '504,245 in the two largest astrocyte subclasses · 520,452 across all five'); }},
  {t0:18.0, t1:25.5, enter(){ clearHl(); setMode(2); setHl(2, 54, 115); diveTo(2, 54, 52219);
     setCaption('Microglia - resident immune cells.', '52,219 total: 50,192 microglia + 2,027 border-associated macrophages'); }},
  {t0:25.5, t1:33.0, enter(){ clearHl(); setMode(2); setHl(2, 45); diveTo(2, 45, 208692);
     setCaption('The most numerous neurons.', '208,692 cerebellar granule cells - in a single subclass'); }},
  {t0:33.0, t1:40.5, enter(){ clearHl(); setMode(2); setHl(2, 144, 99); diveTo(2, 144, 217125);
     setCaption('Movement\'s accelerator and brake.', '111,539 D1 + 105,586 D2 striatal neurons'); }},
  {t0:40.5, t1:48.0, enter(){ clearHl(); setMode(2); setHl(2, 186, 20); diveTo(2, 186, 10796);
     setCaption('Dopamine neurons.', '4,075 midbrain (SNc/VTA) + 6,721 olfactory bulb - 10,796 taxonomy-defined'); }},
  {t0:48.0, t1:55.5, enter(){ clearHl(); setMode(2); setHl(2, 238); diveTo(2, 238, 3057);
     setCaption('Serotonin neurons of the raphe.', '3,057 cells - a tiny population with brain-wide reach'); }},
  {t0:55.5, t1:60.0, enter(){ clearHl(); setMode(0);
     setCaption('Now explore it yourself.', 'search 5,320 clusters · slice · orbit · light up a gene'); }, back:true},
];
let tl = FILM_V === 'merfish' ? MERFISH_TL : (FILM ? FILM_TL : INTRO), tlStart = 0, playing = true, curScene = -1;

// ---- instrument grammar (film mode) ----
const annoEl=$('anno'), railEl=$('frail'), stepEl=$('stepper'), frameEl=$('frame'), leaderEl=$('leader');
if (FILM){ bloom.strength=0.18; document.body.style.background='#07090f';
  const cv=document.querySelector('canvas'); if (cv) cv.style.filter='saturate(.85)'; }
let annoAnchor=null;
function setAnno(a){
  if (!FILM || !a) return;
  if (a.foot){ annoEl.className='anno foot show';
    annoEl.innerHTML=`<div class="t">${a.title}</div>${a.sub?`<div class="s">${a.sub}</div>`:''}`;
  } else { annoEl.classList.remove('show'); }
  annoAnchor=null;
  railEl.innerHTML=(a.rail||[]).map(r=>`<div class="row"><span class="k">${r[0]}</span><b>${r[1]}</b></div>`).join('');
  railEl.classList.toggle('show', !!(a.rail&&a.rail.length));
}
const _lLine=leaderEl.querySelector('line'), _lDot=leaderEl.querySelector('circle');
function leaderTick(){
  if (!FILM) return;
  if (!annoAnchor || !annoEl.classList.contains('show') || annoEl.classList.contains('foot')){ _lLine.style.display='none'; _lDot.style.display='none'; return; }
  const p=annoAnchor.clone().project(camera);
  if (p.z>1){ _lLine.style.display='none'; _lDot.style.display='none'; return; }
  const ax=(p.x*0.5+0.5)*innerWidth, ay=(-p.y*0.5+0.5)*innerHeight;
  const r=annoEl.getBoundingClientRect(), bx=r.left+10, by=r.bottom-8;
  _lLine.setAttribute('x1',bx); _lLine.setAttribute('y1',by); _lLine.setAttribute('x2',ax); _lLine.setAttribute('y2',ay);
  _lDot.setAttribute('cx',ax); _lDot.setAttribute('cy',ay);
  _lLine.style.display='block'; _lDot.style.display='block';
}
function stepTick(i){ return; 
  if (!stepEl.childElementCount) stepEl.innerHTML=tl.map((s,j)=>`<i data-i="${j}">${String(j+1).padStart(2,'0')}</i>`).join('');
  stepEl.querySelectorAll('i').forEach((el,j)=>el.classList.toggle('on', j===i)); }

function applyScene(i, m){
  const s = tl[i]; if (!s) return;
  s.enter && s.enter(m);
  if (FILM){ setAnno(s.anno); stepTick(i); }
  if (s.u){
    if (s.u.progress !== undefined) animateUniform('u_progress', s.u.progress, s.t0, s.t1);
    if (s.u.mode !== undefined) setMode(s.u.mode);
    if (s.u.gene !== undefined) setGene(s.u.gene);
    if (s.geneColor) uniforms.u_geneColor.value = new THREE.Color(s.geneColor);
  }
  const wide = new THREE.Vector3(1.55, 0.85, 2.65);
  if (s.dive) flyTo(s.t0, s.t1, camera.position.clone(), new THREE.Vector3(0.05,-0.45,1.05), new THREE.Vector3(0,0,0), new THREE.Vector3(0,-0.35,0.1));
  else if (s.back) flyTo(s.t0, s.t1, camera.position.clone(), wide, new THREE.Vector3(0,-0.1,0), new THREE.Vector3(0,0,0));
}
const uniAnim = [];
function animateUniform(name, to, t0, t1){ uniAnim.push({name, from:uniforms[name].value, to, t0, t1}); }
function setMode(m){ uniforms.u_mode.value = m; syncChips(); }
function setGene(g){ uniforms.u_gene.value = g; uniforms.u_geneColor.value = new THREE.Color(GENE_COLORS[g]); }
const GOLD_HL = new THREE.Color(1.0, 0.79, 0.30);
const WM_COLOR = new THREE.Color(0.82, 0.91, 1.0);
function setHl(level, id1, id2=-1, color=GOLD_HL){ uniforms.u_hlLevel.value=level; uniforms.u_hlId.value=id1; uniforms.u_hlId2.value=id2; uniforms.u_hlColor.value.copy(color); }
function clearHl(){ uniforms.u_hlLevel.value=-1; uniforms.u_hlId.value=-1; uniforms.u_hlId2.value=-1; uniforms.u_hlColor.value.copy(GOLD_HL); }
function showWhiteMatter(){
  clearHl(); setMode(2);
  setHl(2, 2, 97, WM_COLOR);
  setCaption('White matter - traced by the cells that insulate it.', '563,280 oligodendrocyte-lineage cells in their real positions (499,099 Oligo + 64,181 OPC)');
}
let centroids = null, diveAnim = null;
fetch('data/centroids.json').then(r=>r.json()).then(c=>{ centroids = c; }).catch(()=>{});
function centroidWorld(level, id){
  const q = (level === 2 ? centroids.sub[id] : centroids.clu[id]);
  const b = manifest.bounds, FIT = uniforms.u_fit.value;
  const cx=(b.x[0]+b.x[1])/2, cy=(b.y[0]+b.y[1])/2, cz=(b.z[0]+b.z[1])/2;
  return new THREE.Vector3(
    ((b.x[0] + (q[0]/65535)*(b.x[1]-b.x[0])) - cx) * FIT,
    ((b.y[0] + (q[1]/65535)*(b.y[1]-b.y[0])) - cy) * FIT,
    ((b.z[0] + (q[2]/65535)*(b.z[1]-b.z[0])) - cz) * FIT);
}
function diveTo(level, id, count){
  if (!centroids) return;
  const tgt = centroidWorld(level, id);
  const dir = camera.position.clone().sub(controls.target);
  if (dir.lengthSq() < 1e-6) dir.set(1, 0.5, 1);
  dir.normalize();
  const ar = innerWidth/innerHeight;
  let dist = Math.max(0.45, Math.min(1.5, 0.30 + 2.0*Math.pow(count/500000, 0.33)));
  if (ar < 0.9) dist = Math.min(3.2, dist * (0.9/Math.max(ar,0.35)));
  const pos = tgt.clone().add(dir.multiplyScalar(dist));
  diveAnim = {fromT: controls.target.clone(), toT: tgt, fromP: camera.position.clone(), toP: pos, t: 0};
}
uniforms.u_geneColors.value = MERFISH_COLORS.map(c=>new THREE.Color(c));
function syncChips(){
  document.querySelectorAll('.chip[data-mode]').forEach(c=>{
    const mode = c.dataset.mode === 'gene' ? 4 : +c.dataset.mode;
    let on = mode === uniforms.u_mode.value;
    if (c.dataset.mode === 'gene') on = on && +c.dataset.gene === uniforms.u_gene.value;
    c.classList.toggle('on', on);
  });
}

// ---------- insights ----------
function fmt(n){ return n.toLocaleString('en-US'); }
function buildRail(m){
  const L = m.levels;
  const ntByName = Object.fromEntries(L.neurotransmitter.map(x=>[x.name,x]));
  const glut = L.neurotransmitter.filter(x=>/glut/i.test(x.name)).reduce((a,x)=>a+x.count,0);
  const gaba = L.neurotransmitter.filter(x=>/gaba/i.test(x.name)).reduce((a,x)=>a+x.count,0);
  const topSub = [...L.subclass].sort((a,b)=>b.count-a.count)[0];
  const dopa = m.gene_positive['Slc6a3'];
  const cards = [
    {h:'THE WHOLE BRAIN', big:fmt(m.cells), p:`measured cells, one adult mouse brain. <b>${fmt(L.cluster.length)} clusters</b> · <b>${fmt(L.subclass.length)} subclasses</b> · nothing sampled.`},
    {h:'EXCITE / INHIBIT', big:`${((glut)/(glut+gaba)*100).toFixed(1)}% / ${((gaba)/(glut+gaba)*100).toFixed(1)}%`,
     p:`glutamatergic <b>${fmt(glut)}</b> vs GABAergic <b>${fmt(gaba)}</b> cells across all neurons (co-releasing counted in both).`,
     show:()=>{ setMode(0); }},
    {h:'DOPAMINE SYSTEM', big:fmt(dopa), p:`cells with measured <b>Slc6a3</b> (dopamine transporter) expression.`,
     show:()=>{ setMode(4); setGene(6); }},
    {h:'LARGEST SUBCLASS', big:fmt(topSub.count), p:`<b>${topSub.name}</b> — the most populated of ${L.subclass.length} subclasses.`,
     show:()=>{ setMode(2); const id = L.subclass.findIndex(x=>x.name===topSub.name); setHl(2, id); setTimeout(clearHl, 6000); }},
  ];
  $('rail').innerHTML = cards.map((c,i)=>`<div class="card"><h4>${c.h}</h4><div class="big">${c.big}</div><p>${c.p}</p>${c.show?`<button class="showme" data-i="${i}">show me</button>`:''}</div>`).join('');
  $('rail').querySelectorAll('.showme').forEach(b=>b.onclick=()=>cards[+b.dataset.i].show());
  $('srctext').textContent = `${fmt(m.cells)} cells · ${fmt(L.class.length)} classes · ${fmt(L.subclass.length)} subclasses · ${fmt(L.supertype.length)} supertypes · ${fmt(L.cluster.length)} clusters. Source: Allen Brain Cell Atlas dataset ${m.dataset}, streamed as packed binary and decoded on your GPU.`;
}

// ---------- search ----------
function setupSearch(m){
  const inp = $('search'), hits = $('hits');
  inp.oninput = ()=>{
    const q = inp.value.trim().toLowerCase();
    if (q.length < 2){ hits.innerHTML=''; return; }
    const subs = m.levels.subclass.map((s,i)=>({name:s.name, count:s.count, level:2, i})).filter(s=>s.name.toLowerCase().includes(q));
    const clus = m.levels.cluster.map((s,i)=>({name:s.name, count:s.count, level:3, i})).filter(s=>s.name.toLowerCase().includes(q));
    subs.sort((a,b)=>b.count-a.count); clus.sort((a,b)=>b.count-a.count);
    const mhits = [...subs.slice(0,5), ...clus.slice(0,5)];
    hits.innerHTML = mhits.map((s,j)=>`<button class="hit" data-j="${j}"><b>${s.name}</b> · ${fmt(s.count)} · ${s.level===2?'subclass':'cluster'}</button>`).join('');
    hits.querySelectorAll('.hit').forEach(b=>b.onclick=()=>{
      const s = mhits[+b.dataset.j];
      clearHl(); setMode(s.level); setHl(s.level, s.i);
      setCaption(`${s.name}`, `${fmt(s.count)} cells · ${s.level===2?'subclass':'cluster'} — highlighted gold for 10s`);
      diveTo(s.level, s.i, s.count);
      setTimeout(()=>{ clearHl(); hideCaption(); }, 10000);
      hits.innerHTML='';
    });
  };
}

// ---------- UI wiring ----------
document.querySelectorAll('.chip[data-mode]').forEach(c=>c.onclick=()=>{
  if (c.dataset.mode === 'gene'){ clearHl(); setMode(4); setGene(+c.dataset.gene); }
  else { clearHl(); setMode(+c.dataset.mode); }
});
$('wmchip').onclick = ()=>{ showWhiteMatter(); };
$('tourchip').onclick = ()=>{
  if (!window.__INTRO_DONE) endIntro();
  tl = TOUR_TL; startTimeline();
};
$('replay').onclick = ()=>{ tl = FILM ? FILM_TL : INTRO; startTimeline(); };
$('slice').oninput = e=>{ uniforms.u_clipZ.value = +e.target.value/100; };
$('bloom').checked = useBloom;
$('bloom').onchange = e=>{ useBloom = e.target.checked; };
$('spin').onchange = e=>{ controls.autoRotate = e.target.checked; };
$('srcbtn').onclick = ()=>$('srcpop').classList.add('open');
$('srcclose').onclick = ()=>$('srcpop').classList.remove('open');
$('skip').onclick = ()=>{ endIntro(); };

function startTimeline(){
  tlStart = performance.now()/1000; playing = true; curScene = -1;
  document.body.classList.add('playing');
  controls.enabled = false; controls.autoRotate = false;
  $('skip').style.display = FILM ? 'none' : 'block';
  clearHl();
  uniAnim.length = 0;
}
function endIntro(){
  playing = false; document.body.classList.remove('playing'); hideCaption(); $('skip').style.display = 'none';
  uniforms.u_progress.value = 1; uniforms.u_dim.value = 0;
  controls.enabled = true; controls.autoRotate = $('spin').checked;
  ['chips','rail','ctl','searchbox'].forEach(id=>$(id).style.display='flex');
  camera.position.set(1.55,0.85,2.65); controls.target.set(0,0,0);
  window.__INTRO_DONE = true;
}

// ---------- fps / adaptive ----------
let frames = 0, fpsT = 0, fps = 60;
function adapt(now){
  frames++;
  if (now - fpsT > 1){
    fps = frames / (now - fpsT); frames = 0; fpsT = now;
    $('fpspill').textContent = `${Math.round(fps)} fps`;
    if (fps < 42 && pixelRatio > 1){ pixelRatio = Math.max(1, pixelRatio - 0.25); renderer.setPixelRatio(pixelRatio); uniforms.u_px.value = pixelRatio; composer.setPixelRatio(pixelRatio); }
  }
}

// ---------- resize ----------
addEventListener('resize', ()=>{
  camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight);
});

// ---------- main ----------
(async ()=>{
  manifest = await (await fetch('data/manifest.json')).json();
  uniforms.u_palette.value = buildPalette(manifest);
  const b = manifest.bounds;
  uniforms.u_boundsMin.value.set(b.x[0], b.y[0], b.z[0]);
  uniforms.u_boundsRange.value.set(b.x[1]-b.x[0], b.y[1]-b.y[0], b.z[1]-b.z[0]);
  const cx = (b.x[0]+b.x[1])/2, cy=(b.y[0]+b.y[1])/2, cz=(b.z[0]+b.z[1])/2;
  const maxR = Math.max(b.x[1]-b.x[0], b.y[1]-b.y[0], b.z[1]-b.z[0]);
  uniforms.u_center.value.set(0,0,0);
  uniforms.u_fit.value = 2.3/maxR;
  // center brain at origin: shift bounds center into shader via u_center in mm
  uniforms.u_center.value.set(cx, cy, cz);
  $('mb').textContent = 'streaming cells…';
  let started = false;
  for (let i=0;i<Math.min(manifest.shards, MAX_SHARDS);i++){
    await loadShard(i);
    if (!started && (i >= 2 || i === manifest.shards-1)){
      started = true;
      $('loader').classList.add('done');
      buildRail(manifest); setupSearch(manifest);
      startTimeline();
      window.__DATA_READY = true;
    }
  }
})();

let prevT = 0;
const __filmTick = () => {
  const now = performance.now()/1000;
  const tFilm = Number.isFinite(SEEK) ? SEEK : (now - tlStart);
  if (playing){
    let idx = tl.findIndex(s=>tFilm >= s.t0 && tFilm < s.t1);
    if (idx < 0 && tFilm >= tl[tl.length-1].t1) idx = tl.length - 1;
    if (idx >= 0 && idx !== curScene){ curScene = idx; applyScene(idx, manifest); }
    if (!FILM && tFilm >= tl[tl.length-1].t1){ endIntro(); }
  }
  for (let i=uniAnim.length-1;i>=0;i--){
    const a = uniAnim[i], k = Math.min(1, Math.max(0,(tFilm - a.t0)/(a.t1 - a.t0)));
    uniforms[a.name].value = a.from + (a.to - a.from) * (k*k*(3-2*k));
    if (k >= 1) uniAnim.splice(i,1);
  }
  if (camPath && playing){
    const k = Math.min(1, Math.max(0,(tFilm - camPath.t0)/(camPath.t1 - camPath.t0)));
    const e = k*k*(3-2*k);
    camera.position.lerpVectors(camPath.from, camPath.to, e);
    controls.target.lerpVectors(camPath.lookFrom, camPath.lookTo, e);
    camera.lookAt(controls.target);
    if (curScene >= 0 && tl[curScene] && tl[curScene].orbit){
      const ang = (tFilm - camPath.t0) * 0.35;
      camera.position.applyAxisAngle(new THREE.Vector3(0,1,0), 0.004);
    }
  }
  if (diveAnim){
    diveAnim.t = Math.min(1, diveAnim.t + (now - (window.__prevNow || now)) * 1.1);
    const e = diveAnim.t*diveAnim.t*(3-2*diveAnim.t);
    camera.position.lerpVectors(diveAnim.fromP, diveAnim.toP, e);
    controls.target.lerpVectors(diveAnim.fromT, diveAnim.toT, e);
    if (diveAnim.t >= 1) diveAnim = null;
  }
  window.__prevNow = now;
  controls.update();
  if (useBloom) composer.render(); else renderer.render(scene, camera);
  adapt(now);
  if (FILM && Number.isFinite(SEEK) && window.__DATA_READY){
    window.__FRAME_READY = (Math.abs(now - prevT) > 0.05); prevT = now;
  }
};
if (FILM && Number.isFinite(SEEK)) {
  controls.enableDamping = false;
  window.__setT = (t) => { SEEK = t; __filmTick(performance.now()/1000); };
} else {
  renderer.setAnimationLoop(__filmTick);
}
