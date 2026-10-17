/* MUSTECH – rüzgarda sallanan buğday tarlası (canvas animasyonu)
   Gündüz (açık tema) ve gece (koyu tema) görünümü vardır.
   Görünmeyen alanlarda ve arka plandaki sekmelerde durur, pil/işlemci harcamaz. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fields = [];

  var PALETTE = {
    light: {
      hills: ['#d6e6b4', '#c3da98'],
      stems: ['#d8c79a', '#cbac62', '#b8913f'],
      heads: ['#eadcab', '#e0bf6e', '#d4a645'],
      awns:  ['rgba(200,170,100,.55)', 'rgba(185,145,70,.6)', 'rgba(170,125,50,.7)'],
      dust: 'rgba(255,248,220,', stars: false
    },
    dark: {
      hills: ['#0c1a14', '#10221a'],
      stems: ['#1d2b22', '#3a432a', '#5f5a32'],
      heads: ['#2c3a2c', '#6b6238', '#a68b4a'],
      awns:  ['rgba(70,80,60,.5)', 'rgba(120,110,70,.55)', 'rgba(170,145,85,.6)'],
      dust: 'rgba(200,240,140,', stars: true
    }
  };

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function makeHead(L, fill, awn, dpr) {
    var w = L * 0.95, h = L * 1.6;
    var c = document.createElement('canvas');
    c.width = Math.ceil(w * dpr); c.height = Math.ceil(h * dpr);
    var g = c.getContext('2d');
    g.scale(dpr, dpr); g.translate(w / 2, h - 1);
    var n = 7, dx = L * 0.075;
    g.strokeStyle = awn; g.lineWidth = Math.max(0.5, L * 0.018); g.lineCap = 'round';
    g.beginPath();
    for (var i = 0; i < n; i++) {
      var y = -(i + 0.6) * (L / n) * 0.92;
      g.moveTo(-dx, y); g.lineTo(-dx - L * 0.2, y - L * 0.45);
      g.moveTo(dx, y - L * 0.04); g.lineTo(dx + L * 0.2, y - L * 0.49);
    }
    g.moveTo(0, -L * 0.98); g.lineTo(0, -L * 1.55);
    g.stroke();
    g.fillStyle = fill;
    for (var k = 0; k < n; k++) {
      var yy = -(k + 0.6) * (L / n) * 0.92, s = 1 - k / (n * 2.2);
      g.beginPath(); g.ellipse(-dx, yy, L * 0.085 * s, L * 0.15 * s, -0.42, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(dx, yy - L * 0.04, L * 0.085 * s, L * 0.15 * s, 0.42, 0, Math.PI * 2); g.fill();
    }
    g.beginPath(); g.ellipse(0, -L * 0.97, L * 0.065, L * 0.13, 0, 0, Math.PI * 2); g.fill();
    // ince parlaklık
    g.globalAlpha = 0.25; g.fillStyle = '#fff';
    for (var m = 0; m < n; m += 2) {
      var y2 = -(m + 0.6) * (L / n) * 0.92;
      g.beginPath(); g.ellipse(-dx - L * 0.02, y2 - L * 0.03, L * 0.025, L * 0.06, -0.42, 0, Math.PI * 2); g.fill();
    }
    return { img: c, w: w, h: h };
  }

  function Field(canvas, mode) {
    this.c = canvas; this.ctx = canvas.getContext('2d');
    this.mode = mode; this.visible = true; this.t0 = rnd(0, 100);
    this.m = { x: -999, y: -999, sx: -999, sy: -999, on: false, k: 0 };
    this.build();
  }

  Field.prototype.build = function () {
    var r = this.c.getBoundingClientRect();
    var W = this.W = Math.max(1, Math.round(r.width)), H = this.H = Math.max(1, Math.round(r.height));
    var dpr = this.dpr = Math.min(window.devicePixelRatio || 1, W < 700 ? 1.5 : 1.75);
    this.c.width = Math.round(W * dpr); this.c.height = Math.round(H * dpr);
    var theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    var P = this.P = PALETTE[theme];
    var small = W < 700;
    var base = this.mode === 'hero' ? Math.min(H, 820) : H * 2.1;

    var layers = this.mode === 'hero'
      ? [{ d: 5.5, h: [0.12, 0.18], L: 20, sway: 0.55 }, { d: 7, h: [0.17, 0.25], L: 27, sway: 0.8 }, { d: 10, h: [0.23, 0.35], L: 36, sway: 1 }]
      : [{ d: 16, h: [0.18, 0.3], L: 15, sway: 0.7 }, { d: 22, h: [0.28, 0.42], L: 19, sway: 1 }];
    if (this.mode === 'band') {
      var deep = getComputedStyle(document.documentElement).getPropertyValue('--footer-bg').trim() || '#0e2416';
      P = this.P = { stems: [deep, deep], heads: [deep, deep], awns: [deep, deep], band: true };
    }

    this.layers = layers.map(function (cfg, i) {
      var li = this.mode === 'hero' ? i : i;
      var count = Math.round(W / cfg.d * (small ? 0.75 : 1));
      var stalks = [];
      for (var k = 0; k < count; k++) {
        stalks.push({
          x: rnd(-20, W + 20), h: rnd(cfg.h[0], cfg.h[1]) * base,
          lean: rnd(-0.07, 0.09), ph: rnd(0, 6.28), s: rnd(0.85, 1.15)
        });
      }
      stalks.sort(function (a, b) { return a.h - b.h; });
      return {
        cfg: cfg, stalks: stalks,
        stem: P.stems[li], width: this.mode === 'hero' ? [0.8, 1.1, 1.5][i] : [1.2, 1.6][i],
        head: makeHead(cfg.L, P.heads[li], P.awns[li], dpr)
      };
    }, this);

    // toz / ateş böcekleri ve yıldızlar
    this.dust = [];
    this.stars = [];
    if (this.mode === 'hero') {
      for (var d = 0; d < (small ? 18 : 36); d++) this.dust.push({ x: rnd(0, W), y: rnd(H * 0.35, H), r: rnd(0.8, 2.4), v: rnd(0.2, 0.7), ph: rnd(0, 6.28) });
      if (P.stars) for (var s = 0; s < (small ? 40 : 90); s++) this.stars.push({ x: rnd(0, W), y: rnd(0, H * 0.55), r: rnd(0.4, 1.4), ph: rnd(0, 6.28) });
    }
  };

  Field.prototype.wind = function (x, t) {
    var W = this.W;
    var b = Math.sin(t * 1.05 + x * 0.0055) * 0.45 + Math.sin(t * 2.2 + x * 0.016) * 0.16;
    var gx = ((t * 170) % (W + 1400)) - 700;
    var g = Math.exp(-Math.pow((x - gx) / 230, 2)) * 0.85;
    return 0.3 + b + g;
  };

  Field.prototype.draw = function (now) {
    var ctx = this.ctx, W = this.W, H = this.H, dpr = this.dpr, P = this.P;
    var t = reduce ? 0 : now / 1000 + this.t0;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    if (this.mode === 'hero') {
      var base = Math.min(H, 820);
      // yıldızlar
      for (var s = 0; s < this.stars.length; s++) {
        var st = this.stars[s];
        ctx.globalAlpha = 0.35 + 0.45 * Math.abs(Math.sin(t * 0.8 + st.ph));
        ctx.fillStyle = '#e8f3ff';
        ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;
      // uzak tepeler
      ctx.fillStyle = P.hills[0];
      ctx.beginPath(); ctx.moveTo(0, H);
      ctx.lineTo(0, H - base * 0.34);
      ctx.bezierCurveTo(W * 0.25, H - base * 0.46, W * 0.45, H - base * 0.3, W * 0.65, H - base * 0.38);
      ctx.bezierCurveTo(W * 0.82, H - base * 0.45, W * 0.92, H - base * 0.36, W, H - base * 0.4);
      ctx.lineTo(W, H); ctx.fill();
      ctx.fillStyle = P.hills[1];
      ctx.beginPath(); ctx.moveTo(0, H);
      ctx.lineTo(0, H - base * 0.24);
      ctx.bezierCurveTo(W * 0.3, H - base * 0.3, W * 0.6, H - base * 0.2, W, H - base * 0.28);
      ctx.lineTo(W, H); ctx.fill();
    }

    // fare ışığı: imlecin arkasında yumuşak bir aydınlanma, buğdaylar imleçten kaçar
    var m = this.m;
    if (m.sx < -900) { m.sx = m.x; m.sy = m.y; }
    m.sx += (m.x - m.sx) * 0.14; m.sy += (m.y - m.sy) * 0.14;
    m.k += ((m.on ? 1 : 0) - m.k) * 0.07;
    if (this.mode === 'hero' && m.k > 0.01) {
      var R = Math.max(220, Math.min(W, H) * 0.38);
      var gl = ctx.createRadialGradient(m.sx, m.sy, 0, m.sx, m.sy, R);
      if (P.stars) {
        gl.addColorStop(0, 'rgba(190,240,130,' + (0.3 * m.k) + ')');
        gl.addColorStop(0.4, 'rgba(80,170,220,' + (0.12 * m.k) + ')');
      } else {
        gl.addColorStop(0, 'rgba(255,250,215,' + (0.75 * m.k) + ')');
        gl.addColorStop(0.45, 'rgba(255,236,170,' + (0.25 * m.k) + ')');
      }
      gl.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gl; ctx.fillRect(m.sx - R, m.sy - R, R * 2, R * 2);
    }
    var push = this.mode === 'hero' && m.k > 0.01;

    var groundY = H + 4;
    for (var li = 0; li < this.layers.length; li++) {
      var L = this.layers[li], cfg = L.cfg, head = L.head;
      var tips = [];
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.strokeStyle = L.stem; ctx.lineWidth = L.width; ctx.lineCap = 'round';
      ctx.beginPath();
      for (var k = 0; k < L.stalks.length; k++) {
        var p = L.stalks[k];
        var a = p.lean + this.wind(p.x, t + p.ph * 0.04) * cfg.sway * 0.3;
        if (push) {
          var dx = p.x - m.sx;
          if (dx > -180 && dx < 180) {
            var fy = 1 - Math.abs(m.sy - (groundY - p.h * 0.75)) / 240;
            if (fy > 0) a += (dx < 0 ? -1 : 1) * Math.exp(-(dx * dx) / 5200) * 0.6 * fy * m.k * cfg.sway;
          }
        }
        var sa = Math.sin(a), ca = Math.cos(a);
        var tx = p.x + sa * p.h, ty = groundY - ca * p.h;
        var cx = p.x + sa * p.h * 0.18, cy = groundY - p.h * 0.55;
        ctx.moveTo(p.x, groundY); ctx.quadraticCurveTo(cx, cy, tx, ty);
        tips.push(tx, ty, Math.atan2(tx - cx, cy - ty), p.s);
      }
      ctx.stroke();
      for (var q = 0; q < tips.length; q += 4) {
        var rot = tips[q + 2], sc = tips[q + 3];
        var cr = Math.cos(rot) * sc * dpr, sr = Math.sin(rot) * sc * dpr;
        ctx.setTransform(cr, sr, -sr, cr, tips[q] * dpr, tips[q + 1] * dpr);
        ctx.drawImage(head.img, -head.w / 2, -head.h + 1, head.w, head.h);
      }
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // uçuşan polen / ateş böcekleri
    if (this.dust.length) {
      for (var d = 0; d < this.dust.length; d++) {
        var u = this.dust[d];
        if (!reduce) {
          u.x += (u.v + this.wind(u.x, t) * 0.6); u.y += Math.sin(t * 1.4 + u.ph) * 0.25;
          if (u.x > W + 10) { u.x = -10; u.y = rnd(H * 0.35, H); }
        }
        var al = P.stars ? 0.35 + 0.5 * Math.abs(Math.sin(t * 1.7 + u.ph)) : 0.55;
        ctx.fillStyle = P.dust + al + ')';
        ctx.beginPath(); ctx.arc(u.x, u.y, u.r, 0, 6.283); ctx.fill();
        if (P.stars) { ctx.fillStyle = P.dust + (al * 0.18) + ')'; ctx.beginPath(); ctx.arc(u.x, u.y, u.r * 4, 0, 6.283); ctx.fill(); }
      }
    }
  };

  function init() {
    var hero = document.getElementById('wheatCanvas');
    var band = document.getElementById('footerWheat');
    if (hero) fields.push(new Field(hero, 'hero'));
    if (band) fields.push(new Field(band, 'band'));

    var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (fine && !reduce && fields[0] && fields[0].mode === 'hero') {
      var hf = fields[0], sec = document.getElementById('hero');
      sec.addEventListener('pointermove', function (e) {
        var r = hf.c.getBoundingClientRect();
        hf.m.x = e.clientX - r.left; hf.m.y = e.clientY - r.top; hf.m.on = true;
      });
      sec.addEventListener('pointerleave', function () { hf.m.on = false; });
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { fields.forEach(function (f) { if (f.c === e.target) f.visible = e.isIntersecting; }); });
      });
      fields.forEach(function (f) { io.observe(f.c); });
    }

    function frame(now) {
      if (!document.hidden) fields.forEach(function (f) { if (f.visible) f.draw(now); });
      requestAnimationFrame(frame);
    }
    function redrawAll() { fields.forEach(function (f) { f.build(); f.draw(performance.now()); }); }

    var rt, lastW = window.innerWidth;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        // mobilde adres çubuğu açılıp kapanınca yeniden kurma
        if (Math.abs(window.innerWidth - lastW) < 2 && window.innerWidth < 900) return;
        lastW = window.innerWidth; redrawAll();
      }, 200);
    });
    document.addEventListener('mt:theme', redrawAll);

    if (reduce) redrawAll();
    else requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
