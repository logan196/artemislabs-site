(()=>{
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>n==null||n===''?'-':Number(n).toLocaleString('en-US');
const PDF='downloads/Artemis_Figure_Booklet_share.pdf';
const TITLE='Artemis Biolabs';
let D=null, TY={}, META={pdf:PDF,pdf_ready:true,papers:17768,candidates:212,email:'lbeharry@alumni.caltech.edu',calendar:'https://calendar.app.google/B8F2J5LoB1bMohZg7'};
let ST={q:'',part:'all',type:'',lang:'',cat:'',sort:'rank'};
const app=$('#app');
const T=k=>`img/thumbs/${k}.webp`, F=k=>`img/full/${k}.webp`, O=i=>`img/orig/${i.key}.png`;
const rankOf=p=>p.part==='I'?(p.top?.rank??999):(p.niche?.rank??999);
const prettyVar=v=>v.replace(/^v(\d+)_/,'V$1 · ').replace(/_/g,' ');
function langs(){const s=new Set();D.packages.forEach(p=>p.lang.split('/').forEach(l=>s.add(l)));return [...s].sort()}

const GROUPS=['Bulk QC & DE','Single-cell','Spatial','Trajectory & velocity','Heatmaps','Enrichment & pathways','Networks & communication','Genome tracks','Neuro imaging & atlases','General & other'];
function groupOf(p){
  const c=(p.category||'').toLowerCase();
  if(/spatial/.test(c)) return 'Spatial';
  if(/trajectory|velocity|fate/.test(c)) return 'Trajectory & velocity';
  if(/enrich|pathway|gene-set|gene set|tf\//.test(c)) return 'Enrichment & pathways';
  if(/heatmap|correlation|cnv/.test(c)) return 'Heatmaps';
  if(/network|ppi|communication|ligand|circos|chord/.test(c)) return 'Networks & communication';
  if(/genome|atac|coverage|track/.test(c)) return 'Genome tracks';
  if(/bulk|volcano|pca|survival/.test(c)) return 'Bulk QC & DE';
  if(/neurophys|neuroimag|atlas|3d brain/.test(c)) return 'Neuro imaging & atlases';
  if(/single-cell|single cell|composition|cluster tree|density|potency|perturbation|disease relevance|publication plots|annotation/.test(c)) return 'Single-cell';
  return 'General & other';
}

function applyPdfLinks(){
  const href=META.pdf||PDF;
  $$('#pdfnav, .js-pdf').forEach(a=>{
    a.href=href;
    if(META.pdf_ready===false){
      a.classList.add('is-pending');
      a.title='The Artemis Figure Booklet PDF will be added here when it is ready';
      a.removeAttribute('download');
    }else{
      a.classList.remove('is-pending');
      a.title='Download the Artemis Figure Booklet PDF';
      a.setAttribute('download','');
    }
  });
}

function boot(catalog, meta){
  D=catalog;
  if(meta) META={...META,...meta};
  D.types.forEach(t=>TY[t.key]=t);
  D.packages.forEach((p,i)=>{
    p.i=i;
    p.group=groupOf(p);
    p.hay=[p.name,p.dir,p.category,p.group,p.lang,p.top?.figtypes,p.niche?.sig,p.header].join(' ').toLowerCase();
  });
  applyPdfLinks();
  route();
}

function loadCatalog(){
  if(window.CATALOG && window.CATALOG.packages){
    const metaP=fetch('data/site_meta.json').then(r=>r.ok?r.json():null).catch(()=>null);
    return metaP.then(m=>boot(window.CATALOG,m));
  }
  return Promise.all([
    fetch('data/catalog.json').then(r=>{if(!r.ok)throw new Error(r.status);return r.json()}),
    fetch('data/site_meta.json').then(r=>r.ok?r.json():null).catch(()=>null)
  ]).then(([d,m])=>boot(d,m));
}
loadCatalog().catch(e=>{app.innerHTML=`<div class="loading">Failed to load catalog: ${esc(e)}</div>`});
addEventListener('hashchange',route);

const menuBtn=$('#menuBtn'), navLinks=$('#navlinks');
if(menuBtn&&navLinks){
  menuBtn.addEventListener('click',()=>{
    const on=navLinks.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded',on?'true':'false');
  });
  navLinks.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
    navLinks.classList.remove('open');
    menuBtn.setAttribute('aria-expanded','false');
  }));
}

function route(){
  const h=location.hash.replace(/^#\/?/,'');const [r,a]=h.split('/');
  $$('.nav nav a[data-r]').forEach(x=>x.classList.toggle('on',x.dataset.r===(r||'home')));
  if(r==='p'&&a) pkgPage(decodeURIComponent(a));
  else if(r==='gallery') gallery();
  else if(r==='tables') tables();
  else if(r==='methods') methods();
  else home();
  if(r!=='' || !ST._kept) scrollTo(0,0);
}

function pdfLabel(){return META.pdf_ready===false?'Booklet PDF (coming soon)':'Download the booklet PDF'}

function home(){
  const P=D.packages, nI=P.filter(p=>p.part==='I').length, nII=P.length-nI;
  const papers=fmt(META.papers||17768);
  const ribbon=P.slice(0,8).map(p=>p.images[0]).filter(Boolean)
    .map(i=>`<img src="${T(i.key)}" alt="" loading="lazy">`).join('');
  const pdfNote=META.pdf_ready===false
    ? `<span class="covcap">The booklet PDF will appear in <span class="mono">downloads/</span> when it is ready.</span>`
    : `<span class="covcap"><a class="js-pdf" href="${esc(META.pdf||PDF)}">Download the Figure Booklet PDF</a></span>`;
  app.innerHTML=`
  <section class="hero"><div class="wrap hero-grid">
    <div>
      <div class="kicker">Systematic literature review · 2023-26</div>
      <h1>Publication-ready figures for your omics data</h1>
      <p class="dek">A systematic review of the plotting packages and analysis tools named in neuroscience bulk, single-cell, and spatial omics papers. Every figure here is an Artemis Biolabs recreation, drawn from runnable code on public or synthetic data.</p>
      <p class="fund">Funded by Bill Gross</p>
      <div class="hero-actions">
        <button class="btn" type="button" id="goCatalog">Browse packages</button>
        <a class="btn ghost js-pdf" href="${esc(META.pdf||PDF)}">${esc(pdfLabel())}</a>
      </div>
      <div class="stats">
        <div class="stat"><b>${papers}</b><span>open-access papers mined (Europe PMC, 2023-26)</span></div>
        <div class="stat"><b>${P.length}</b><span>packages profiled: ${nI} mainstream + ${nII} niche</span></div>
        <div class="stat"><b>${D.n_images}</b><span>figures recreated from code</span></div>
        <div class="stat"><b>${fmt(META.candidates)}</b><span>candidate tools screened</span></div>
      </div>
    </div>
    <div class="hero-visual">
      <a class="covimg js-pdf" href="${esc(META.pdf||PDF)}" title="${esc(pdfLabel())}"><img src="assets/cover.jpg" alt="Artemis Biolabs Figure Booklet cover"></a>
      ${pdfNote}
    </div>
  </div>
  <div class="wrap"><div class="ribbon">${ribbon}</div></div>
  </section>

  <section class="how" id="how">
    <div class="wrap">
      <div class="kicker">01 / How it was built</div>
      <h2>A systematic pass over the literature, then figures from code.</h2>
      <p class="lede">The gallery is the public face of a methods-section review of neuroscience omics papers, not a collection of screenshots from published figures.</p>
      <div class="steps">
        <div class="step">
          <p class="n">Step 1</p>
          <h3>Mine the literature</h3>
          <p>${papers} open-access neuro-omics papers from Europe PMC, 2023-26. Mentions are counted only in the Methods section, so the ranking reflects what labs say they used.</p>
        </div>
        <div class="step">
          <p class="n">Step 2</p>
          <h3>Rank the packages</h3>
          <p>${fmt(META.candidates)} tools were screened. ${P.length} packages are profiled here: mainstream workhorses ranked by Methods mentions, plus fast-growing niche tools with distinctive figures.</p>
        </div>
        <div class="step">
          <p class="n">Step 3</p>
          <h3>Recreate every figure</h3>
          <p>${D.n_images} variations, each drawn from a runnable script on public or synthetic data. The scripts are on the package pages. These are not copies of published figures.</p>
        </div>
      </div>
    </div>
  </section>

  <div class="wrap catalog-head" id="catalog">
    <div class="kicker">02 / The catalog</div>
    <h2>Packages, searchable and filterable.</h2>
    <p>Filter by mainstream or niche, by language, by analysis category, or by figure type. Click a thumbnail to open the figure; click the card to open the package, the code, and the example papers.</p>
  </div>
  <div class="controls"><div class="wrap">
    <div class="ctl">
      <div class="search"><input id="q" placeholder="Search packages, figure types, categories…  ( / )" value="${esc(ST.q)}"></div>
      <div class="seg" id="part"><button type="button" data-v="all">All</button><button type="button" data-v="I">Mainstream</button><button type="button" data-v="II">Niche &amp; cool</button></div>
      <select id="cat" aria-label="Category"><option value="">All categories</option>${GROUPS.map(g=>`<option ${ST.cat===g?'selected':''}>${esc(g)}</option>`).join('')}</select>
      <select id="lang" aria-label="Language"><option value="">All languages</option>${langs().map(l=>`<option ${ST.lang===l?'selected':''}>${esc(l)}</option>`).join('')}</select>
      <select id="sort" aria-label="Sort"><option value="rank">Sort: rank</option><option value="name">Sort: A–Z</option><option value="figs">Sort: most variations</option></select>
      <span class="count" id="cnt"></span>
    </div>
    <div class="chips" id="types">${D.types.map(t=>`<button type="button" class="chip" data-t="${t.key}" style="--c:${t.color}"><i></i>${esc(t.name)}</button>`).join('')}</div>
  </div></div>
  <div class="wrap" id="res"></div>

  <section class="review" id="review">
    <div class="wrap">
      <div class="kicker">03 / Methods in brief</div>
      <h2>What the numbers mean, and what they do not.</h2>
      <p class="lede">The full protocol, queries, and caveats are on the Methods page. These are the points that matter when you read a rank or a growth ratio.</p>
      <div class="review-grid">
        <ul>
          <li><b>Corpus.</b> ${papers} papers with Europe PMC open-access full text, 2023-26 (snapshot 15 Oct 2026). Closed-access papers are missed unless an author manuscript is indexed.</li>
          <li><b>The count.</b> A package is counted when it is named in the Methods section. That shows the tool was used, not that it drew a given published figure.</li>
          <li><b>Scope.</b> Only tools that make figures are ranked. Analysis-only, QC, and general GUI tools were screened and recorded, then set aside from the ranking.</li>
        </ul>
        <ul>
          <li><b>Recreations.</b> Every figure on this site was generated from the script on its package page, on public demo data or simulated files, not traced from a paper.</li>
          <li><b>Niche growth.</b> Growth ratios compare mention rates in 2025-26 with 2023. Ratios on very small 2023 counts mostly reflect a new release, and are marked.</li>
          <li><b>Name ambiguity.</b> Common-word tool names (Harmony, Giotto, CARD and others) were counted only with context terms. That is careful, not perfect.</li>
        </ul>
      </div>
      <p class="more"><a class="btn ghost" href="#/methods">Read the full methods</a></p>
    </div>
  </section>

  <section class="cta-band">
    <div class="wrap">
      <div class="cta-inner">
        <img src="assets/cover.jpg" alt="">
        <div>
          <div class="kicker">Work with Artemis Biolabs</div>
          <h2>Send a dataset or a question.</h2>
          <p>We return publication-ready figures, a written report, and reproducible code. Most work starts as a research pilot on a public dataset.</p>
        </div>
        <div class="cta-actions">
          <a class="btn" href="mailto:${esc(META.email)}">Email us</a>
          <a class="btn ghost" href="${esc(META.calendar)}" target="_blank" rel="noopener">Book a time</a>
          <a class="btn ghost js-pdf" href="${esc(META.pdf||PDF)}">${esc(pdfLabel())}</a>
        </div>
      </div>
    </div>
  </section>`;
  applyPdfLinks();
  $('#sort').value=ST.sort;
  const q=$('#q');q.addEventListener('input',()=>{ST.q=q.value;grid()});
  $$('#part button').forEach(b=>b.onclick=()=>{ST.part=b.dataset.v;grid()});
  $('#lang').onchange=e=>{ST.lang=e.target.value;grid()};
  $('#cat').onchange=e=>{ST.cat=e.target.value;grid()};
  $('#sort').onchange=e=>{ST.sort=e.target.value;grid()};
  $$('#types .chip').forEach(b=>b.onclick=()=>{ST.type=ST.type===b.dataset.t?'':b.dataset.t;grid()});
  $('#goCatalog').onclick=()=>{$('#catalog').scrollIntoView({behavior:'smooth',block:'start'})};
  grid();
  document.title='Figure Gallery · '+TITLE;
}

function filtered(){
  const q=ST.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  let L=D.packages.filter(p=>
    (ST.part==='all'||p.part===ST.part)&&
    (!ST.lang||p.lang.split('/').includes(ST.lang))&&
    (!ST.type||p.types.includes(ST.type))&&
    (!ST.cat||p.group===ST.cat)&&
    q.every(w=>p.hay.includes(w))
  );
  if(ST.sort==='name')L.sort((a,b)=>a.name.localeCompare(b.name));
  else if(ST.sort==='figs')L.sort((a,b)=>b.images.length-a.images.length);
  return L;
}

function card(p,k){
  const i=p.images[0], ii=p.part==='II';
  const maxP=D.packages[0].top?.papers||1;
  const big=ii?`<b>${p.niche?.growth!=null?p.niche.growth.toFixed(1)+'×':'-'}</b><span>growth in mention rate, 2023 → 2025-26</span>`
              :`<b>${fmt(p.top?.papers)}</b><span>papers · ${p.top?.pct}% of corpus</span>`;
  const w=ii?Math.min(100,(p.niche?.pctile||0)*100):Math.max(2,100*(p.top?.papers||0)/maxP);
  return `<a class="card" href="#/p/${encodeURIComponent(p.dir)}" style="animation-delay:${Math.min(k,24)*25}ms">
   <div class="th" data-lb="${p.i}">${i?`<img src="${T(i.key)}" alt="${esc(p.name)} example" loading="lazy">`:''}<span class="rk ${ii?'ii':''}">${ii?'N':'#'}${rankOf(p)}</span><span class="nv">${p.images.length} figs ⤢</span></div>
   <div class="bd"><h3>${esc(p.name)}</h3><div class="meta">${esc(p.lang)} · ${esc(p.category)}</div>
   <div class="big">${big}</div><div class="bar ${ii?'ii':''}"><i style="width:${w}%"></i></div></div></a>`;
}

function grid(){
  $$('#part button').forEach(b=>b.classList.toggle('on',b.dataset.v===ST.part));
  $$('#types .chip').forEach(b=>b.classList.toggle('on',b.dataset.t===ST.type));
  const L=filtered(); const el=$('#cnt'); if(el) el.textContent=`${L.length} / ${D.packages.length} packages`;
  const I=L.filter(p=>p.part==='I'), II=L.filter(p=>p.part==='II');
  let h='';let k=0;
  if(I.length)h+=`<section class="sec"><div class="sech"><h2>Part I · Mainstream workhorses</h2><span class="lbl">ranked by papers naming the package in Methods</span></div><div class="grid">${I.map(p=>card(p,k++)).join('')}</div></section>`;
  if(II.length)h+=`<section class="sec"><div class="sech"><h2>Part II · Niche &amp; cool</h2><span class="lbl">fast-growing tools with distinctive figures</span></div><div class="grid">${II.map(p=>card(p,k++)).join('')}</div></section>`;
  $('#res').innerHTML=h||'<div class="empty">No packages match these filters.</div>';
  $$('#res .th').forEach(t=>t.addEventListener('click',e=>{e.preventDefault();const p=D.packages[+t.dataset.lb];openLB(p.images.map(im=>({p,im})),0)}));
}
addEventListener('keydown',e=>{if(e.key==='/'&&$('#q')&&document.activeElement!==$('#q')&&$('#lb').hidden){e.preventDefault();$('#q').focus()}});

function hl(code,lang){
  const isR=/^R/.test(lang)&&!/Python/.test(lang.split('/')[0]);
  const kw=isR?'function|if|else|for|while|in|library|require|return|TRUE|FALSE|NULL|NA':'def|import|from|as|for|in|if|else|elif|return|with|lambda|True|False|None|and|or|not|class';
  const re=new RegExp(`(#[^\\n]*)|("(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*')|\\b(\\d+(?:\\.\\d+)?)\\b|\\b(${kw})\\b|([A-Za-z_][\\w.]*)(?=\\()`,'g');
  let out='',last=0,m;
  while((m=re.exec(code))){
    out+=esc(code.slice(last,m.index));
    const c=m[1]?'c':m[2]?'s':m[3]?'n':m[4]?'k':'f';out+=`<span class="tk-${c}">${esc(m[0])}</span>`;last=re.lastIndex}
  return out+esc(code.slice(last));
}

function pkgPage(dir){
  const p=D.packages.find(x=>x.dir===dir); if(!p){app.innerHTML='<div class="loading">Package not found. <a href="#/">Back to packages</a></div>';return}
  const ii=p.part==='II', t=p.top, n=p.niche;
  const kp=ii?[
    [n?.growth!=null?n.growth.toFixed(1)+'×':'-','growth ratio (broad mention rate 2025-26 vs 2023)'+(p.lowbase?' †':'')],
    [n?.r23!=null?n.r23.toFixed(3):'-','mentions per 1k papers, 2023'],
    [n?.r2526!=null?n.r2526.toFixed(3):'-','mentions per 1k papers, 2025-26'],
    [fmt(n?.neuro_total),'neuro-corpus papers (2023-26)'],
    [n?.stars!=null?fmt(n.stars):'-','GitHub stars'],
    [p.images.length,'recreated variations']]
   :[[fmt(t?.papers),'papers naming it in Methods'],[(t?.pct??'-')+'%','of the '+fmt(META.papers)+'-paper corpus'],[fmt(t?.fulltext),'papers mentioning it anywhere'],[esc(t?.role||'-'),'role'],[p.images.length,'recreated variations']];
  const bestFor=ii?n?.sig:t?.figtypes;
  const spark=ii&&n?.years?`<div class="panel"><h4>Neuro-corpus papers per year</h4><div class="spark">${n.years.map((v,k)=>{const mx=Math.max(...n.years,1);return `<div style="height:${Math.max(4,100*v/mx)}%" title="${v}"><span>${['2023','2024','2025','2026*'][k]}: ${v}</span></div>`}).join('')}</div><div style="height:20px"></div><p class="lbl">* 2026 is a partial year</p></div>`:'';
  const ex=p.examples.length?p.examples.map(x=>`<div class="ex"><div class="t">${esc(x.title)}</div><div class="j">${esc(x.journal)} · ${esc(x.year)}${x.fig_label?' · '+esc(x.fig_label):''}</div>
     ${x.evidence?`<div class="ev">${esc(x.evidence)}</div>`:''}
     ${x.fig?`<a class="lnk" href="${esc(x.fig)}" target="_blank" rel="noopener">${x.offpmc?'Article ↗':'View figure ↗'}</a>`:''}${x.doi?`<a class="lnk" href="${esc(x.doi)}" target="_blank" rel="noopener">DOI ↗</a>`:''}</div>`).join('')
    :p.corpus_examples.length?`<p class="lbl" style="margin-bottom:6px">Corpus papers mentioning ${esc(p.corpus_alias||p.name)} (${fmt(p.corpus_count)} total). Figure-level links not mined for niche tools.</p>`+p.corpus_examples.map(x=>`<div class="ex"><div class="t">${esc(x.title)}</div><div class="j">${esc(x.journal)} · ${esc(x.year)}${x.cited!=null?' · cited '+x.cited:''}</div>${x.doi?`<a class="lnk" href="${esc(x.doi)}" target="_blank" rel="noopener">DOI ↗</a>`:''}${x.pmcid?`<a class="lnk" href="https://pmc.ncbi.nlm.nih.gov/articles/${esc(x.pmcid)}/" target="_blank" rel="noopener">PMC ↗</a>`:''}</div>`).join('')
    :`<p>No neuro-corpus example papers found for this tool${n?.repo?"; see the repository":""}.</p>`;
  const idx=D.packages.indexOf(p), pv=D.packages[idx-1], nx=D.packages[idx+1];
  app.innerHTML=`
  <div class="wrap"><section class="ph"><a class="back" href="#/">← All packages</a>
   <div class="row"><div><div class="kicker">${ii?'Part II · Niche & cool':'Part I · Mainstream'}</div><h1>${esc(p.name)}</h1>
    <div class="tags"><span class="tag">${esc(p.lang)}</span><span class="tag">${esc(p.category)}</span><span class="tag">${esc(p.group)}</span>${p.types.map(k=>`<span class="tag" style="border-color:${TY[k].color};color:var(--ink)">${esc(TY[k].name)}</span>`).join('')}${n?.repo?`<a class="tag" href="${esc(n.repo)}" target="_blank" rel="noopener">GitHub ↗</a>`:''}</div></div>
    <div class="rank ${ii?'ii':''}"><b>${ii?'N':'#'}${rankOf(p)}</b><div class="lbl">${ii?'niche-cool rank':'rank by papers'}</div></div></div>
   <div class="kpis">${kp.map(([a,b])=>`<div><b>${a}</b><span>${b}</span></div>`).join('')}</div></section>
  <div class="cols"><div>
   ${bestFor?`<div class="panel"><h4>Best for</h4><p>${esc(bestFor)}</p></div>`:''}
   ${p.header?`<div class="panel"><h4>What the recreation shows</h4><p>${esc(p.header)}</p></div>`:''}
   <div class="caveat" style="margin:12px 0"><b>Artemis Biolabs recreation.</b> Data: ${esc(p.datasrc||'see script')}. Recreated by Artemis Biolabs from the script below; not reproduced from the example papers.${p.lowbase?' † Growth ratio rests on fewer than 5 broad-corpus mentions in 2023, so it mostly reflects a new release, not a measured trend.':''}</div>
   ${spark}
   <div class="code"><div class="bar2"><span>${esc(p.script_src||'')}${p.code_line?` · from line ${p.code_line}`:''}</span><span class="act"><button class="btn" id="cp" type="button">Copy</button>${p.script?`<a class="btn" href="${esc(p.script)}" target="_blank">Full script ↗</a>`:''}</span></div><pre><code>${hl(p.code||'',p.lang)}</code></pre></div>
   ${p.limits.length?`<div class="panel" style="margin-top:18px"><h4>Limitations &amp; notes</h4><ul class="lim">${p.limits.map(l=>`<li>${esc(l)}</li>`).join('')}</ul></div>`:''}
   ${t?.note?`<div class="caveat" style="margin-top:12px"><b>Note:</b> ${esc(t.note)}</div>`:''}
  </div><div><div class="panel"><h4>Example papers (neuro corpus)</h4><p style="margin:0 0 8px;font-size:13px;opacity:.85">Published papers that name the package; their figures are by the authors.</p>${ex}</div></div></div>
  <div class="sech"><h2>Gallery</h2><span class="lbl">${p.images.length} variations · click to enlarge</span></div>
  <div class="gal">${p.images.map((im,k)=>`<div class="fig" data-k="${k}"><div class="im"><img src="${T(im.key)}" alt="${esc(p.name+' '+im.var)}" loading="lazy"></div><div class="c"><b>${esc(prettyVar(im.var))}</b><span>${esc(TY[im.type]?.name||im.type)}</span></div></div>`).join('')}</div>
  <div class="pn">${pv?`<a href="#/p/${encodeURIComponent(pv.dir)}"><span class="lbl">← Previous</span><b>${esc(pv.name)}</b></a>`:'<span></span>'}${nx?`<a class="r" href="#/p/${encodeURIComponent(nx.dir)}"><span class="lbl">Next →</span><b>${esc(nx.name)}</b></a>`:''}</div></div>`;
  $('#cp').onclick=()=>{navigator.clipboard.writeText(p.code||'').then(()=>toast('Copied to clipboard'),()=>toast('Copy failed'))};
  const items=p.images.map(im=>({p,im}));
  $$('.gal .fig').forEach(f=>f.onclick=()=>openLB(items,+f.dataset.k));
  document.title=`${p.name} · Figure Gallery · ${TITLE}`;
}

function gallery(){
  const all=[];D.packages.forEach(p=>p.images.forEach(im=>all.push({p,im})));
  app.innerHTML=`<div class="wrap"><section class="ph"><div class="kicker">Visual index</div><h1>All ${all.length} figures</h1>
   <p class="lbl" style="margin-top:10px;text-transform:none;letter-spacing:0;font-size:15px">Every figure is an Artemis Biolabs recreation. Filter by type, then click to enlarge.</p>
   <div class="chips" id="gt"><button type="button" class="chip on" data-t="">All</button>${D.types.map(t=>`<button type="button" class="chip" data-t="${t.key}" style="--c:${t.color}"><i></i>${esc(t.name)}</button>`).join('')}</div></section>
   <div class="sec"><div class="mason" id="ms"></div></div></div>`;
  let cur=all;
  const draw=t=>{cur=t?all.filter(x=>x.im.type===t):all;
    $('#ms').innerHTML=cur.map((x,k)=>`<div class="fig" data-k="${k}"><div class="im"><img src="${T(x.im.key)}" width="${x.im.w}" height="${x.im.h}" style="height:auto" alt="${esc(x.p.name+' '+x.im.var)}" loading="lazy"></div><div class="c"><b>${esc(x.p.name)}</b><span>${esc(prettyVar(x.im.var))}</span></div></div>`).join('');
    $$('#ms .fig').forEach(f=>f.onclick=()=>openLB(cur,+f.dataset.k));};
  $$('#gt .chip').forEach(b=>b.onclick=()=>{$$('#gt .chip').forEach(c=>c.classList.toggle('on',c===b));draw(b.dataset.t)});
  draw('');document.title='Figures · Figure Gallery · '+TITLE;
}

function tables(){
  const dirs=new Set(D.packages.map(p=>p.dir));
  const link=(d,txt)=>d&&dirs.has(d)?`<a href="#/p/${encodeURIComponent(d)}">${esc(txt)}</a>`:esc(txt);
  const T1=[['rank','#','n'],['package','Package'],['language','Lang'],['category','Category'],['paper_count','Papers','n'],['pct_corpus','% corpus','n'],['fulltext_any_count','Full-text any','n'],['typical_figure_types','Typical figures'],['n_variations','Recreated','n']];
  const T2=[['niche_rank','#','n'],['tool','Tool'],['language','Lang'],['category','Category'],['signature_visual','Signature visual'],['growth_ratio','Growth ×','n'],['neuro_total','Neuro papers','n'],['github_stars','Stars','n'],['n_variations','Recreated','n']];
  const mk=(id,cols,rows,nameKey)=>`<div class="tw"><table id="${id}"><thead><tr>${cols.map((c,k)=>`<th data-k="${k}">${c[1]}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${cols.map(c=>`<td class="${c[2]||''}">${c[0]===nameKey?link(r.recreation_dir,r[c[0]]):c[0]==='growth_ratio'&&r[c[0]]!==''?Number(r[c[0]]).toFixed(1):esc(r[c[0]])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  app.innerHTML=`<div class="wrap"><section class="ph"><div class="kicker">Rankings</div><h1>Ranked tables</h1><p class="lbl" style="margin-top:10px;text-transform:none;letter-spacing:0;font-size:15px">Click a column header to sort. Linked names open the package page. Counts are Methods-section mentions in the ${fmt(META.papers)}-paper corpus.</p></section>
  <div class="sec"><div class="sech"><h2>Top 100 · by Methods mentions</h2></div>${mk('t1',T1,D.top100,'package')}
  <div class="sech"><h2>Niche &amp; cool · ${D.niche.length} tools</h2></div>${mk('t2',T2,D.niche,'tool')}</div></div>`;
  $$('table').forEach(tb=>$$('th',tb).forEach(th=>th.onclick=()=>{const k=+th.dataset.k,b=$('tbody',tb),rs=[...b.rows];const asc=th.dataset.s!=='a';$$('th',tb).forEach(x=>delete x.dataset.s);th.dataset.s=asc?'a':'d';
    rs.sort((x,y)=>{const a=x.cells[k].textContent,c=y.cells[k].textContent,na=parseFloat(a.replace(/,/g,'')),nc=parseFloat(c.replace(/,/g,''));const r=!isNaN(na)&&!isNaN(nc)?na-nc:a.localeCompare(c);return asc?r:-r});rs.forEach(r=>b.appendChild(r))}));
  document.title='Rankings · Figure Gallery · '+TITLE;
}

function methods(){
  app.innerHTML=`<div class="wrap"><div class="md" id="md"><div class="loading">Loading…</div></div></div>`;
  const cav=`<div class="caveat" style="margin-bottom:26px"><b>Caveats.</b> The corpus is open-access full text only, so paywalled papers are missed. A Methods mention shows a package was used, not that it drew a given published figure. Niche-tool growth ratios come from small counts. The recreations use public demo data (airway, Zeisel 2015, and others listed below), and deepTools uses simulated bigWigs.</div>`;
  const show=html=>{ $('#md').innerHTML=cav+html; };
  const fromMd=(m,s)=>{
    /* tiny fallback if pre-rendered HTML is absent and marked is not loaded */
    const simple=t=>esc(t).replace(/^### (.*)$/gm,'<h3>$1</h3>').replace(/^## (.*)$/gm,'<h2>$1</h2>').replace(/^# (.*)$/gm,'<h1>$1</h1>').replace(/\*\*(.*?)\*\*/g,'<b>$1</b>').replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\n\n/g,'</p><p>').replace(/^\* /gm,'<li>').replace(/\n/g,'<br>');
    show(`<p>${simple(m)}</p><hr><p>${simple(s)}</p>`);
  };
  if(window.METHODS_HTML){ show(window.METHODS_HTML); }
  else {
    fetch('data/methods.html').then(r=>r.ok?r.text():Promise.reject()).then(show)
      .catch(()=>Promise.all(['data/METHODS.md','data/SUMMARY.md'].map(u=>fetch(u).then(r=>r.text())))
        .then(([m,s])=>{ if(window.marked) show(marked.parse(m)+'<hr>'+marked.parse(s)); else fromMd(m,s); }))
      .catch(e=>{ $('#md').innerHTML=`<p>Could not load methods: ${esc(e)}</p>`; });
  }
  document.title='Methods · Figure Gallery · '+TITLE;
}

/* lightbox */
const lb=$('#lb'),stage=$('#lbStage'),img=$('#lbImg');let L=[],ix=0,z=1,tx=0,ty=0;
function apply(){img.style.transform=`translate(${tx}px,${ty}px) scale(${z})`}
function reset(){z=1;tx=ty=0;apply()}
function show(){const {p,im}=L[ix];reset();img.src=T(im.key);
  const full=new Image();full.onload=()=>{if(L[ix]?.im===im)img.src=full.src};full.src=F(im.key);
  img.alt=`${p.name} - ${im.var}`;
  $('#lbCount').textContent=`${ix+1} / ${L.length}`;
  $('#lbDl').href=O(im);$('#lbDl').setAttribute('download',`${p.dir}_${im.var}.png`);
  $('#lbCap').innerHTML=`<b>${esc(p.name)}</b><span class="v">${esc(prettyVar(im.var))}</span><div class="s">${esc(TY[im.type]?.name||'')} · ${im.w}×${im.h}px · <a href="#/p/${encodeURIComponent(p.dir)}" id="lbGo">package page →</a></div>`;
  $('#lbGo').onclick=closeLB;
  [ix-1,ix+1].forEach(j=>{if(L[j]){const q=new Image();q.src=F(L[j].im.key)}});}
function openLB(items,k){L=items;ix=k;lb.hidden=false;document.body.style.overflow='hidden';show()}
function closeLB(){lb.hidden=true;document.body.style.overflow='';img.src=''}
const go=d=>{ix=(ix+d+L.length)%L.length;show()};
const zoom=(f,cx,cy)=>{const nz=Math.min(8,Math.max(1,z*f));if(cx!=null){const r=stage.getBoundingClientRect(),ox=cx-r.left-r.width/2,oy=cy-r.top-r.height/2;tx=ox-(ox-tx)*nz/z;ty=oy-(oy-ty)*nz/z}z=nz;if(z===1){tx=ty=0}apply()};
$('#lbX').onclick=closeLB;$('#lbP').onclick=()=>go(-1);$('#lbN').onclick=()=>go(1);
$('#lbZi').onclick=()=>zoom(1.5);$('#lbZo').onclick=()=>zoom(1/1.5);$('#lbZr').onclick=reset;
lb.addEventListener('click',e=>{if(e.target===lb||e.target===stage)closeLB()});
stage.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY<0?1.15:1/1.15,e.clientX,e.clientY)},{passive:false});
img.addEventListener('dblclick',e=>{z>1?reset():zoom(2.5,e.clientX,e.clientY)});
let drag=null;const pts=new Map();let pinch=null;
stage.addEventListener('pointerdown',e=>{pts.set(e.pointerId,e);stage.setPointerCapture(e.pointerId);
  if(pts.size===2){const [a,b]=[...pts.values()];pinch={d:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),z};drag=null}
  else drag={x:e.clientX,y:e.clientY,tx,ty,moved:false};stage.classList.add('drag')});
stage.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,e);
  if(pinch&&pts.size===2){const [a,b]=[...pts.values()];const d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);z=Math.min(8,Math.max(1,pinch.z*d/pinch.d));if(z===1)tx=ty=0;apply();return}
  if(drag){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>4)drag.moved=true;
    if(z>1){tx=drag.tx+dx;ty=drag.ty+dy;apply()}}});
const up=e=>{pts.delete(e.pointerId);stage.classList.remove('drag');
  if(drag&&z===1&&drag.moved){const dx=e.clientX-drag.x;if(Math.abs(dx)>60)go(dx<0?1:-1)}
  if(pts.size<2)pinch=null;drag=null};
stage.addEventListener('pointerup',up);stage.addEventListener('pointercancel',up);
addEventListener('keydown',e=>{if(lb.hidden)return;
  if(e.key==='Escape')closeLB();else if(e.key==='ArrowRight')go(1);else if(e.key==='ArrowLeft')go(-1);
  else if(e.key==='+'||e.key==='=')zoom(1.5);else if(e.key==='-')zoom(1/1.5);else if(e.key==='0')reset();});
function toast(t){const d=document.createElement('div');d.className='toast';d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),1600)}
window.__atlas={openLB,closeLB,state:()=>({open:!lb.hidden,ix,z,n:L.length,src:img.src})};
})();
