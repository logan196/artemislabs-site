/* ===========================================================================
   Artemis Biolabs — Kusminski / Scherer portal — app.js (round 3)
   Single RAF ticker, single reveal-observer factory, gene explorer, nav
   routing, figure gallery, cobrand/dodeca/helix/volcano wiring.
   =========================================================================== */
(function(){
  "use strict";

  var D = window.EMBEDDED_DATA || {};
  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ------------------------------------------------------------------ utils
  function $(sel, root){ return (root||document).querySelector(sel); }
  function $$(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); }
  function announce(msg){ var a = $("#status-announcer"); if (a) a.textContent = msg; }

  // Canvases mounted while their ancestor is display:none measure 0×0 and
  // never recover on their own — call this after any visibility change that
  // could affect a canvas-bearing container (panel switch, workspace entry,
  // mobile drawer, subtab switch) so every ArtemisHelix/ArtemisDodeca
  // instance's own `resize` listener re-measures and redraws.
  function triggerResize(){
    window.dispatchEvent(new Event("resize"));
  }

  function fmtFC(v){
    if (v === null || v === undefined || isNaN(v)) return "—";
    return (v > 0 ? "+" : "") + v.toFixed(3);
  }
  function fmtPadj(v){
    if (v === null || v === undefined || isNaN(v)) return "—";
    if (v === 0) return "<1e-300";
    if (v < 0.001) return v.toExponential(1).replace("e-", "e-");
    return String(Math.round(v*10000)/10000);
  }
  function fmtNum(v, dp){
    if (v === null || v === undefined || isNaN(v)) return "—";
    return Number(v).toLocaleString("en-US", {maximumFractionDigits: dp==null?0:dp, minimumFractionDigits: dp==null?0:dp});
  }
  window.ArtemisFmt = { fmtFC: fmtFC, fmtPadj: fmtPadj, fmtNum: fmtNum };

  // ------------------------------------------------------------- RAF ticker
  var ArtemisRAF = (function(){
    var widgets = [];
    var visibleMap = new WeakMap();
    var io = ("IntersectionObserver" in window) ? new IntersectionObserver(function(entries){
      entries.forEach(function(e){ visibleMap.set(e.target, e.isIntersecting); });
    }, { threshold: 0.01 }) : null;
    var hidden = document.hidden;
    document.addEventListener("visibilitychange", function(){ hidden = document.hidden; });
    var lastT = null;

    function register(fn, opts){
      opts = opts || {};
      var w = { fn: fn, fps: opts.fps || 60, lastRun: 0, canvas: opts.canvas || null };
      widgets.push(w);
      if (w.canvas){
        visibleMap.set(w.canvas, true);
        if (io) io.observe(w.canvas);
      }
      return function unregister(){
        var idx = widgets.indexOf(w);
        if (idx >= 0) widgets.splice(idx,1);
        if (w.canvas && io) io.unobserve(w.canvas);
      };
    }

    function frame(now){
      if (lastT === null) lastT = now;
      var dt = Math.min((now-lastT)/1000, 0.05);
      lastT = now;
      if (!hidden){
        for (var i=0;i<widgets.length;i++){
          var w = widgets[i];
          if (w.canvas && visibleMap.get(w.canvas) === false) continue;
          var minInterval = 1000/w.fps;
          if (now - w.lastRun >= minInterval){
            w.lastRun = now;
            w.fn(dt, now);
          }
        }
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return { register: register };
  })();
  window.ArtemisRAF = ArtemisRAF;

  // --------------------------------------------------------- reveal factory
  function makeReveal(root){
    var triggered = new WeakSet();
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
          if (!triggered.has(entry.target)){
            triggered.add(entry.target);
            $$("[data-countup]", entry.target).forEach(function(el){ countUp(el, parseInt(el.getAttribute("data-countup"),10), 900); });
            if (entry.target.hasAttribute && entry.target.hasAttribute("data-countup")){
              countUp(entry.target, parseInt(entry.target.getAttribute("data-countup"),10), 900);
            }
          }
        }
      });
    }, { root: root, threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    return {
      observeAll: function(container){
        $$(".reveal", container || document).forEach(function(el){
          if (!el.classList.contains("is-in")) io.observe(el);
        });
      }
    };
  }

  function countUp(el, target, duration){
    if (reducedMotion || !isFinite(target)){ el.textContent = fmtNum(target); return; }
    var start = null;
    function step(ts){
      if (start === null) start = ts;
      var t = Math.min(1, (ts-start)/duration);
      var eased = 1-Math.pow(1-t,3);
      el.textContent = fmtNum(Math.round(target*eased));
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = fmtNum(target);
    }
    requestAnimationFrame(step);
  }

  var revealWelcome, revealMain;

  // =========================================================================
  // DATA DERIVATIONS (everything computed at runtime, never hardcoded)
  // =========================================================================
  var tierA = D.tierA || [];
  var top20ByRank = tierA.slice().sort(function(a,b){ return a.rank - b.rank; }).slice(0,20);
  var maxAbsIntFC = 0;
  tierA.forEach(function(r){ maxAbsIntFC = Math.max(maxAbsIntFC, Math.abs(r.INT_log2FC||0)); });

  var compartmentTally = {};
  tierA.forEach(function(r){ compartmentTally[r.ref_top_compartment] = (compartmentTally[r.ref_top_compartment]||0)+1; });
  var COMPARTMENT_ORDER = ["Myeloid","Adipocyte","Stromal","Endothelial"];
  var COMPARTMENT_COLOR = { Myeloid:"var(--comp-myeloid)", Adipocyte:"var(--comp-adipocyte)", Stromal:"var(--comp-stromal)", Endothelial:"var(--comp-endothelial)" };

  function getTop20NodeData(){
    return top20ByRank.map(function(r){
      return {
        gene: r.gene, log2FC: r.INT_log2FC, padj: r.INT_padj,
        ci_lo: r.INT_CI95_low, ci_hi: r.INT_CI95_high,
        compartment: r.ref_top_compartment, secreted: r.secreted_uniprot
      };
    });
  }

  // =========================================================================
  // COBRAND + DODECAHEDRON + HELIX + VOLCANO MOUNTING
  // =========================================================================
  var heroDodeca, glyphDodeca, cobrandHeroDodeca, cobrandTopbarDodeca, cobrandFooterDodeca, staticDodeca;

  function mountDodecaInstances(){
    var heroCanvas = $("#hero-dodeca");
    if (heroCanvas){
      heroDodeca = ArtemisDodeca.create(heroCanvas, {
        mode: "hero",
        getNodeData: getTop20NodeData,
        reactiveRoot: $("#welcome"),
        wrapEl: $("#hero-dodeca-wrap"),
        tipEl: $("#dodeca-tip"),
        onNodeClick: function(d){ navigateToGene(d.gene); }
      });
      ArtemisRAF.register(heroDodeca.tick, { fps: 60, canvas: heroCanvas });
    }
    var glyphCanvas = $("#glyph-dodeca");
    if (glyphCanvas){
      glyphDodeca = ArtemisDodeca.create(glyphCanvas, { mode: "glyph" });
      ArtemisRAF.register(glyphDodeca.tick, { fps: 60, canvas: glyphCanvas });
    }
    var chm = $("#cobrand-hero-mark");
    if (chm){
      cobrandHeroDodeca = ArtemisDodeca.create(chm, { mode: "cobrand" });
      ArtemisRAF.register(cobrandHeroDodeca.tick, { fps: 60, canvas: chm });
    }
    var ctm = $("#cobrand-topbar-mark");
    if (ctm){
      cobrandTopbarDodeca = ArtemisDodeca.create(ctm, { mode: "cobrand" });
      ArtemisRAF.register(cobrandTopbarDodeca.tick, { fps: 30, canvas: ctm });
    }
    var cfm = $("#cobrand-footer-mark");
    if (cfm){
      cobrandFooterDodeca = ArtemisDodeca.create(cfm, { mode: "cobrand" });
      ArtemisRAF.register(cobrandFooterDodeca.tick, { fps: 30, canvas: cfm });
    }
    var staticCanvas = $("#scope-mark-static");
    if (staticCanvas){
      staticDodeca = ArtemisDodeca.create(staticCanvas, { mode: "static" });
      // draw a single frame; no RAF registration (true "static" mode)
      staticDodeca.tick(0.016, performance.now());
    }

    // sidebar lockup hover boost
    var sidebarBtn = $("#cobrand-sidebar");
    if (sidebarBtn && glyphDodeca){
      ["pointerenter","focus"].forEach(function(evt){
        sidebarBtn.addEventListener(evt, function(){ glyphDodeca.hoverBoost(1400); });
      });
    }
  }

  function mountHelixInstances(){
    var perpool = D.perpool || [];
    var band = $("#helix-band");
    var bandTip = $("#volcano-tip"); // placeholder; real tip below
    var helixTip = document.createElement("div");
    helixTip.className = "viz-tip mono";
    if (band && band.parentElement){
      band.parentElement.style.position = "relative";
      band.parentElement.appendChild(helixTip);
      var bandInst = ArtemisHelix.mount(band, { variant:"band", perpool: perpool, tipEl: helixTip });
      ArtemisRAF.register(bandInst.tick, { fps: 30, canvas: band });
      // reveal when the band's reveal wrapper becomes visible
      var bandWrap = $("#helix-band-wrap");
      if (bandWrap){
        var mo = new MutationObserver(function(){
          if (bandWrap.classList.contains("is-in")) { bandInst.reveal(); mo.disconnect(); }
        });
        mo.observe(bandWrap, { attributes:true, attributeFilter:["class"] });
        if (bandWrap.classList.contains("is-in")) bandInst.reveal();
      }
    }
    var rail = $("#helix-rail");
    if (rail){
      var railInst = ArtemisHelix.mount(rail, { variant:"rail", perpool: perpool, dark:false });
      railInst.reveal();
      ArtemisRAF.register(railInst.tick, { fps: 30, canvas: rail });
    }
    $$(".hairline-helix").forEach(function(hc){
      var inst = ArtemisHelix.mount(hc, { variant:"hairline", perpool: perpool });
      inst.reveal();
      ArtemisRAF.register(inst.tick, { fps: 30, canvas: hc });
    });
    ["#cobrand-sidebar-weave","#cobrand-hero-weave","#cobrand-footer-weave"].forEach(function(sel){
      var weave = $(sel);
      if (!weave) return;
      var weaveInst = ArtemisHelix.mount(weave, { variant:"weave", perpool: perpool, dark:true });
      weaveInst.reveal();
      ArtemisRAF.register(weaveInst.tick, { fps: 30, canvas: weave });
    });
  }

  function mountVolcanoStrip(){
    var canvas = $("#volcano-strip");
    if (!canvas) return;
    var tip = $("#volcano-tip");
    var inst = ArtemisStrips.mountVolcano(canvas, {
      top50_int: D.top50_int || [],
      tierA: tierA,
      tipEl: tip,
      onPointClick: function(gene){ navigateToGene(gene); }
    });
    ArtemisRAF.register(inst.tick, { fps: 30, canvas: canvas });
    var wrap = $("#volcano-strip-wrap");
    if (wrap){
      var mo = new MutationObserver(function(){
        if (wrap.classList.contains("is-in")) { inst.reveal(); mo.disconnect(); }
      });
      mo.observe(wrap, { attributes:true, attributeFilter:["class"] });
      if (wrap.classList.contains("is-in")) inst.reveal();
    }
  }

  function populateDodecaSrList(){
    var ul = $("#dodeca-sr-list");
    if (!ul) return;
    ul.innerHTML = top20ByRank.map(function(r){
      return "<li>" + r.gene + " — INT log2FC " + fmtFC(r.INT_log2FC) + "</li>";
    }).join("");
  }

  // =========================================================================
  // COMPARTMENT BAR (sidebar glance card + labeled Findings card)
  // =========================================================================
  function buildCompartmentBars(){
    var total = tierA.length || 1;
    var sideBar = $("#compartment-bar");
    var legend = $("#compartment-legend");
    if (sideBar){
      sideBar.innerHTML = "";
      COMPARTMENT_ORDER.forEach(function(c, i){
        var n = compartmentTally[c] || 0;
        var seg = document.createElement("div");
        seg.className = "seg";
        seg.style.background = COMPARTMENT_COLOR[c];
        seg.title = c + " · " + n + " of " + total + " (" + Math.round(n/total*100) + "%)";
        sideBar.appendChild(seg);
        setTimeout(function(){ seg.style.width = (n/total*100) + "%"; }, 60 + i*90);
      });
    }
    if (legend){
      legend.textContent = "Tier A origin · " + COMPARTMENT_ORDER.map(function(c){ return compartmentTally[c]||0; }).join(" / ");
    }
    var labeled = $("#compartment-bar-labeled");
    var key = $("#compartment-key-labeled");
    if (labeled){
      labeled.innerHTML = "";
      COMPARTMENT_ORDER.forEach(function(c, i){
        var n = compartmentTally[c] || 0;
        var seg = document.createElement("div");
        seg.className = "seg";
        seg.style.background = COMPARTMENT_COLOR[c];
        seg.title = c + " · " + n + " of " + total + " (" + Math.round(n/total*100) + "%)";
        labeled.appendChild(seg);
        setTimeout(function(){ seg.style.width = (n/total*100) + "%"; }, 60 + i*90);
      });
    }
    if (key){
      key.innerHTML = COMPARTMENT_ORDER.map(function(c){
        var n = compartmentTally[c]||0;
        return '<span class="ck-item"><span class="ck-dot" style="background:'+COMPARTMENT_COLOR[c]+'"></span>'+c+' <span class="mono">'+n+'</span></span>';
      }).join("");
    }
  }

  // =========================================================================
  // FUNNEL RAIL (Projects > Overview)
  // =========================================================================
  function buildFunnelRail(){
    var rail = $("#funnel-rail");
    if (!rail) return;
    var deS = D.deSummary || [];
    function find(contrast){ return deS.filter(function(r){ return r.contrast === contrast; })[0]; }
    var c1 = find("C1_GIPRveh_vs_WTveh");
    var steps = [
      { count: c1 ? c1.M0_primary_padj05 : 0, label: "DE genes (C1)" },
      { count: (find("INT_genotype_x_Rosi")||{}).M0_primary_padj05 || 0, label: "screened" },
      { count: tierA.length, label: "Tier A" },
      { count: 20, label: "shortlisted" }
    ];
    var logs = steps.map(function(s){ return Math.log10(Math.max(s.count,1)); });
    var total = logs.reduce(function(a,b){return a+b;},0);
    var colors = ["var(--accent-100)","var(--accent-500)","var(--accent-600)","var(--accent-700)"];
    rail.innerHTML = "";
    steps.forEach(function(s, i){
      var seg = document.createElement("div");
      seg.className = "funnel-seg";
      seg.style.flexBasis = (logs[i]/total*100) + "%";
      seg.style.background = colors[i];
      if (i < 2) seg.style.color = i===0 ? "var(--ink-900)" : "#fff";
      seg.innerHTML = '<span class="fs-count mono" data-countup="'+s.count+'">0</span><span class="fs-label">'+fmtNum(s.count)+' '+s.label+'</span>';
      rail.appendChild(seg);
    });
    // trigger scaleX sweep + countups when revealed
    var container = rail.closest(".reveal");
    function sweep(){
      $$(".funnel-seg", rail).forEach(function(seg, i){
        setTimeout(function(){
          seg.classList.add("is-in");
          var countEl = $(".fs-count", seg);
          if (countEl) countUp(countEl, parseInt(countEl.getAttribute("data-countup"),10), 420);
        }, i*160);
      });
    }
    if (container){
      var mo = new MutationObserver(function(){
        if (container.classList.contains("is-in")){ sweep(); mo.disconnect(); }
      });
      mo.observe(container, { attributes:true, attributeFilter:["class"] });
      if (container.classList.contains("is-in")) sweep();
    } else { sweep(); }
  }

  // =========================================================================
  // OVERVIEW GLANCE GRID (count-ups per contrast)
  // =========================================================================
  function buildOverviewGlance(){
    var grid = $("#overview-glance-grid");
    if (!grid) return;
    var deS = D.deSummary || [];
    var labelMap = {
      "C1_GIPRveh_vs_WTveh":"C1 · baseline genotype",
      "C2_WTrosi_vs_WTveh":"C2 · Rosi in WT",
      "C3_GIPRrosi_vs_GIPRveh":"C3 · Rosi in GIPR-Adip",
      "C4_GIPRrosi_vs_WTrosi":"C4 · genotype on Rosi",
      "INT_genotype_x_Rosi":"INT · genotype × Rosi"
    };
    grid.innerHTML = deS.map(function(r){
      return '<div class="glance-tile"><div class="gt-value mono" data-countup="'+r.M0_primary_padj05+'">0</div><div class="gt-label">'+(labelMap[r.contrast]||r.contrast)+'</div></div>';
    }).join("");
  }

  // =========================================================================
  // STATIC TABLES — Model summary / Concordance / Energy pathways
  // =========================================================================
  function buildModelSummaryTable(){
    var mount = $("#mount-model-summary");
    if (!mount) return;
    var rows = D.deSummary || [];
    var labelMap = {
      "C1_GIPRveh_vs_WTveh":"C1 — GIPR-Adip veh vs WT veh",
      "C2_WTrosi_vs_WTveh":"C2 — Rosi vs veh in WT",
      "C3_GIPRrosi_vs_GIPRveh":"C3 — Rosi vs veh in GIPR-Adip",
      "C4_GIPRrosi_vs_WTrosi":"C4 — GIPR-Adip vs WT on Rosi",
      "INT_genotype_x_Rosi":"INT — genotype × Rosi interaction"
    };
    var html = '<table class="gene-table"><thead><tr>' +
      '<th>Contrast</th><th>Primary (padj&lt;.05)</th><th>Up</th><th>Down</th><th>Robust to sensitivity refits</th>' +
      '</tr></thead><tbody>';
    rows.forEach(function(r){
      html += "<tr>" +
        "<td style=\"font-family:var(--font-sans);font-weight:600;color:var(--ink-900);\">" + (labelMap[r.contrast]||r.contrast) + "</td>" +
        "<td data-countup-cell=\"" + r.M0_primary_padj05 + "\">" + fmtNum(r.M0_primary_padj05) + "</td>" +
        "<td>" + fmtNum(r.M0_up) + "</td>" +
        "<td>" + fmtNum(r.M0_down) + "</td>" +
        "<td>Per-gene — see Tier A / Top50 tables</td>" +
        "</tr>";
    });
    html += "</tbody></table>";
    mount.innerHTML = html;
  }

  function buildConcordanceTable(){
    var mount = $("#mount-concordance");
    if (!mount) return;
    var rows = D.concordance || [];
    var html = '<table class="gene-table"><thead><tr><th>Metric</th><th>Value</th></tr></thead><tbody>';
    rows.forEach(function(r){
      var v = r.value;
      var disp = (typeof v === "number" && v % 1 !== 0) ? v.toFixed(3) : fmtNum(v);
      if (/%\)/i.test(r.metric) === false && /\(%\)/i.test(r.metric)) disp = v + "%";
      html += "<tr><td style=\"font-family:var(--font-sans);color:var(--ink-700);\">" + r.metric + "</td><td>" + disp + (/\(%\)/i.test(r.metric)?"%":"") + "</td></tr>";
    });
    html += "</tbody></table>";
    mount.innerHTML = html;
  }

  function buildEnergyTable(){
    var mount = $("#mount-energy");
    if (!mount) return;
    var rows = D.energyPathways || [];
    var html = '<table class="gene-table"><thead><tr><th>Block</th><th>Gene</th><th>C1</th><th>C1 padj</th><th>C2</th><th>C2 padj</th><th>C3</th><th>C3 padj</th><th>INT</th><th>INT padj</th></tr></thead><tbody>';
    rows.forEach(function(r){
      html += "<tr>" +
        "<td style=\"font-family:var(--font-sans);color:var(--ink-500);font-size:12px;\">" + r.block + "</td>" +
        "<td style=\"font-family:var(--font-sans);font-weight:600;color:var(--ink-900);\">" + r.gene + "</td>" +
        fcCellsPlain(r.C1, r.C1_padj) + fcCellsPlain(r.C2, r.C2_padj) + fcCellsPlain(r.C3, r.C3_padj) + fcCellsPlain(r.INT, r.INT_padj) +
        "</tr>";
    });
    html += "</tbody></table>";
    mount.innerHTML = html;
    function fcCellsPlain(fc, padj){
      var cls = fc>0?"up":fc<0?"down":"";
      return "<td class=\"fc-val " + cls + "\">" + fmtFC(fc) + "</td><td>" + fmtPadj(padj) + "</td>";
    }
  }

  // =========================================================================
  // GENE EXPLORER
  // =========================================================================
  var DATASETS = {
    tierA: {
      label: "Tier A", count: (D.tierA||[]).length, rows: D.tierA || [], geneField: "gene",
      columns: [
        { key:"rank", label:"Rank", type:"int" },
        { key:"gene", label:"Gene", type:"gene" },
        { key:"INT_log2FC", label:"INT log2FC", type:"fc" },
        { key:"INT_padj", label:"INT padj", type:"padj" },
        { key:"RosiInGIPR_log2FC", label:"Rosi in GIPR log2FC", type:"fc" },
        { key:"RosiInGIPR_padj", label:"Rosi in GIPR padj", type:"padj" },
        { key:"ref_top_compartment", label:"Compartment", type:"text" },
        { key:"secreted_uniprot", label:"Secreted", type:"bool" },
        { key:"pattern", label:"Pattern", type:"text" }
      ],
      defaultSort: { key:"rank", dir:"asc" }
    },
    c4: {
      label: "Top C4", count: (D.top50_c4||[]).length, rows: D.top50_c4 || [], geneField: "gene",
      columns: [
        { key:"gene", label:"Gene", type:"gene" },
        { key:"log2FC", label:"log2FC", type:"fc" },
        { key:"padj", label:"padj", type:"padj" },
        { key:"baseMean", label:"Base mean", type:"num1" },
        { key:"direction", label:"Direction", type:"text" },
        { key:"ref_top_compartment", label:"Compartment", type:"text" },
        { key:"robust_to_muscle_term", label:"Robust · muscle", type:"bool" },
        { key:"robust_to_voom_weights", label:"Robust · voom", type:"bool" }
      ],
      defaultSort: { key:"padj", dir:"asc" }
    },
    int: {
      label: "Top interaction", count: (D.top50_int||[]).length, rows: D.top50_int || [], geneField: "gene",
      columns: [
        { key:"gene", label:"Gene", type:"gene" },
        { key:"log2FC", label:"log2FC", type:"fc" },
        { key:"padj", label:"padj", type:"padj" },
        { key:"baseMean", label:"Base mean", type:"num1" },
        { key:"direction", label:"Direction", type:"text" },
        { key:"ref_top_compartment", label:"Compartment", type:"text" },
        { key:"robust_to_muscle_term", label:"Robust · muscle", type:"bool" },
        { key:"robust_to_voom_weights", label:"Robust · voom", type:"bool" }
      ],
      defaultSort: { key:"padj", dir:"asc" }
    },
    secreted: {
      label: "Secreted", count: (D.secreted||[]).length, rows: D.secreted || [], geneField: "gene",
      columns: [
        { key:"gene", label:"Gene", type:"gene" },
        { key:"tier", label:"Tier", type:"text" },
        { key:"C1_log2FC", label:"C1 log2FC", type:"fc" },
        { key:"C1_padj", label:"C1 padj", type:"padj" },
        { key:"INT_log2FC", label:"INT log2FC", type:"fc" },
        { key:"INT_padj", label:"INT padj", type:"padj" },
        { key:"ref_top_compartment", label:"Compartment", type:"text" },
        { key:"hormone_cytokine_GF", label:"Hormone/cytokine/GF", type:"bool" }
      ],
      defaultSort: { key:"C1_padj", dir:"asc" }
    },
    perpool: {
      label: "Per-pool markers", count: (D.perpool||[]).length, rows: D.perpool || [], geneField: null,
      columns: [
        { key:"sample", label:"Sample", type:"text" },
        { key:"group", label:"Group", type:"text" },
        { key:"Gipr", label:"Gipr TPM", type:"num1" },
        { key:"Ucp1", label:"Ucp1 TPM", type:"num1" },
        { key:"Lep", label:"Lep TPM", type:"num0" },
        { key:"Gdf15", label:"Gdf15 TPM", type:"num1" },
        { key:"Gipr_ratio_to_WT_mean_same_treatment", label:"Gipr ratio to WT", type:"ratio" }
      ],
      defaultSort: null
    }
  };
  var DATASET_ORDER = ["tierA","c4","int","secreted","perpool"];

  var explorerState = { dataset: "tierA", search: "", sort: { key:"rank", dir:"asc" }, density: "comfortable" };

  function buildDatasetPills(){
    var mount = $("#dataset-pills");
    if (!mount) return;
    mount.innerHTML = DATASET_ORDER.map(function(key){
      var ds = DATASETS[key];
      return '<button type="button" class="dataset-pill" role="tab" aria-pressed="'+(key===explorerState.dataset)+'" data-dataset="'+key+'">'+ds.label+'<span class="dp-count mono">'+ds.count+'</span></button>';
    }).join("");
    $$(".dataset-pill", mount).forEach(function(btn){
      btn.addEventListener("click", function(){ selectDataset(btn.getAttribute("data-dataset")); });
    });
  }

  function selectDataset(key){
    explorerState.dataset = key;
    explorerState.search = "";
    explorerState.sort = DATASETS[key].defaultSort;
    var input = $("#search-input"); if (input) input.value = "";
    var clearBtn = $("#search-clear"); if (clearBtn) clearBtn.classList.remove("show");
    $$(".dataset-pill").forEach(function(btn){ btn.setAttribute("aria-pressed", String(btn.getAttribute("data-dataset")===key)); });
    renderTable(true);
  }

  function cellValue(row, col){
    var v = row[col.key];
    switch(col.type){
      case "fc": return fmtFC(v);
      case "padj": return fmtPadj(v);
      case "num1": return v==null?"—":Number(v).toFixed(1);
      case "num0": return v==null?"—":fmtNum(Math.round(v));
      case "ratio": return v==null?"—":Number(v).toFixed(1)+"×";
      case "bool": return v ? "Yes" : "No";
      case "int": return v==null?"—":v;
      default: return v==null?"—":v;
    }
  }
  function sortValue(row, col){
    var v = row[col.key];
    if (col.type === "bool") return v ? 1 : 0;
    if (typeof v === "number") return v;
    if (v == null) return -Infinity;
    return String(v).toLowerCase();
  }

  function renderTable(resetScroll){
    var mount = $("#table-mount");
    if (!mount) return;
    var ds = DATASETS[explorerState.dataset];
    var rows = ds.rows.slice();

    if (explorerState.search){
      var q = explorerState.search.toLowerCase();
      rows = rows.filter(function(r){
        if (ds.geneField) return String(r[ds.geneField]||"").toLowerCase().indexOf(q) >= 0;
        return JSON.stringify(r).toLowerCase().indexOf(q) >= 0;
      });
    }
    if (explorerState.sort){
      var s = explorerState.sort;
      var col = ds.columns.filter(function(c){ return c.key===s.key; })[0] || { key:s.key, type:"text" };
      rows.sort(function(a,b){
        var va = sortValue(a,col), vb = sortValue(b,col);
        if (va < vb) return s.dir==="asc" ? -1 : 1;
        if (va > vb) return s.dir==="asc" ? 1 : -1;
        return 0;
      });
    }

    var maxAbs = {};
    ds.columns.forEach(function(c){
      if (c.type==="fc"){
        var m = 0;
        ds.rows.forEach(function(r){ m = Math.max(m, Math.abs(r[c.key]||0)); });
        maxAbs[c.key] = m || 1;
      }
    });

    var thead = "<thead><tr>" + ds.columns.map(function(c){
      var sortState = explorerState.sort && explorerState.sort.key===c.key ? explorerState.sort.dir : null;
      return '<th data-col="'+c.key+'" aria-sort="'+(sortState==="asc"?"ascending":sortState==="desc"?"descending":"none")+'">'+c.label+'<span class="sort-arrow">▾</span></th>';
    }).join("") + "</tr></thead>";

    var tbody;
    if (!rows.length){
      tbody = "<tbody><tr><td colspan=\""+ds.columns.length+"\"><div class=\"empty-state\">No rows match “"+escapeHtml(explorerState.search)+"”.</div></td></tr></tbody>";
    } else {
      tbody = "<tbody>" + rows.map(function(r){
        return "<tr>" + ds.columns.map(function(c){
          if (c.type === "fc"){
            var v = r[c.key];
            var cls = v>0?"up":v<0?"down":"";
            var pct = Math.min(100, Math.abs(v||0)/maxAbs[c.key]*100);
            var left = v<0 ? (50-pct/2) : 50;
            return '<td><div class="fc-bar-cell"><span class="fc-val '+cls+'">'+fmtFC(v)+'</span><span class="fc-bar-track"><span class="fc-bar-fill '+cls+'" style="left:'+left+'%;width:'+(pct/2)+'%;"></span></span></div></td>';
          }
          if (c.type === "bool"){
            var yes = !!r[c.key];
            return '<td><span class="pill-bool '+(yes?"yes":"no")+'">'+(yes?"✓ Yes":"— No")+'</span></td>';
          }
          if (c.key === ds.geneField){
            return '<td class="cell-gene" data-gene="'+escapeHtml(String(r[c.key]))+'">'+escapeHtml(String(r[c.key]))+'</td>';
          }
          return "<td>" + escapeHtml(String(cellValue(r,c))) + "</td>";
        }).join("") + "</tr>";
      }).join("") + "</tbody>";
    }

    mount.classList.add("fading");
    mount.style.opacity = "0.55";
    setTimeout(function(){
      mount.innerHTML = '<table class="gene-table '+(explorerState.density==="compact"?"density-compact":"")+'">' + thead + tbody + "</table>";
      mount.style.opacity = "1";
      wireTableEvents(mount, ds);
    }, 60);

    var counter = $("#row-counter");
    if (counter){
      var prev = parseInt(counter.getAttribute("data-prev")||"0",10);
      counter.setAttribute("data-prev", rows.length);
      countUp(counter, rows.length, 300);
      setTimeout(function(){ counter.textContent = fmtNum(rows.length) + " of " + fmtNum(ds.rows.length) + " rows"; }, 320);
    }
  }

  function wireTableEvents(mount, ds){
    $$("th", mount).forEach(function(th){
      th.addEventListener("click", function(){
        var key = th.getAttribute("data-col");
        if (explorerState.sort && explorerState.sort.key === key){
          explorerState.sort = { key:key, dir: explorerState.sort.dir==="asc"?"desc":"asc" };
        } else {
          explorerState.sort = { key:key, dir:"asc" };
        }
        renderTable();
      });
    });
    $$(".cell-gene", mount).forEach(function(td){
      td.addEventListener("click", function(){ openGeneDrawer(td.getAttribute("data-gene"), ds); });
    });
  }

  function escapeHtml(s){
    return s.replace(/[&<>"']/g, function(c){ return ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"})[c]; });
  }

  function wireExplorerToolbar(){
    var input = $("#search-input");
    var clearBtn = $("#search-clear");
    if (input){
      input.addEventListener("input", function(){
        explorerState.search = input.value.trim();
        clearBtn.classList.toggle("show", !!explorerState.search);
        renderTable();
      });
    }
    if (clearBtn){
      clearBtn.addEventListener("click", function(){ input.value=""; explorerState.search=""; clearBtn.classList.remove("show"); input.focus(); renderTable(); });
    }
    $$(".density-toggle button").forEach(function(btn){
      btn.addEventListener("click", function(){
        explorerState.density = btn.getAttribute("data-density");
        $$(".density-toggle button").forEach(function(b){ b.setAttribute("aria-pressed", String(b===btn)); });
        renderTable();
      });
    });
    var resetBtn = $("#reset-sort-btn");
    if (resetBtn) resetBtn.addEventListener("click", function(){ explorerState.sort = DATASETS[explorerState.dataset].defaultSort; renderTable(); });
    var copyBtn = $("#copy-tsv-btn");
    if (copyBtn) copyBtn.addEventListener("click", function(){
      var ds = DATASETS[explorerState.dataset];
      var lines = [ds.columns.map(function(c){return c.label;}).join("\t")];
      $$("#table-mount tbody tr").forEach(function(tr){
        lines.push($$("td", tr).map(function(td){ return td.textContent.trim(); }).join("\t"));
      });
      var text = lines.join("\n");
      if (navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(function(){ announce("Table copied as TSV"); flashBtn(copyBtn); });
      } else {
        announce("Copy not supported in this browser");
      }
    });
    function flashBtn(btn){ var orig = btn.textContent; btn.textContent="Copied ✓"; setTimeout(function(){ btn.textContent = orig; }, 1200); }
  }

  // ---- gene detail drawer ----
  var LABEL_MAP = {
    gene_id:"Ensembl ID", description:"Description", rank:"Rank", tier:"Tier", pattern:"Pattern",
    INT_log2FC:"INT log2FC", INT_CI95_low:"INT CI low", INT_CI95_high:"INT CI high", INT_padj:"INT padj",
    INT_stat:"INT stat", INT_muscleTerm_padj:"INT padj (muscle model)", INT_voomQW_padj:"INT padj (voom/QW)",
    INT_compadj_assessable:"Comp-adj assessable", INT_compadj_log2FC:"INT log2FC (comp-adj)", INT_compadj_padj:"INT padj (comp-adj)",
    RosiInWT_log2FC:"Rosi in WT log2FC", RosiInWT_padj:"Rosi in WT padj",
    RosiInGIPR_log2FC:"Rosi in GIPR-Adip log2FC", RosiInGIPR_padj:"Rosi in GIPR-Adip padj",
    GIPRvsWT_onRosi_log2FC:"GIPR vs WT on Rosi log2FC", GIPRvsWT_onRosi_padj:"GIPR vs WT on Rosi padj",
    zero_count_group:"Zero-count group", ref_top_compartment:"Top compartment", secreted_uniprot:"Secreted (UniProt)",
    hormone_cytokine_GF:"Hormone / cytokine / GF", muscle_flag:"Muscle flag", robust_muscle:"Robust to muscle model",
    robust_composition:"Robust to composition model", C1_log2FC:"C1 log2FC", C1_padj:"C1 padj",
    log2FC:"log2FC", CI95_low:"CI low", CI95_high:"CI high", padj:"padj", baseMean:"Base mean",
    composition_class:"Composition class", robust_to_muscle_term:"Robust · muscle term", robust_to_voom_weights:"Robust · voom weights",
    direction:"Direction", literature_note_verified:"Literature note verified", sample:"Sample", group:"Group",
    Gipr:"Gipr (TPM)", Ucp1:"Ucp1 (TPM)", Lep:"Lep (TPM)", Gdf15:"Gdf15 (TPM)",
    Gipr_ratio_to_WT_mean_same_treatment:"Gipr ratio to WT mean"
  };
  function prettyLabel(k){ return LABEL_MAP[k] || k.replace(/_/g," "); }
  function prettyVal(v, k){
    if (v === null || v === undefined) return "—";
    if (typeof v === "boolean") return v ? "Yes" : "No";
    if (typeof v === "number"){
      if (/padj/i.test(k)) return fmtPadj(v);
      if (/log2FC|stat/i.test(k)) return fmtFC(v);
      if (Math.abs(v) >= 1000) return fmtNum(v);
      if (v % 1 !== 0) return v.toFixed(3);
      return String(v);
    }
    return String(v);
  }

  function openGeneDrawer(gene, currentDs){
    var row = currentDs.rows.filter(function(r){ return String(r[currentDs.geneField]) === gene; })[0];
    if (!row) return;
    var content = $("#drawer-content");
    var idPart = row.gene_id ? '<div class="drawer-gene-id mono">'+row.gene_id+'</div>' : "";
    var desc = row.description ? '<div class="drawer-gene-desc">'+escapeHtml(row.description)+'</div>' : "";
    var fieldsHtml = Object.keys(row).filter(function(k){ return k !== "description" && k !== currentDs.geneField && k !== "gene_id"; })
      .map(function(k){
        return '<div class="drawer-field"><span class="df-label">'+prettyLabel(k)+'</span><span class="df-val mono">'+escapeHtml(String(prettyVal(row[k], k)))+'</span></div>';
      }).join("");

    var otherLinks = DATASET_ORDER.filter(function(k){ return k !== explorerState.dataset; }).map(function(k){
      var ds = DATASETS[k];
      if (!ds.geneField) return null;
      var hit = ds.rows.filter(function(r){ return String(r[ds.geneField]).toLowerCase() === gene.toLowerCase(); })[0];
      if (!hit) return null;
      return '<a href="#" data-goto-dataset="'+k+'" data-goto-gene="'+escapeHtml(gene)+'">→ '+ds.label+' table</a>';
    }).filter(Boolean).join("");

    content.innerHTML =
      idPart +
      '<div class="drawer-gene-name">'+escapeHtml(gene)+'</div>' +
      desc +
      '<div class="drawer-section-title mono">▸ Values</div>' +
      fieldsHtml +
      (otherLinks ? '<div class="drawer-findrow"><div class="drawer-section-title mono" style="margin-top:0;">▸ Find this gene in other tables</div>'+otherLinks+'</div>' : "");

    $$("[data-goto-dataset]", content).forEach(function(a){
      a.addEventListener("click", function(e){
        e.preventDefault();
        var key = a.getAttribute("data-goto-dataset");
        var g = a.getAttribute("data-goto-gene");
        closeDrawer();
        selectDataset(key);
        var input = $("#search-input"); if (input){ input.value = g; explorerState.search = g; $("#search-clear").classList.add("show"); }
        renderTable();
      });
    });

    $("#row-drawer-scrim").classList.add("show");
    $("#row-drawer").classList.add("show");
    document.body.style.overflow = "hidden";
    $("#drawer-close-btn").focus();
  }
  function closeDrawer(){
    var d = $("#row-drawer");
    d.classList.add("closing");
    d.classList.remove("show");
    $("#row-drawer-scrim").classList.remove("show");
    document.body.style.overflow = "";
    setTimeout(function(){ d.classList.remove("closing"); }, 190);
  }

  function navigateToGene(gene){
    navigate("#/data/tables/tierA");
    setTimeout(function(){
      selectDataset("tierA");
      var input = $("#search-input");
      if (input){ input.value = gene; explorerState.search = gene; $("#search-clear").classList.add("show"); }
      renderTable();
    }, 40);
  }
  window.ArtemisNavigateToGene = navigateToGene;

  // =========================================================================
  // FIGURE GALLERY
  // =========================================================================
  var figState = { group: "all", caption: "" };
  function filteredFigures(){
    var list = D.figures || [];
    if (figState.group !== "all") list = list.filter(function(f){ return f.group === figState.group; });
    if (figState.caption){
      var q = figState.caption.toLowerCase();
      list = list.filter(function(f){ return f.caption.toLowerCase().indexOf(q)>=0 || f.label.toLowerCase().indexOf(q)>=0; });
    }
    return list;
  }

  function buildFigureGallery(){
    var mount = $("#fig-grid-mount");
    if (!mount) return;
    var list = filteredFigures();
    if (!list.length){ mount.innerHTML = '<div class="empty-state">No figures match that filter.</div>'; return; }
    mount.innerHTML = list.map(function(f, idx){
      return '<article class="fig-card" data-fig-idx="'+idx+'" tabindex="0" role="button" aria-label="Open '+f.label+'">' +
        '<div class="fig-thumb-wrap"><div class="fig-skeleton mono" data-skeleton>ATGC</div><img data-src="figures/'+f.file+'" alt="'+escapeHtml(f.label+': '+f.caption)+'" loading="lazy"></div>' +
        '<div class="fig-card-body"><div class="fig-card-label">'+f.label+(f.group==="archive"?" · supplementary":"")+'</div><div class="fig-card-caption">'+escapeHtml(f.caption)+'</div></div>' +
        '</article>';
    }).join("");

    $$(".fig-card", mount).forEach(function(card){
      var img = $("img", card);
      var skel = $("[data-skeleton]", card);
      var cycleChars = ["A","T","G","C"];
      var ci = 0;
      var cycleTimer = setInterval(function(){ skel.textContent = cycleChars[ci%4]+cycleChars[(ci+1)%4]+cycleChars[(ci+2)%4]+cycleChars[(ci+3)%4]; ci++; }, 180);
      img.src = img.getAttribute("data-src");
      img.addEventListener("load", function(){ img.classList.add("loaded"); clearInterval(cycleTimer); skel.style.display="none"; });
      function open(){ openLightbox(list, parseInt(card.getAttribute("data-fig-idx"),10)); }
      card.addEventListener("click", open);
      card.addEventListener("keydown", function(e){ if (e.key==="Enter" || e.key===" "){ e.preventDefault(); open(); } });
    });
  }

  var lbState = { list: [], idx: 0 };
  function openLightbox(list, idx){
    lbState.list = list; lbState.idx = idx;
    renderLightbox();
    $("#lightbox").classList.add("show");
    document.body.style.overflow = "hidden";
    $("#lb-close-btn").focus();
  }
  function renderLightbox(){
    var f = lbState.list[lbState.idx];
    if (!f) return;
    var img = $("#lb-img");
    img.style.opacity = "0";
    var tmp = new Image();
    tmp.onload = function(){ img.src = "figures/"+f.file; img.alt = f.label+": "+f.caption; img.style.opacity="1"; };
    tmp.src = "figures/"+f.file;
    $("#lb-caption").textContent = f.label + " — " + f.caption;
    $("#lb-counter").textContent = (lbState.idx+1) + " / " + lbState.list.length;
  }
  function closeLightbox(){
    $("#lightbox").classList.remove("show");
    document.body.style.overflow = "";
  }
  function lbNav(delta){
    lbState.idx = (lbState.idx + delta + lbState.list.length) % lbState.list.length;
    renderLightbox();
  }

  function wireFigureControls(){
    $$(".segmented button", $("#fig-filter")).forEach(function(btn){
      btn.addEventListener("click", function(){
        figState.group = btn.getAttribute("data-figfilter");
        $$(".segmented button", $("#fig-filter")).forEach(function(b){ b.setAttribute("aria-pressed", String(b===btn)); });
        buildFigureGallery();
      });
    });
    var capInput = $("#fig-caption-filter");
    if (capInput) capInput.addEventListener("input", function(){ figState.caption = capInput.value.trim(); buildFigureGallery(); });

    $("#lb-close-btn").addEventListener("click", closeLightbox);
    $("#lb-prev-btn").addEventListener("click", function(){ lbNav(-1); });
    $("#lb-next-btn").addEventListener("click", function(){ lbNav(1); });
    $("#lightbox").addEventListener("click", function(e){ if (e.target.id === "lightbox") closeLightbox(); });
  }

  // =========================================================================
  // NAV / ROUTING / PANEL SWITCHING
  // =========================================================================
  var SECTIONS = ["projects","data","scope"];
  var currentSection = "projects";
  var currentProjectsView = "list"; // list | p1 | p2 | p3
  var currentP1Tab = "overview";
  var currentDataTab = "tables";

  function setBreadcrumb(parts){
    var el = $("#breadcrumb");
    if (!el) return;
    el.innerHTML = parts.map(function(p,i){
      var isLast = i===parts.length-1;
      return (i>0?'<span class="sep">/</span>':'') + '<span class="'+(isLast?'crumb-current':'')+'">'+p+'</span>';
    }).join("");
  }

  function positionNavRail(){
    var rail = $("#nav-rail");
    var activeTab = $('.nav-tab[aria-selected="true"]');
    if (!rail || !activeTab) return;
    var wrap = $(".nav-wrap");
    var wrapRect = wrap.getBoundingClientRect();
    var tabRect = activeTab.getBoundingClientRect();
    rail.style.transform = "translateY(" + (tabRect.top - wrapRect.top) + "px)";
    rail.style.height = tabRect.height + "px";
  }

  function switchSection(section, pushHash){
    var order = SECTIONS.indexOf(section);
    var prevOrder = SECTIONS.indexOf(currentSection);
    var forward = order >= prevOrder;
    SECTIONS.forEach(function(s){
      var panel = $("#panel-"+s);
      var tab = $("#tab-"+s);
      if (s === section){
        panel.hidden = false;
        panel.classList.add("is-active");
        tab.setAttribute("aria-selected","true");
      } else {
        panel.classList.remove("is-active");
        panel.hidden = true;
        tab.setAttribute("aria-selected","false");
      }
    });
    currentSection = section;
    positionNavRail();
    toggleSubItems();
    updateBreadcrumbForState();
    $("#main").scrollTop = 0;
    revealMain.observeAll(document.getElementById("panel-"+section));
    announce((section.charAt(0).toUpperCase()+section.slice(1)) + " panel active");
    if (pushHash !== false) syncHash();
    triggerResize();
  }

  function toggleSubItems(){
    var subProjects = $("#sub-projects");
    var subData = $("#sub-data");
    subProjects.classList.toggle("is-open", currentSection==="projects");
    subData.classList.toggle("is-open", currentSection==="data");
    setTimeout(positionNavRail, 10);
  }

  function updateBreadcrumbForState(){
    if (currentSection === "projects"){
      if (currentProjectsView === "list") setBreadcrumb(["Projects"]);
      else if (currentProjectsView === "p1") setBreadcrumb(["Projects","Project 1", capitalize(currentP1Tab)]);
      else setBreadcrumb(["Projects", currentProjectsView==="p2"?"Project 2":"Project 3"]);
    } else if (currentSection === "data"){
      setBreadcrumb(["Data", currentDataTab==="tables" ? DATASETS[explorerState.dataset].label : "Figure gallery"]);
    } else {
      setBreadcrumb(["Scope"]);
    }
  }
  function capitalize(s){ return s.charAt(0).toUpperCase()+s.slice(1); }

  // Keep the sidebar's sub-item highlight in sync no matter which control
  // (sidebar, subtab pill, project card, hash route) drove the navigation.
  function syncSidebarSubItem(subKey){
    $$(".sub-item").forEach(function(b){
      if (b.getAttribute("data-sub") === subKey) b.setAttribute("aria-current","true");
      else b.removeAttribute("aria-current");
    });
  }

  function openProject(n){
    currentProjectsView = n===1?"p1":n===2?"p2":"p3";
    $("#projects-list-view").style.display = "none";
    $("#project1-view").style.display = n===1 ? "block" : "none";
    $("#project2-view").style.display = n===2 ? "block" : "none";
    $("#project3-view").style.display = n===3 ? "block" : "none";
    if (n===1) switchP1Tab(currentP1Tab, false);
    else syncSidebarSubItem(n===2 ? "project2" : "project3");
    updateBreadcrumbForState();
    revealMain.observeAll($("#panel-projects"));
    triggerResize();
  }
  // Navigate to a project from anywhere in the shell (e.g. the sidebar
  // pipeline card, visible on Data/Scope too) — switches section first.
  function goToProject(n){
    if (currentSection !== "projects") switchSection("projects");
    openProject(n);
    syncHash();
  }
  window.ArtemisGoToProject = goToProject;

  function backToProjectsList(){
    currentProjectsView = "list";
    $("#projects-list-view").style.display = "block";
    $("#project1-view").style.display = "none";
    $("#project2-view").style.display = "none";
    $("#project3-view").style.display = "none";
    updateBreadcrumbForState();
  }

  function switchP1Tab(tab, animate){
    currentP1Tab = tab;
    $$(".subtab[data-p1tab]").forEach(function(btn){ btn.setAttribute("aria-selected", String(btn.getAttribute("data-p1tab")===tab)); });
    $$(".subpanel[id^='p1-']").forEach(function(sp){
      var isTarget = sp.id === "p1-"+tab;
      sp.hidden = !isTarget;
      sp.classList.toggle("is-active", isTarget);
    });
    positionSubtabsUnderline($("#project1-view .subtabs"), '.subtab[aria-selected="true"]');
    syncSidebarSubItem(tab);
    updateBreadcrumbForState();
    revealMain.observeAll($("#p1-"+tab));
    triggerResize();
  }

  function positionSubtabsUnderline(container, activeSel){
    if (!container) return;
    var underline = $(".subtabs-underline", container);
    var active = $(activeSel, container);
    if (!underline || !active) return;
    var cRect = container.getBoundingClientRect();
    var aRect = active.getBoundingClientRect();
    underline.style.width = aRect.width + "px";
    underline.style.transform = "translateX(" + (aRect.left - cRect.left) + "px)";
  }

  function switchDataTab(tab){
    currentDataTab = tab;
    $$("#data-subtabs .subtab").forEach(function(btn){ btn.setAttribute("aria-selected", String(btn.getAttribute("data-datatab")===tab)); });
    $("#data-tables").hidden = tab !== "tables";
    $("#data-tables").classList.toggle("is-active", tab==="tables");
    $("#data-figures").hidden = tab !== "figures";
    $("#data-figures").classList.toggle("is-active", tab==="figures");
    positionSubtabsUnderline($("#data-subtabs"), '.subtab[aria-selected="true"]');
    syncSidebarSubItem(tab);
    updateBreadcrumbForState();
    if (tab === "figures" && !$("#fig-grid-mount").children.length) buildFigureGallery();
    triggerResize();
  }

  // ---- hash routing ----
  function syncHash(){
    var hash = "#/" + currentSection;
    if (currentSection === "projects"){
      if (currentProjectsView === "list") hash += "/list";
      else if (currentProjectsView === "p1") hash += "/" + currentP1Tab;
      else hash += "/" + currentProjectsView;
    } else if (currentSection === "data"){
      hash += "/" + currentDataTab;
      if (currentDataTab === "tables") hash += "/" + explorerState.dataset;
    }
    if (window.location.hash !== hash) history.replaceState(null, "", hash);
  }

  function navigate(hash){
    window.location.hash = hash;
    handleHash();
  }
  window.ArtemisNavigate = navigate;

  function handleHash(){
    var hash = window.location.hash.replace(/^#\/?/, "");
    if (!hash) return false;
    var parts = hash.split("/").filter(Boolean);
    if (!parts.length) return false;
    var top = parts[0];
    if (SECTIONS.indexOf(top) === -1) return false;
    enterWorkspace(true);
    selectTab(top, false);
    if (top === "projects"){
      var sub = parts[1];
      if (sub === "project2") openProject(2);
      else if (sub === "project3") openProject(3);
      else if (["overview","methods","findings","caveats"].indexOf(sub) >= 0){ openProject(1); switchP1Tab(sub); }
      else backToProjectsList();
    } else if (top === "data"){
      var dsub = parts[1] || "tables";
      switchDataTab(dsub === "figures" ? "figures" : "tables");
      if (dsub === "tables" && parts[2] && DATASETS[parts[2]]) selectDataset(parts[2]);
    }
    syncHash();
    return true;
  }

  function selectTab(section, push){
    switchSection(section, push);
  }

  // =========================================================================
  // WELCOME <-> WORKSPACE TRANSITION
  // =========================================================================
  function enterWorkspace(skipAnim){
    var welcome = $("#welcome");
    var app = $("#app");
    if (app.classList.contains("is-active")) return;
    if (heroDodeca) heroDodeca.settle();
    function finish(){
      welcome.hidden = true;
      app.classList.add("is-active");
      app.classList.add("is-switching");
      setTimeout(function(){ app.classList.remove("is-switching"); positionNavRail(); }, 220);
      revealMain.observeAll(document);
      buildCompartmentBars();
      triggerResize();
    }
    if (skipAnim || reducedMotion){
      welcome.hidden = true;
      app.classList.add("is-active");
      revealMain.observeAll(document);
      buildCompartmentBars();
      positionNavRail();
      triggerResize();
    } else {
      welcome.classList.add("leaving");
      setTimeout(finish, 260);
    }
  }

  function returnToWelcome(){
    var welcome = $("#welcome");
    var app = $("#app");
    app.classList.remove("is-active");
    welcome.hidden = false;
    welcome.classList.remove("leaving");
    welcome.classList.remove("is-dimmed");
    if (!reducedMotion){
      welcome.classList.add("returning");
      setTimeout(function(){ welcome.classList.remove("returning"); }, 240);
    }
    history.replaceState(null, "", window.location.pathname);
    triggerResize();
  }

  // =========================================================================
  // ENTER-WORKSPACE BUTTON — plain welcome CTA.
  // No authentication of any kind: no credentials, no biometrics, no stored
  // session flag. The button is a single direct click into the workspace.
  // =========================================================================
  function wireUnlockPlate(){
    var plate = $("#unlock-plate");
    if (!plate) return;
    plate.addEventListener("click", function(){ enterWorkspace(false); syncHash(); });
  }

  // =========================================================================
  // ANALYST POPOVER — topbar chip, every workspace screen
  // =========================================================================
  function wireAnalystPopover(){
    var chip = $("#analyst-chip");
    var pop = $("#analyst-pop");
    if (!chip || !pop) return;
    var open = false;
    function openPop(){
      open = true;
      pop.classList.remove("closing");
      pop.classList.add("show");
      chip.setAttribute("aria-expanded","true");
    }
    function closePop(returnFocus){
      if (!open) return;
      open = false;
      pop.classList.add("closing");
      pop.classList.remove("show");
      chip.setAttribute("aria-expanded","false");
      setTimeout(function(){ pop.classList.remove("closing"); }, 160);
      if (returnFocus) chip.focus();
    }
    chip.addEventListener("click", function(){ open ? closePop(false) : openPop(); });
    document.addEventListener("keydown", function(e){
      if (e.key === "Escape" && open) closePop(true);
    });
    document.addEventListener("click", function(e){
      if (open && !pop.contains(e.target) && e.target !== chip) closePop(false);
    });
    pop.addEventListener("focusout", function(e){
      setTimeout(function(){
        if (open && !pop.contains(document.activeElement) && document.activeElement !== chip) closePop(false);
      }, 0);
    });
  }

  // =========================================================================
  // SCOPE TOC SCROLLSPY
  // =========================================================================
  function wireScopeToc(){
    var links = $$("#scope-toc a");
    if (!links.length) return;
    var sections = links.map(function(a){ return $(a.getAttribute("href")); }).filter(Boolean);
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){
          var id = "#"+e.target.id;
          links.forEach(function(a){ a.classList.toggle("is-active", a.getAttribute("href")===id); });
        }
      });
    }, { root: $("#main"), threshold: 0.4, rootMargin: "-10% 0px -60% 0px" });
    sections.forEach(function(s){ io.observe(s); });
    links.forEach(function(a){
      a.addEventListener("click", function(e){
        e.preventDefault();
        var target = $(a.getAttribute("href"));
        if (target) $("#main").scrollTo({ top: target.offsetTop - 8, behavior: reducedMotion ? "auto" : "smooth" });
      });
    });
  }

  // =========================================================================
  // INIT
  // =========================================================================
  function init(){
    revealWelcome = makeReveal(null);
    revealMain = makeReveal($("#main"));
    revealWelcome.observeAll($("#welcome"));

    mountDodecaInstances();
    mountHelixInstances();
    mountVolcanoStrip();
    populateDodecaSrList();
    buildOverviewGlance();
    buildFunnelRail();
    buildModelSummaryTable();
    buildConcordanceTable();
    buildEnergyTable();
    buildDatasetPills();
    wireExplorerToolbar();
    renderTable(true);
    wireFigureControls();
    wireScopeToc();

    // nav tabs
    $$(".nav-tab").forEach(function(tab){
      tab.addEventListener("click", function(){ switchSection(tab.getAttribute("data-section")); });
    });
    // sub items
    $$(".sub-item").forEach(function(btn){
      btn.addEventListener("click", function(){
        var sub = btn.getAttribute("data-sub");
        if (sub === "figuretour"){ window.open("figure-tour.html", "_blank", "noopener"); return; }
        if (currentSection === "projects"){
          if (sub==="project2") openProject(2);
          else if (sub==="project3") openProject(3);
          else { openProject(1); switchP1Tab(sub); }
        } else if (currentSection === "data"){
          switchDataTab(sub);
        }
        syncHash();
      });
    });
    $$(".project-card, .pc-row[data-open-project]").forEach(function(card){
      card.addEventListener("click", function(){ goToProject(parseInt(card.getAttribute("data-open-project"),10)); });
    });
    // .project-card is an <article role="button">, not a native button — it
    // needs a manual Enter/Space→click bridge. .pc-row is a real <button>,
    // which already gets that for free, so it's excluded here to avoid
    // double-firing the navigation.
    $$(".project-card").forEach(function(card){
      card.addEventListener("keydown", function(e){ if (e.key==="Enter"||e.key===" "){ e.preventDefault(); card.click(); } });
    });
    $$(".subtab[data-p1tab]").forEach(function(btn){
      btn.addEventListener("click", function(){ switchP1Tab(btn.getAttribute("data-p1tab")); syncHash(); });
    });
    $$("#data-subtabs .subtab").forEach(function(btn){
      btn.addEventListener("click", function(){ switchDataTab(btn.getAttribute("data-datatab")); syncHash(); });
    });

    // enter workspace — plain click, no authentication of any kind.
    wireUnlockPlate();
    wireAnalystPopover();
    $("#go-to-tables-link").addEventListener("click", function(e){
      e.preventDefault();
      enterWorkspace(true);
      switchDataTab("tables");
      selectDataset("tierA");
      syncHash();
    });
    $("#cobrand-sidebar").addEventListener("click", returnToWelcome);

    // drawer / lightbox close
    $("#drawer-close-btn").addEventListener("click", closeDrawer);
    $("#row-drawer-scrim").addEventListener("click", closeDrawer);
    document.addEventListener("keydown", function(e){
      if (e.key === "Escape"){
        if ($("#row-drawer").classList.contains("show")) closeDrawer();
        if ($("#lightbox").classList.contains("show")) closeLightbox();
        if ($("#sidebar").classList.contains("show")) closeMobileSidebar();
      }
      if ($("#lightbox").classList.contains("show")){
        if (e.key === "ArrowLeft") lbNav(-1);
        if (e.key === "ArrowRight") lbNav(1);
      }
    });

    // mobile sidebar
    function openMobileSidebar(){ $("#sidebar").classList.add("show"); $("#sidebar-scrim").classList.add("show"); }
    function closeMobileSidebar(){ $("#sidebar").classList.remove("show"); $("#sidebar-scrim").classList.remove("show"); }
    $("#hamburger-btn").addEventListener("click", openMobileSidebar);
    $("#sidebar-scrim").addEventListener("click", closeMobileSidebar);

    // topbar scroll elevation
    $("#main").addEventListener("scroll", function(){
      $("#topbar").classList.toggle("is-scrolled", $("#main").scrollTop > 8);
    });

    window.addEventListener("resize", positionNavRail);
    window.addEventListener("hashchange", handleHash);

    // deep-link bypass
    var routed = handleHash();
    if (!routed){
      positionNavRail();
    }

    announce("Portal loaded");
  }

  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
