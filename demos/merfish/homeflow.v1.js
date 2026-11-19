/* Presentation only. Data and measurements in each viewer stay stationary. */
(()=>{'use strict';const el=id=>document.getElementById(id);function go(hash,scroll){const t=el(hash.slice(1));if(!t)return;const ds=t.closest('#more-demos>details');if(ds&&!ds.open){ds.open=true;if(scroll)requestAnimationFrame(()=>t.scrollIntoView({block:'start',behavior:'instant'}));}}
function start(){const io='IntersectionObserver'in window?new IntersectionObserver(entries=>entries.forEach(v=>{if(v.isIntersecting){v.target.setAttribute('data-entered','');io.unobserve(v.target);}}),{threshold:0.12}):null;const observed=new WeakSet();
function scan(){for(const n of [el('spatial'),el('genomics')])if(n&&!observed.has(n)){observed.add(n);if(io)io.observe(n);}if(location.hash)go(location.hash,true);}
window.addEventListener('hashchange',()=>go(location.hash,true));document.addEventListener('click',event=>{const a=event.target.closest?.('a[href^="#"]');if(a)go(a.getAttribute('href'),false);});
new MutationObserver(m=>{if(m.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&(n.matches('#more-demos,#spatial,#genomics')||n.querySelector('#more-demos,#spatial,#genomics')))))scan();}).observe(document.body,{childList:true,subtree:true});scan();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();})();
