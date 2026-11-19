/* Published positions/class assignments from a single Moffitt et al. mouse MERFISH section. */
(() => {
 'use strict';
 const DATA='/demos/merfish/section.v1.json'; let shared;
 const get=()=>shared||(shared=fetch(DATA).then(r=>{if(!r.ok)throw new Error('section response');return r.json()}));
 function expandLegacy(){ if(location.hash==='#tissue-layers'){const q=document.querySelector('#spatial .sp-alt');if(q){q.open=true;requestAnimationFrame(()=>document.querySelector('#tissue-layers')?.scrollIntoView());}} }
 const seen=new WeakSet();
 function connect(f){
  if(seen.has(f))return;seen.add(f);
  const init=()=>get().then(d=>mount(f,d)).catch(()=>{if(f.isConnected)f.dataset.ready='poster';});
  if('IntersectionObserver' in window){const o=new IntersectionObserver(e=>{if(!f.isConnected){o.disconnect();return;}if(e.some(a=>a.isIntersecting)){o.disconnect();init();}},{rootMargin:'450px'});o.observe(f);}
  else init();
 }
 function scan(){for(const f of document.querySelectorAll('[data-merfish]')) connect(f);}
 function start(){
  new MutationObserver(changes=>{
   if(!changes.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&(n.matches('[data-merfish]')||n.querySelector('[data-merfish]'))))) return;
   scan(); if(location.hash==='#tissue-layers'&&!document.querySelector('#spatial .sp-alt')?.open)expandLegacy();
  }).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('hashchange',expandLegacy);expandLegacy();scan();
 }
 function mount(f,data){
  if(!f.isConnected||f.dataset.ready||data.points.length!==data.n||data.n!==6605) return;
  const el=f.querySelector('[data-map]'),ctx=el.getContext('2d'),box=el.parentElement,chooser=f.querySelector('select'),panel=f.querySelector('[data-inspect]'),tools=f.querySelector('.sp-controls');if(!ctx) return;
  const marks=data.points,cls=data.class,side=data.plot_side_um;
  let w=0,h=0,dpr=1,base=0,k=1,dx=0,dy=0,chosen=-1,hover=-1,filter=-1,pending=0,drag=null;
  const coords=(p)=>[w/2+dx+(p[0]*.1-side/2)*base*k,h/2+dy+(p[1]*.1-side/2)*base*k];
  function paint(){pending=0;if(w<2||h<2)return;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);const s=side*base*k,x=w/2+dx-s/2,y=h/2+dy-s/2;
   ctx.strokeStyle='#373847';ctx.lineWidth=1;ctx.strokeRect(x,y,s,s);ctx.strokeStyle='#262734';ctx.beginPath();for(let a=1;a<6;a++){ctx.moveTo(x+s*a/6,y);ctx.lineTo(x+s*a/6,y+s);ctx.moveTo(x,y+s*a/6);ctx.lineTo(x+s,y+s*a/6);}ctx.stroke();
   const rad=Math.max(.66, Math.min(3.25,Math.min(w,h)/365*Math.sqrt(k)));
   for(let i=0;i<cls.length;i++){
    if(filter>=0 && i!==filter)continue;
    ctx.beginPath();ctx.fillStyle=cls[i].hex; ctx.globalAlpha=i===0?.46:.92;
    for(const p of marks){if(p[2]!==i)continue;const xx=x+p[0]*.1*base*k, yy=y+p[1]*.1*base*k;if(xx < -4 || yy < -4 || xx > w+4 || yy > h+4)continue;ctx.moveTo(xx+rad,yy);ctx.arc(xx,yy,rad,0,2*Math.PI);}ctx.fill();
   }
   ctx.globalAlpha=1;const id=hover>=0?hover:chosen;if(id>=0){const [x1,y1]=coords(marks[id]);ctx.strokeStyle='#effcf2';ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(x1,y1,rad+5,0,2*Math.PI);ctx.stroke();}
   const units=k>=3?50:k>=1.65?100:250,bar=units*base*k, bx=13, by=h-16;ctx.font='11px monospace';const label=units+' µm';const back=Math.max(bar+6,ctx.measureText(label).width+5);ctx.fillStyle='#111219e8';ctx.fillRect(bx-5,by-24,back+8,28);ctx.strokeStyle='#dad9e6';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(bx,by-3);ctx.lineTo(bx,by);ctx.lineTo(bx+bar,by);ctx.lineTo(bx+bar,by-3);ctx.stroke();ctx.fillStyle='#dad9e6';ctx.fillText(label,bx,by-7);
  }
  const request=()=>{if(!pending)pending=requestAnimationFrame(paint);};
  function resize(){const r=box.getBoundingClientRect();w=r.width;h=r.height;dpr=Math.min(2,window.devicePixelRatio||1);el.width=Math.ceil(w*dpr);el.height=Math.ceil(h*dpr);base=Math.min(w,h)*.913/side;request();}
  function bounds(){const l=side*base*(k-1)*.69;dx=Math.min(l,Math.max(-l,dx));dy=Math.min(l,Math.max(-l,dy));}
  function zoom(v,x=w/2,y=h/2){const next=Math.min(8,Math.max(1,v)),m=next/k;dx=(dx+w/2-x)*m+x-w/2;dy=(dy+h/2-y)*m+y-h/2;k=next;bounds();el.toggleAttribute('data-zoom',k>1);hover=-1;request();}
  function nearest(x,y){let best=100,idx=-1;for(let j=0;j<marks.length;j++){const p=marks[j];if(filter>=0&&filter!==p[2])continue;const q=coords(p),d=(q[0]-x)**2+(q[1]-y)**2;if(d<best){idx=j;best=d;}}return idx;}
  function point(e){const r=el.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top];}
  for(const [i,v] of cls.entries())if(v.count)chooser.add(new Option(v.name+' ('+v.count.toLocaleString('en-US')+')',String(i)));
  chooser.addEventListener('change',()=>{const a=chooser.value;filter=a==='all'?-1:Number(a);chosen=hover=-1;panel.textContent=a==='all'?'Showing all 6,605 cells.':cls[filter].count.toLocaleString('en-US')+' '+cls[filter].name+' cells or centroids';request();});
  function reveal(i){chosen=i;hover=-1;panel.textContent=i<0?'No cell selected.':(cls[marks[i][2]].name==='Ambiguous'?'Ambiguous class':cls[marks[i][2]].name)+' · published class';request();}
  const move=(a,b)=>{dx+=a;dy+=b;bounds();request();};
  el.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0)return;const p=point(e);drag={id:e.pointerId,x:p[0],y:p[1],px:p[0],py:p[1],moved:false};if(k>1){el.setPointerCapture(e.pointerId);el.setAttribute('data-drag','');}});
  el.addEventListener('pointermove',e=>{const p=point(e);if(drag&&drag.id===e.pointerId){if(Math.hypot(p[0]-drag.x,p[1]-drag.y)>4)drag.moved=true;if(k>1&&drag.moved){move(p[0]-drag.px,p[1]-drag.py);hover=-1;}drag.px=p[0];drag.py=p[1];}else if((e.pointerType==='mouse'||e.pointerType==='pen')&&window.matchMedia('(prefers-reduced-motion:no-preference)').matches){hover=nearest(...p);request();}});
  el.addEventListener('pointerup',e=>{if(drag?.id===e.pointerId&&!drag.moved)reveal(nearest(...point(e)));finish();});
  function finish(){drag=null;el.removeAttribute('data-drag');}
  el.addEventListener('pointercancel',finish);el.addEventListener('lostpointercapture',finish);el.addEventListener('pointerleave',()=>{if(k<=1)finish();hover=-1;request();});
  el.addEventListener('keydown',e=>{let use=true;switch(e.key){case '+':case '=':zoom(k*1.42);break;case '-':zoom(k/1.42);break;case 'Home':zoom(1);reveal(-1);break;case 'ArrowLeft':if(k>1)move(32,0);else use=false;break;case 'ArrowRight':if(k>1)move(-32,0);else use=false;break;case 'ArrowUp':if(k>1)move(0,32);else use=false;break;case 'ArrowDown':if(k>1)move(0,-32);else use=false;break;default:use=false;}if(use)e.preventDefault();});
  f.querySelector('[data-zoom-in]').addEventListener('click',()=>zoom(k*1.42));f.querySelector('[data-zoom-out]').addEventListener('click',()=>zoom(k/1.42));f.querySelector('[data-reset]').addEventListener('click',()=>{zoom(1);chooser.value='all';filter=-1;reveal(-1);});
  f.querySelector('[data-poster]').hidden=true;el.hidden=false;tools.hidden=false;panel.hidden=false;f.dataset.ready='interactive';
  if('ResizeObserver' in window){const ro=new ResizeObserver(()=>{if(el.isConnected)resize();else ro.disconnect();});ro.observe(box);}else window.addEventListener('resize',resize);resize();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
