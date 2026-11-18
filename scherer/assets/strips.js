/* ===========================================================================
   ArtemisStrips — live mini volcano from real interaction results (M2).
   100 top50_int rows (50 up + 50 down) + 53 Tier A genes ringed as a subset.
   Driven externally by window.ArtemisRAF; this file exposes mount() only.
   =========================================================================== */
(function(){
  "use strict";
  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function fmtFC(v){ return (v>0?"+":"") + v.toFixed(3); }
  function fmtPadj(v){
    if (v==null) return "—";
    if (v===0) return "<1e-300";
    if (v<0.001) return v.toExponential(1);
    return v.toPrecision(2);
  }

  function mountVolcano(canvas, opts){
    opts = opts || {};
    var top50 = opts.top50_int || [];
    var tierA = opts.tierA || [];
    var tipEl = opts.tipEl || null;
    var onPointClick = opts.onPointClick || null;

    var ctx = canvas.getContext("2d");
    var cw=0, ch=0, dpr=1;
    var revealT = -1, revealStart = 0;
    var pointerLocal = null, hoverPt = null;
    var destroyed = false, staticDrawn = false;

    var maxNegLog = 0;
    top50.forEach(function(r){ maxNegLog = Math.max(maxNegLog, -Math.log10(Math.max(r.padj, 1e-300))); });
    tierA.forEach(function(r){ maxNegLog = Math.max(maxNegLog, -Math.log10(Math.max(r.INT_padj, 1e-300))); });
    var yMax = Math.ceil(maxNegLog);

    var sortedBase = top50.slice().sort(function(a,b){ return Math.abs(b.log2FC)-Math.abs(a.log2FC); });
    var sortedTierA = tierA.slice().sort(function(a,b){ return Math.abs(b.INT_log2FC)-Math.abs(a.INT_log2FC); });

    function resize(){
      var rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio||1, 2);
      cw = Math.max(1, Math.round(rect.width));
      ch = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(cw*dpr);
      canvas.height = Math.round(ch*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      staticDrawn = false; // pixel buffer was just wiped by the resize — allow a redraw
    }
    resize();
    window.addEventListener("resize", resize);

    var padL=14, padR=14, padT=14, padB=18;
    function xFor(fc){ return padL + (cw-padL-padR) * ((fc+6)/12); }
    function yFor(nlp){ return ch-padB - (ch-padT-padB) * Math.min(nlp/yMax,1); }

    function reveal(){ if (revealT<0){ revealT=0; revealStart=performance.now(); } }

    function onMove(e){
      var rect = canvas.getBoundingClientRect();
      pointerLocal = { x: e.clientX-rect.left, y: e.clientY-rect.top };
    }
    function onLeave(){ pointerLocal=null; hoverPt=null; if(tipEl) tipEl.classList.remove("show"); canvas.style.cursor="default"; }
    function onClick(){ if (hoverPt && onPointClick) onPointClick(hoverPt.gene); }
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("click", onClick);

    function draw(now){
      ctx.clearRect(0,0,cw,ch);

      // guides
      ctx.save();
      ctx.strokeStyle = "#CBD2D7";
      ctx.lineWidth = 1;
      ctx.setLineDash([3,3]);
      [-1,1].forEach(function(gx){
        var x = xFor(gx);
        ctx.beginPath(); ctx.moveTo(x,padT); ctx.lineTo(x,ch-padB); ctx.stroke();
      });
      var yGuide = yFor(-Math.log10(0.05));
      ctx.beginPath(); ctx.moveTo(padL,yGuide); ctx.lineTo(cw-padR,yGuide); ctx.stroke();
      ctx.restore();
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#636E78";
      ctx.fillText("|log2FC| = 1", xFor(1)+4, padT+10);
      ctx.fillText("padj 0.05", padL+2, yGuide-4);

      var elapsed = revealT<0 ? -1 : now-revealStart;

      function drawSet(list, isTierA){
        list.forEach(function(r, idx){
          var fc = isTierA ? r.INT_log2FC : r.log2FC;
          var padj = isTierA ? r.INT_padj : r.padj;
          var appearAt = idx*6;
          var ef = reducedMotion ? 1 : (elapsed<0?0:Math.max(0,Math.min(1,(elapsed-appearAt)/160)));
          if (ef<=0) return;
          var x = xFor(fc), y = yFor(-Math.log10(Math.max(padj,1e-300)));
          var baseR = isTierA ? 3.2 : 2.2;
          var hot = hoverPt && hoverPt.gene === r.gene && hoverPt.isTierA === isTierA;
          var r2 = (hot ? baseR+3 : baseR) * ef;
          ctx.beginPath();
          ctx.arc(x,y,r2,0,Math.PI*2);
          ctx.fillStyle = fc>0 ? "rgba(168,90,28,0.55)" : "rgba(31,111,160,0.55)";
          ctx.fill();
          if (isTierA){
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#0F766E";
            ctx.stroke();
          }
          if (hot){
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#11161A";
            ctx.beginPath(); ctx.arc(x,y,r2,0,Math.PI*2); ctx.stroke();
          }
        });
      }
      drawSet(sortedBase, false);
      drawSet(sortedTierA, true);
    }

    function hitTest(){
      if (!pointerLocal){ if(hoverPt){hoverPt=null; if(tipEl) tipEl.classList.remove("show");} return; }
      var best=null, bestD=7;
      function check(list, isTierA){
        list.forEach(function(r){
          var fc = isTierA ? r.INT_log2FC : r.log2FC;
          var padj = isTierA ? r.INT_padj : r.padj;
          var x = xFor(fc), y = yFor(-Math.log10(Math.max(padj,1e-300)));
          var d = Math.hypot(x-pointerLocal.x, y-pointerLocal.y);
          if (d < bestD){ bestD = d; best = {gene:r.gene, fc:fc, padj:padj, isTierA:isTierA, compartment:r.ref_top_compartment, x:x, y:y}; }
        });
      }
      check(sortedBase, false);
      check(sortedTierA, true);
      var changed = (!hoverPt && best) || (hoverPt && !best) || (hoverPt && best && hoverPt.gene!==best.gene);
      hoverPt = best;
      if (changed){
        canvas.style.cursor = best ? "pointer" : "default";
        if (tipEl){
          if (best){
            tipEl.innerHTML = '<span class="g">'+best.gene+'</span> · log2FC '+fmtFC(best.fc)+' · padj '+fmtPadj(best.padj)+(best.compartment?(' · '+best.compartment):'');
            var left = best.x+10;
            if (left+200>cw) left = best.x-210;
            tipEl.style.left = left+"px";
            tipEl.style.top = Math.max(4, best.y-30)+"px";
            tipEl.classList.add("show");
          } else {
            tipEl.classList.remove("show");
          }
        }
      }
    }

    function tick(dt, now){
      if (destroyed) return;
      if (reducedMotion){
        if (!staticDrawn){ revealT=1; draw(now); staticDrawn=true; }
        hitTest();
        return;
      }
      hitTest();
      draw(now);
    }

    function destroy(){
      destroyed = true;
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("click", onClick);
    }

    return { tick: tick, reveal: reveal, destroy: destroy, canvas: canvas };
  }

  window.ArtemisStrips = { mountVolcano: mountVolcano };
})();
