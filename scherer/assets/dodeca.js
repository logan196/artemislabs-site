/* ===========================================================================
   Artemis dodecahedron mark — v2 (round 3)
   Modes: hero (welcome, light ground, data nodes+faces+carriers+hover)
          glyph (sidebar lockup, dark ground, edges+small nodes, 2 carriers)
          cobrand (topbar/footer micro, dark ground, edges only, no carriers)
          static (single frame, no animation — Scope confidentiality mark)

   All instances are driven by window.ArtemisRAF.register(fn, opts) — this
   file never calls requestAnimationFrame itself.
   =========================================================================== */
(function(){
  "use strict";

  // ---- geometry: regular dodecahedron, 20 vertices / 30 edges / 12 faces ----
  var PHI = (1 + Math.sqrt(5)) / 2;
  var INV = 1 / PHI;

  function buildGeometry(){
    var raw = [];
    [-1,1].forEach(function(a){
      [-1,1].forEach(function(b){
        [-1,1].forEach(function(c){ raw.push([a,b,c]); });
      });
    });
    [-1,1].forEach(function(a){
      [-1,1].forEach(function(b){
        raw.push([0, a*INV, b*PHI]);
        raw.push([a*INV, b*PHI, 0]);
        raw.push([a*PHI, 0, b*INV]);
      });
    });
    // normalize scale so radius ~1
    var scale = 1 / Math.sqrt(3);
    var verts = raw.map(function(p){ return [p[0]*scale, p[1]*scale, p[2]*scale]; });

    // edges: connect vertices within a small distance threshold (shortest edge length)
    var edgeLen = null;
    var edges = [];
    for (var i=0;i<verts.length;i++){
      for (var j=i+1;j<verts.length;j++){
        var dx=verts[i][0]-verts[j][0], dy=verts[i][1]-verts[j][1], dz=verts[i][2]-verts[j][2];
        var d = Math.sqrt(dx*dx+dy*dy+dz*dz);
        if (edgeLen === null || d < edgeLen) { edgeLen = d; }
      }
    }
    for (var i2=0;i2<verts.length;i2++){
      for (var j2=i2+1;j2<verts.length;j2++){
        var dx2=verts[i2][0]-verts[j2][0], dy2=verts[i2][1]-verts[j2][1], dz2=verts[i2][2]-verts[j2][2];
        var d2 = Math.sqrt(dx2*dx2+dy2*dy2+dz2*dz2);
        if (d2 < edgeLen * 1.05) edges.push([i2,j2]);
      }
    }

    // faces: 12 pentagons — derive by grouping vertices sharing a face plane normal.
    // Pragmatic construction: for each of the 12 face-center directions, pick the
    // 5 nearest vertices and order them angularly.
    var faceNormals = [];
    [-1,1].forEach(function(a){ faceNormals.push([0,0,a]); faceNormals.push([0,a,0]); faceNormals.push([a,0,0]); });
    [-1,1].forEach(function(a){[-1,1].forEach(function(b){[-1,1].forEach(function(c){
      // not all cube diagonals are dodeca face centers; filter afterward by closeness
    });});});
    // Simpler robust approach: dodecahedron face centers = normalized vectors
    // of the 12 "icosahedron vertex" positions (dual relationship).
    var ico = [];
    [-1,1].forEach(function(a){[-1,1].forEach(function(b){
      ico.push([0,a,b*PHI]);
      ico.push([a,b*PHI,0]);
      ico.push([a*PHI,0,b]);
    });});
    function norm(v){ var l=Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]); return [v[0]/l,v[1]/l,v[2]/l]; }
    var centers = ico.map(norm);

    var faces = centers.map(function(c){
      var withDist = verts.map(function(v,idx){
        var dot = v[0]*c[0]+v[1]*c[1]+v[2]*c[2];
        return {idx:idx, dot:dot};
      });
      withDist.sort(function(a,b){ return b.dot - a.dot; });
      var five = withDist.slice(0,5).map(function(x){ return x.idx; });
      // order angularly around center c
      var ref = verts[five[0]];
      // build basis
      var u = norm([ref[0]-c[0]*(ref[0]*c[0]+ref[1]*c[1]+ref[2]*c[2]), ref[1]-c[1]*(ref[0]*c[0]+ref[1]*c[1]+ref[2]*c[2]), ref[2]-c[2]*(ref[0]*c[0]+ref[1]*c[1]+ref[2]*c[2])]);
      var w = [c[1]*u[2]-c[2]*u[1], c[2]*u[0]-c[0]*u[2], c[0]*u[1]-c[1]*u[0]];
      five.sort(function(ia,ib){
        function ang(idx){
          var v = verts[idx];
          var du = v[0]*u[0]+v[1]*u[1]+v[2]*u[2];
          var dw = v[0]*w[0]+v[1]*w[1]+v[2]*w[2];
          return Math.atan2(dw,du);
        }
        return ang(ia)-ang(ib);
      });
      return five;
    });

    return { verts: verts, edges: edges, faces: faces };
  }

  var GEO = buildGeometry();

  function rotPoint(p, rx, ry){
    var x=p[0], y=p[1], z=p[2];
    // rotate around X
    var cy1=Math.cos(rx), sy1=Math.sin(rx);
    var y1 = y*cy1 - z*sy1;
    var z1 = y*sy1 + z*cy1;
    // rotate around Y
    var cy2=Math.cos(ry), sy2=Math.sin(ry);
    var x2 = x*cy2 + z1*sy2;
    var z2 = -x*sy2 + z1*cy2;
    return [x2, y1, z2];
  }

  function project(p, w, h, scalePx){
    var persp = 2.6 / (2.6 - p[2]);
    return {
      x: w/2 + p[0] * scalePx * persp,
      y: h/2 + p[1] * scalePx * persp,
      z: p[2],
      persp: persp
    };
  }

  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
  function lerp(a,b,t){ return a + (b-a)*t; }

  var MODE_SPIN = {
    hero:   { rx: 0.16,  ry: 0.115 },
    glyph:  { rx: 0.085, ry: 0.060 },
    cobrand:{ rx: 0.085, ry: 0.060 }
  };

  function create(canvas, opts){
    opts = opts || {};
    var mode = opts.mode || "hero";
    var getNodeData = opts.getNodeData || null; // () => [{gene,log2FC,padj,compartment,secreted}] length 20, rank order
    var onNodeClick = opts.onNodeClick || null;
    var onHoverChange = opts.onHoverChange || null; // (nodeOrNull)
    var tipEl = opts.tipEl || null;
    var wrapEl = opts.wrapEl || canvas.parentElement;
    var reactiveRoot = opts.reactiveRoot || null; // element to listen for proximity (hero)

    var ctx = canvas.getContext("2d");
    var angleX = Math.random()*Math.PI, angleY = Math.random()*Math.PI;
    var spinMulCur = 1, spinMulTarget = 1;
    var tiltX = 0, tiltY = 0, tiltXTarget = 0, tiltYTarget = 0;
    var boostUntil = 0;
    var cw=0, ch=0, dpr=1;
    var hoverNode = -1;
    var pointerLocal = null; // {x,y} in CSS px within canvas
    var nodeData = null;
    var maxAbsFC = 1;
    var carriers = [];
    var numCarriers = mode === "hero" ? 4 : (mode === "glyph" ? 2 : 0);
    var entranceStart = performance.now();
    var entranceDur = 600;
    var settling = false;
    var settleStart = 0;
    var settleExtra = 0;
    var destroyed = false;
    var staticDrawn = false;

    // round 4: unlock-sequence attention hooks (holdBreath / release)
    var holdMulCur = 1, holdMulTarget = 1;
    var breathing = false;
    var flashStart = 0, flashing = false, flashQuiet = false, flashUntil = 0;

    function resize(){
      var rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cw = Math.max(1, Math.round(rect.width));
      ch = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(cw*dpr);
      canvas.height = Math.round(ch*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      // changing canvas.width/height just wiped the pixel buffer — if we're
      // in the draw-once (reduced-motion) path, clear the "already drawn"
      // flag so the next tick redraws at the new size instead of staying
      // permanently blank after a hide/show cycle (e.g. workspace <-> welcome).
      staticDrawn = false;
    }
    resize();
    window.addEventListener("resize", resize);

    function refreshNodeData(){
      if (!getNodeData) return;
      var arr = getNodeData();
      if (!arr || !arr.length) return;
      nodeData = arr;
      maxAbsFC = 0;
      for (var i=0;i<arr.length;i++){
        maxAbsFC = Math.max(maxAbsFC, Math.abs(arr[i].log2FC || 0));
      }
      if (!maxAbsFC) maxAbsFC = 1;
    }
    refreshNodeData();

    for (var c=0;c<numCarriers;c++){
      carriers.push({ edge: Math.floor(Math.random()*GEO.edges.length), t: Math.random() });
    }

    // ---- pointer proximity reactivity (hero only) ----
    var prox = 0, proxTarget = 0;
    function onPointerMove(e){
      var rect = canvas.getBoundingClientRect();
      var lx = e.clientX - rect.left, ly = e.clientY - rect.top;
      pointerLocal = { x: lx, y: ly };
      if (reactiveRoot){
        var wrapRect = wrapEl.getBoundingClientRect();
        var cx = wrapRect.left + wrapRect.width/2, cy = wrapRect.top + wrapRect.height/2;
        var d = Math.hypot(e.clientX-cx, e.clientY-cy);
        proxTarget = clamp(1 - d/420, 0, 1);
      }
    }
    function onPointerLeave(){ proxTarget = 0; pointerLocal = null; hoverNode = -1; if (onHoverChange) onHoverChange(null); hideTip(); }
    if (reactiveRoot){
      reactiveRoot.addEventListener("pointermove", onPointerMove);
      reactiveRoot.addEventListener("pointerleave", onPointerLeave);
    } else {
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerleave", onPointerLeave);
    }
    if (mode === "hero"){
      canvas.addEventListener("click", function(){
        if (hoverNode >= 0 && nodeData && onNodeClick) onNodeClick(nodeData[hoverNode]);
      });
    }

    function hideTip(){ if (tipEl) tipEl.classList.remove("show"); }

    function fmtFC(v){
      if (v == null || isNaN(v)) return "—";
      var s = v > 0 ? "+" : "";
      return s + v.toFixed(3);
    }
    function fmtPadjText(v){
      if (v == null || isNaN(v)) return "—";
      if (v === 0) return "<1e-300";
      if (v < 0.001) return v.toExponential(1).replace("e-", "e-").replace("+","");
      return v.toPrecision(2);
    }
    window.ArtemisDodeca_fmtFC = fmtFC;
    window.ArtemisDodeca_fmtPadjText = fmtPadjText;

    function nodeColor(fc, secreted, near, hot){
      var alpha = 0.45 + 0.50*near;
      var base = fc > 0 ? [168,90,28] : [31,111,160]; // data-up / data-down
      return "rgba(" + base[0] + "," + base[1] + "," + base[2] + "," + alpha.toFixed(3) + ")";
    }

    // teal-glow(94,234,212) flash alpha for vertex idx at time `now`, during
    // the unlock-success ripple — 15ms stagger, ~300ms total, index order.
    function flashAlphaFor(idx, now){
      if (!flashing) return 0;
      var t = now - (flashStart + idx*15);
      if (t < 0 || t > 260) return 0;
      return Math.sin(Math.PI * clamp(t/260, 0, 1));
    }

    function draw(now){
      ctx.clearRect(0,0,cw,ch);
      var spinCfg = MODE_SPIN[mode] || MODE_SPIN.glyph;
      var size = Math.min(cw,ch);
      var scalePx = size * 0.40;

      var rx = angleX, ry = angleY;
      var faceAlphaBase = mode === "hero" ? 1 : 0;
      var dark = mode === "glyph" || mode === "cobrand";

      // project all verts
      var proj = GEO.verts.map(function(v){
        var rv = rotPoint(v, rx + tiltX, ry + tiltY);
        return project(rv, cw, ch, scalePx);
      });

      // faces (hero only, very subtle)
      if (mode === "hero"){
        GEO.faces.forEach(function(face){
          var avgZ = 0;
          face.forEach(function(idx){ avgZ += proj[idx].z; });
          avgZ /= face.length;
          var facing = clamp((avgZ+1)/2, 0, 1);
          ctx.beginPath();
          face.forEach(function(idx, k){
            var p = proj[idx];
            if (k===0) ctx.moveTo(p.x,p.y); else ctx.lineTo(p.x,p.y);
          });
          ctx.closePath();
          ctx.fillStyle = "rgba(15,118,110," + (0.018 + 0.050*facing).toFixed(3) + ")";
          ctx.fill();
        });
      }

      // edges
      var hotEdgeSet = {};
      if (hoverNode >= 0){
        GEO.edges.forEach(function(e, ei){
          if (e[0]===hoverNode || e[1]===hoverNode) hotEdgeSet[ei] = true;
        });
      }
      GEO.edges.forEach(function(e, ei){
        var p1 = proj[e[0]], p2 = proj[e[1]];
        var nearZ = clamp(((p1.z+p2.z)/2 + 1)/2, 0, 1);
        var hot = hotEdgeSet[ei];
        var edgeFlash = 0;
        if (flashing && !flashQuiet){
          edgeFlash = Math.max(flashAlphaFor(e[0], now), flashAlphaFor(e[1], now));
        }
        ctx.beginPath();
        ctx.moveTo(p1.x,p1.y); ctx.lineTo(p2.x,p2.y);
        if (edgeFlash > 0.02){
          ctx.strokeStyle = "rgba(45,212,191," + (0.35 + 0.6*edgeFlash).toFixed(3) + ")";
          ctx.lineWidth = 1.4;
        } else if (hot){
          ctx.strokeStyle = "rgba(17,94,89,0.92)";
          ctx.lineWidth = 1.8;
        } else if (dark){
          ctx.strokeStyle = "rgba(94,234,212," + (0.42+0.40*nearZ).toFixed(3) + ")";
          ctx.lineWidth = 0.9;
        } else {
          ctx.strokeStyle = "rgba(17,94,89," + (0.14+0.45*nearZ).toFixed(3) + ")";
          ctx.lineWidth = 1;
        }
        ctx.stroke();
      });

      // carriers (signal pulses)
      if (numCarriers > 0 && !reducedMotion){
        carriers.forEach(function(car){
          var e = GEO.edges[car.edge];
          var p1 = proj[e[0]], p2 = proj[e[1]];
          var trailDots = 5;
          for (var k=0;k<trailDots;k++){
            var tt = car.t - k*0.045;
            if (tt < 0) tt += 1;
            var x = lerp(p1.x,p2.x,tt), y = lerp(p1.y,p2.y,tt);
            var alpha = 0.55 * (1 - k*0.19);
            if (alpha <= 0) continue;
            ctx.beginPath();
            ctx.arc(x,y,1.6,0,Math.PI*2);
            ctx.fillStyle = dark ? "rgba(94,234,212," + alpha.toFixed(3) + ")" : "rgba(20,128,138," + alpha.toFixed(3) + ")";
            ctx.fill();
          }
        });
      }

      // nodes
      if (mode === "hero" && nodeData){
        var tNow = now;
        nodeData.forEach(function(d, idx){
          if (idx >= proj.length) return;
          var p = proj[idx];
          var near = clamp((p.z+1)/2, 0, 1);
          var hot = idx === hoverNode;
          var baseR = (2.2 + 2.6*near + 1.8*(Math.abs(d.log2FC||0)/maxAbsFC)) * (breathing ? 0.85 : 1);
          // entrance flash-in
          var appearAt = entranceStart + idx*30;
          var ef = clamp((tNow - appearAt)/entranceDur, 0, 1);
          var scaleMul = 1;
          if (ef < 1 && !reducedMotion){
            if (ef <= 0) { scaleMul = 0; }
            else {
              // spring overshoot to 1.6x then settle to 1
              var ov = Math.sin(ef*Math.PI) * 0.6 * (1-ef);
              scaleMul = ef + ov;
            }
          }
          var r = baseR * scaleMul + (hot ? 4*clamp((tNow-(hotSince||0))/120,0,1) : 0);
          if (r <= 0) return;
          var fAlpha = (flashing && !flashQuiet) ? flashAlphaFor(idx, tNow) : 0;
          ctx.beginPath();
          ctx.arc(p.x,p.y,r,0,Math.PI*2);
          ctx.fillStyle = fAlpha > 0.02
            ? "rgba(94,234,212," + (0.55 + 0.45*fAlpha).toFixed(3) + ")"
            : nodeColor(d.log2FC, d.secreted, near, hot);
          ctx.fill();
          if (d.secreted){
            ctx.beginPath();
            ctx.arc(p.x,p.y,r+1.4,0,Math.PI*2);
            ctx.strokeStyle = "rgba(15,118,110," + (0.3+0.4*near).toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      } else if (mode === "glyph"){
        proj.forEach(function(p){
          var near = clamp((p.z+1)/2, 0, 1);
          ctx.beginPath();
          ctx.arc(p.x,p.y,1.4,0,Math.PI*2);
          ctx.fillStyle = "rgba(153,246,228," + (0.45+0.50*near).toFixed(3) + ")";
          ctx.fill();
        });
      }
    }

    var hotSince = 0;
    function hitTest(){
      if (mode !== "hero" || !pointerLocal || !nodeData) { if (hoverNode!==-1){hoverNode=-1; if(onHoverChange) onHoverChange(null); hideTip();} return; }
      var size = Math.min(cw,ch);
      var scalePx = size * 0.40;
      var best = -1, bestD = 11;
      GEO.verts.forEach(function(v, idx){
        var rv = rotPoint(v, angleX+tiltX, angleY+tiltY);
        var p = project(rv, cw, ch, scalePx);
        var d = Math.hypot(p.x-pointerLocal.x, p.y-pointerLocal.y);
        if (d < bestD){ bestD = d; best = idx; }
      });
      if (best !== hoverNode){
        hoverNode = best;
        hotSince = performance.now();
        if (onHoverChange) onHoverChange(best>=0 && nodeData ? nodeData[best] : null);
        if (best>=0) canvas.style.cursor = "pointer"; else { canvas.style.cursor="default"; hideTip(); }
      }
    }

    var lastT = null;
    function tick(dt, now){
      if (destroyed) return;
      if (reducedMotion){
        if (!staticDrawn){ draw(now); staticDrawn = true; }
        hitTest();
        return;
      }
      // spin multiplier easing
      spinMulTarget = 1 + 1.6*prox;
      if (now < boostUntil) spinMulTarget = Math.max(spinMulTarget, 2.2);
      spinMulCur += (spinMulTarget - spinMulCur) * 0.08;
      prox += (proxTarget - prox) * 0.06;

      holdMulCur += (holdMulTarget - holdMulCur) * 0.1;
      if (flashing && now > flashUntil) flashing = false;

      tiltXTarget = reactiveRoot ? (pointerLocal ? clamp((pointerLocal.y/ch - 0.5)*2, -1, 1) * (0.09 + 0.17*prox) : 0) : 0;
      tiltYTarget = reactiveRoot ? (pointerLocal ? clamp((pointerLocal.x/cw - 0.5)*2, -1, 1) * (0.09 + 0.17*prox) : 0) : 0;
      tiltX += (tiltXTarget - tiltX) * 0.06;
      tiltY += (tiltYTarget - tiltY) * 0.06;

      var spinCfg = MODE_SPIN[mode] || MODE_SPIN.glyph;
      var mul = spinMulCur * holdMulCur;
      angleX += spinCfg.rx * dt * mul;
      angleY += spinCfg.ry * dt * mul;

      if (settling){
        var el = now - settleStart;
        if (el < 900){
          angleY += (Math.PI*2/ (900/1000)) * dt;
        } else {
          settling = false;
        }
      }

      carriers.forEach(function(car){
        car.t += 0.62 * mul * dt;
        if (car.t > 1){ car.t = 0; car.edge = Math.floor(Math.random()*GEO.edges.length); }
      });

      hitTest();
      draw(now);

      // tooltip positioning for hero (suppressed while holding breath for
      // the unlock prompt — the mark is paying attention, not inviting hover)
      if (mode === "hero" && tipEl){
        if (!breathing && hoverNode >= 0 && nodeData){
          var d = nodeData[hoverNode];
          var size = Math.min(cw,ch), scalePx = size*0.40;
          var rv = rotPoint(GEO.verts[hoverNode], angleX+tiltX, angleY+tiltY);
          var p = project(rv, cw, ch, scalePx);
          var fc = d.log2FC, lo = d.ci_lo, hi = d.ci_hi;
          tipEl.innerHTML = '<span class="g">'+d.gene+'</span><br>INT log2FC '+fmtFC(fc)+(lo!=null?'  ['+fmtFC(lo)+', '+fmtFC(hi)+']':'')+'<br>padj '+fmtPadjText(d.padj)+' · '+(d.compartment||'—')+(d.secreted?' · secreted':'');
          var left = p.x + 12, top = p.y - 10;
          if (left + 170 > cw) left = p.x - 182;
          tipEl.style.left = left+"px";
          tipEl.style.top = top+"px";
          tipEl.classList.add("show");
        } else {
          hideTip();
        }
      }
    }

    function hoverBoost(ms){ boostUntil = performance.now() + (ms||1400); }
    function settle(){ settling = true; settleStart = performance.now(); entranceStart = performance.now(); staticDrawn=false; }

    // round 4 — unlock sequence hooks. Defensive no-ops under reduced motion;
    // the unlock plate never depends on these for correctness.
    function holdBreath(){
      if (reducedMotion) return;
      holdMulTarget = 0.25;
      breathing = true;
    }
    function release(opts){
      opts = opts || {};
      breathing = false;
      holdMulTarget = 1;
      if (reducedMotion) return;
      if (!opts.quiet){
        flashing = true;
        flashQuiet = false;
        flashStart = performance.now();
        flashUntil = flashStart + 700;
      } else {
        flashing = false;
      }
    }
    function destroy(){
      destroyed = true;
      window.removeEventListener("resize", resize);
      if (reactiveRoot){
        reactiveRoot.removeEventListener("pointermove", onPointerMove);
        reactiveRoot.removeEventListener("pointerleave", onPointerLeave);
      } else {
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerleave", onPointerLeave);
      }
    }

    return {
      tick: tick,
      hoverBoost: hoverBoost,
      settle: settle,
      holdBreath: holdBreath,
      release: release,
      destroy: destroy,
      refreshNodeData: refreshNodeData,
      canvas: canvas,
      mode: mode
    };
  }

  window.ArtemisDodeca = { create: create, GEO: GEO, reducedMotion: reducedMotion };
})();
