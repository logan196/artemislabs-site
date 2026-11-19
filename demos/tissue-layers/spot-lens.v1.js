/* Piecewise reveal of the already aligned GBM3 H&E + capture-spot renders. No data is moved or synthesized. */
(() => {
  'use strict';
  if (!CSS.supports('clip-path','circle(30px at 50% 50%)')) return;
  const motion=matchMedia('(any-hover:hover) and (any-pointer:fine) and (prefers-reduced-motion:no-preference)');
  const selector='#tissue-layers .art-layers-stage';
  let active=null, pending=0, px=0, py=0;
  function stop() {
    if (pending) cancelAnimationFrame(pending);
    pending=0;
    if (active) { active.removeAttribute('data-spot-lens'); active=null; }
  }
  const clamp=(x)=>Math.min(100,Math.max(0,x));
  function paint() {
    pending=0;
    if(!active || !active.isConnected || !document.getElementById('art-layer-he')?.checked || !motion.matches) return stop();
    const overlay=active.querySelector('.art-layers-spots');
    if(!overlay?.complete || !overlay.naturalWidth) return;
    const r=active.getBoundingClientRect();
    if(r.width<=0 || r.height<=0) return stop();
    active.style.setProperty('--lens-x',clamp(100*(px-r.left)/r.width).toFixed(2)+'%');
    active.style.setProperty('--lens-y',clamp(100*(py-r.top)/r.height).toFixed(2)+'%');
    active.setAttribute('data-spot-lens','');
  }
  document.addEventListener('pointermove', (e)=> {
    if (!motion.matches || e.buttons || !['mouse','pen'].includes(e.pointerType)) return;
    const stage=e.target instanceof Element && e.target.closest(selector);
    if(!stage || !document.getElementById('art-layer-he')?.checked) return stop();
    if(active!==stage) { stop(); active=stage; }
    px=e.clientX; py=e.clientY;
    if(!pending) pending=requestAnimationFrame(paint);
  },{passive:true});
  document.addEventListener('pointerout',(e)=>{
    if (active && e.target instanceof Node && active.contains(e.target) && !(e.relatedTarget instanceof Node && active.contains(e.relatedTarget))) stop();
  },{passive:true});
  document.addEventListener('pointercancel',stop,{passive:true});
  document.addEventListener('pointerdown',stop,{passive:true});
  document.addEventListener('change',(e)=>{if(e.target?.name==='artemis-gbm3-layer') stop();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  window.addEventListener('blur',stop); motion.addEventListener('change',stop);
})();
