/* ===========================================================================
   ArtemisHelix — the 12-pool base-pair ladder, bound to real per-pool Gipr TPM.
   Variants: band (92px, caption+tooltip), rail (28px compact), hairline
   (10px panel-header rule), weave (lockup background drift).
   Driven externally by window.ArtemisRAF; this file exposes mount() only.
   =========================================================================== */
(function(){
  "use strict";

  var GROUP_COLOR = {
    WT_Veh:  getCss("--grp-wt-veh",  "#9AA4AC"),
    WT_Rosi: getCss("--grp-wt-rosi", "#A85A1C"),
    GIPR_Veh:getCss("--grp-ga-veh",  "#14808A"),
    GIPR_Rosi:getCss("--grp-ga-rosi","#115E59")
  };
  function getCss(varName, fallback){
    try {
      var v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      return v || fallback;
    } catch(e){ return fallback; }
  }

  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function rungHalfLen(gipr){
    var v = 18 + 26 * (Math.log10(gipr) - 2.0) / 2.1;
    return Math.max(8, Math.min(46, v));
  }

  function mount(canvas, opts){
    opts = opts || {};
    var variant = opts.variant || "band"; // band | rail | hairline | weave
    var perpool = opts.perpool || [];
    var dark = !!opts.dark;
    var tipEl = opts.tipEl || null;
    var revealOnShow = opts.revealOnShow !== false;

    var ctx = canvas.getContext("2d");
    var cw=0, ch=0, dpr=1;
    var phase = Math.random()*Math.PI*2;
    var weavePhase = 0;
    var revealT = revealOnShow ? -1 : 1; // -1 = not yet revealed
    var revealStart = 0;
    var hoverIdx = -1;
    var pointerLocal = null;
    var destroyed = false;
    var staticDrawn = false;

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

    function reveal(){
      if (revealT < 0){ revealT = 0; revealStart = performance.now(); }
    }

    function onMove(e){
      if (variant !== "band") return;
      var rect = canvas.getBoundingClientRect();
      pointerLocal = { x: e.clientX-rect.left, y: e.clientY-rect.top };
    }
    function onLeave(){ pointerLocal=null; hoverIdx=-1; if (tipEl) tipEl.classList.remove("show"); }
    if (variant === "band"){
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerleave", onLeave);
    }

    function rungGeom(i, n, now){
      var amp, wavelength, midY;
      if (variant === "hairline"){
        amp = 3; wavelength = cw/2.6; midY = ch/2;
      } else if (variant === "rail"){
        amp = ch*0.30; wavelength = cw/2.6; midY = ch/2;
      } else {
        amp = ch*0.34; wavelength = cw/2.6; midY = ch/2;
      }
      var x = (i+0.5) * (cw/n);
      var ph = phase + (reducedMotion?0:(now||0)*0.00022);
      var y1 = midY + Math.sin(x/wavelength*Math.PI*2 + ph) * amp;
      var y2 = midY + Math.sin(x/wavelength*Math.PI*2 + ph + Math.PI) * amp;
      return { x: x, y1: y1, y2: y2 };
    }

    function draw(now){
      ctx.clearRect(0,0,cw,ch);
      var n = perpool.length || 12;
      var strandColor = dark ? "rgba(153,246,228,0.30)" : "#CBD9D7";
      var amp, wavelength, midY;
      if (variant === "hairline"){ amp=3; } else if (variant==="rail"){ amp=ch*0.30; } else { amp = ch*0.34; }
      wavelength = cw/2.6; midY = ch/2;
      var ph = phase + (reducedMotion?0:(now||0)*0.00022);

      // strands
      [0, Math.PI].forEach(function(off){
        ctx.beginPath();
        for (var x=0;x<=cw;x+=4){
          var y = midY + Math.sin(x/wavelength*Math.PI*2 + ph + off) * amp;
          if (x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.strokeStyle = strandColor;
        ctx.lineWidth = variant==="hairline" ? 1 : 1.2;
        ctx.stroke();
      });

      if (variant === "weave") return; // weave is strands only, no rungs

      // rungs
      var revealProgress = 1;
      if (revealT >= 0 && !reducedMotion){
        var el = now - revealStart;
        revealProgress = Math.min(1, el/660);
      }
      for (var i=0;i<n;i++){
        var g = rungGeom(i, n, now);
        var itemReveal = revealT < 0 ? 0 : Math.max(0, Math.min(1, (((now-revealStart) - i*55) / 220)));
        if (reducedMotion) itemReveal = 1;
        if (itemReveal <= 0) continue;
        var pool = perpool[i] || {};
        var color = GROUP_COLOR[pool.group] || "#9AA4AC";
        var hl = rungHalfLen(pool.Gipr || 100);
        var cx = g.x, cy1 = g.y1, cy2 = g.y2;
        var midx = cx, midy = (cy1+cy2)/2;
        var dx = 0;
        var half = (variant==="hairline" ? Math.max(3,hl*0.12) : variant==="rail" ? hl*0.45 : hl) * itemReveal;
        var hot = i === hoverIdx;
        ctx.beginPath();
        ctx.moveTo(midx, midy-half);
        ctx.lineTo(midx, midy+half);
        ctx.strokeStyle = color;
        ctx.lineWidth = hot ? 2 : (variant==="hairline"?1:1.4);
        ctx.globalAlpha = hot ? 1 : (variant==="hairline"?0.85:0.9);
        ctx.stroke();
        ctx.globalAlpha = 1;
        if (variant !== "hairline"){
          ctx.beginPath(); ctx.arc(midx, midy-half, 2, 0, Math.PI*2); ctx.fillStyle = color; ctx.fill();
          ctx.beginPath(); ctx.arc(midx, midy+half, 2, 0, Math.PI*2); ctx.fillStyle = color; ctx.fill();
        }
      }
    }

    function hitTest(now){
      if (variant !== "band" || !pointerLocal) { if (hoverIdx!==-1){hoverIdx=-1; if(tipEl) tipEl.classList.remove("show");} return; }
      var n = perpool.length || 12;
      var best=-1, bestD=14;
      for (var i=0;i<n;i++){
        var g = rungGeom(i,n,now);
        var d = Math.abs(pointerLocal.x - g.x);
        if (d < bestD){ bestD=d; best=i; }
      }
      if (best !== hoverIdx){
        hoverIdx = best;
        if (tipEl){
          if (best>=0){
            var p = perpool[best];
            tipEl.innerHTML = '<span class="g">'+p.sample+'</span><br>'+p.group+' · Gipr '+Math.round(p.Gipr)+' TPM<br>'+(p.Gipr_ratio_to_WT_mean_same_treatment||0).toFixed(1)+'× WT mean';
            var g2 = rungGeom(best, n, now);
            var left = g2.x + 10;
            if (left + 160 > cw) left = g2.x - 170;
            tipEl.style.left = left+"px";
            tipEl.style.top = (ch*0.15)+"px";
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
        if (!staticDrawn){ revealT = 1; draw(now); staticDrawn = true; }
        hitTest(now);
        return;
      }
      if (variant === "weave"){
        weavePhase += 6 * dt; // 6px/s drift handled via phase offset approx
        phase += 0.0; // weave uses continuous now-based phase already
      }
      hitTest(now);
      draw(now);
    }

    function destroy(){
      destroyed = true;
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    }

    return { tick: tick, reveal: reveal, destroy: destroy, canvas: canvas };
  }

  window.ArtemisHelix = { mount: mount };
})();
