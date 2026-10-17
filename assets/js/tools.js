/* MUSTECH – Tarla Araçları
   1) Hava durumu + tarım göstergeleri (ilaçlama, don, sulama, mantar riski)
   2) Sulama suyu hesaplayıcı (FAO-56: ETc = Kc × ET0)

   Hava verisi: OpenWeather (openweathermap.org) ücretsiz planı – ticari kullanıma izin verir, sayfada atıf gerekir.
   Anahtar almak için: openweathermap.org → ücretsiz hesap → "API keys". Anahtarı aşağıya yapıştırın.
   ANAHTAR BOŞ BIRAKILIRSA hava durumu kartı gizlenir, hesaplayıcı mevsim ortalamalarıyla çalışır. */
(function () {
  'use strict';

  var OWM_API_KEY = ''; // ← OpenWeather API anahtarı
  var OWM = 'https://api.openweathermap.org';
  var DEFAULT_LOC = { name: 'Kayseri', lat: 38.7205, lon: 35.4826 };
  var HAS_WX = !!OWM_API_KEY;
  window.MT_WEATHER = HAS_WX;
  var MT = window.MT || { lang: function () { return 'tr'; } };
  function L() { return MT.lang ? MT.lang() : 'tr'; }
  function $(id) { return document.getElementById(id); }
  function store(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function load(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function r1(n) { return Math.round(n * 10) / 10; }
  function fmt(n, d) { return Number(n).toLocaleString(L() === 'en' ? 'en-GB' : 'tr-TR', { maximumFractionDigits: d === undefined ? 1 : d }); }

  var T = {
    tr: {
      feels: 'Hissedilen', hum: 'Nem', wind: 'Rüzgar', rain: 'Yağış', kmh: 'km/sa',
      today: 'Bugün', err: 'Hava durumu şu an alınamadı. Lütfen biraz sonra tekrar deneyin.', retry: 'Tekrar dene',
      myLoc: 'Konumunuz', geoErr: 'Konum izni verilmedi.', noRes: 'Sonuç bulunamadı.',
      spray: 'İlaçlama', frost: 'Don riski', irrig: 'Sulama', fungus: 'Mantar hastalığı riski',
      ok: 'Uygun', warn: 'Dikkat', bad: 'Uygun değil',
      sprayOk: 'Önümüzdeki 6 saatte rüzgar {w} km/sa, yağış ihtimali %{p}. İlaçlama için uygun.',
      sprayWarn: 'Rüzgar {w} km/sa, yağış ihtimali %{p}, sıcaklık {t}°C. Dikkatli olun, sabah/akşam saatlerini tercih edin.',
      sprayBad: 'Rüzgar {w} km/sa, yağış ihtimali %{p}. İlaç sürüklenebilir veya yıkanabilir; ertelemeniz önerilir.',
      frostOk: 'Önümüzdeki 3 günde en düşük {t}°C. Don beklenmiyor.',
      frostWarn: '{d} gecesi {t}°C. Hassas ürünler için hafif don riski.',
      frostBad: '{d} gecesi {t}°C bekleniyor. Don önlemi alın.',
      irrRain: '3 gün içinde {r} mm yağış bekleniyor. Sulamayı erteleyebilirsiniz.',
      irrHigh: 'Bugün buharlaşma yüksek (ET₀ {e} mm). Toprak nemini kontrol edin, sulama gerekebilir.',
      irrLow: 'Bugün su kaybı düşük (ET₀ {e} mm).',
      fungLow: 'Nem ve sıcaklık koşulları mantar gelişimi için elverişli değil.',
      fungMid: '24 saatte {h} saat yüksek nem bekleniyor. Bitkileri gözlemleyin.',
      fungHigh: '24 saatte {h} saat yüksek nem ve ılık hava. Mantar riski yüksek; koruyucu önlemleri değerlendirin.',
      riskLow: 'Düşük', riskMid: 'Orta', riskHigh: 'Yüksek',
      et0Live: '· {p} için tahmini değer', et0Season: '· mevsim ortalaması',
      daily: 'Günlük bitki su tüketimi', weekly: 'Haftalık sulama suyu', perDa: 'dekar başına',
      rainCut: 'Beklenen {r} mm yağış düşüldü', methods: 'Yönteme göre haftalık su',
      save: '{m} yerine damla sulama ile haftada yaklaşık {v} m³ su tasarrufu.',
      bestNow: 'Damla sulama en verimli yöntemdir.', m3: 'm³', mm: 'mm'
    },
    en: {
      feels: 'Feels like', hum: 'Humidity', wind: 'Wind', rain: 'Rain', kmh: 'km/h',
      today: 'Today', err: 'Weather data is unavailable right now. Please try again shortly.', retry: 'Try again',
      myLoc: 'Your location', geoErr: 'Location permission was denied.', noRes: 'No results found.',
      spray: 'Spraying', frost: 'Frost risk', irrig: 'Irrigation', fungus: 'Fungal disease risk',
      ok: 'Suitable', warn: 'Caution', bad: 'Not suitable',
      sprayOk: 'Next 6 hours: wind {w} km/h, rain chance {p}%. Good conditions for spraying.',
      sprayWarn: 'Wind {w} km/h, rain chance {p}%, temperature {t}°C. Be careful; prefer early morning or evening.',
      sprayBad: 'Wind {w} km/h, rain chance {p}%. Spray may drift or wash off; better to postpone.',
      frostOk: 'Lowest in the next 3 days: {t}°C. No frost expected.',
      frostWarn: '{d} night: {t}°C. Slight frost risk for sensitive crops.',
      frostBad: '{d} night: {t}°C expected. Take frost precautions.',
      irrRain: '{r} mm of rain expected within 3 days. You can postpone irrigation.',
      irrHigh: 'High evaporation today (ET₀ {e} mm). Check soil moisture; irrigation may be needed.',
      irrLow: 'Low water loss today (ET₀ {e} mm).',
      fungLow: 'Humidity and temperature are not favorable for fungal growth.',
      fungMid: '{h} hours of high humidity expected in 24 h. Keep an eye on your crops.',
      fungHigh: '{h} hours of high humidity and mild weather in 24 h. High fungal risk; consider preventive measures.',
      riskLow: 'Low', riskMid: 'Medium', riskHigh: 'High',
      et0Live: '· estimated for {p}', et0Season: '· seasonal average',
      daily: 'Daily crop water use', weekly: 'Weekly irrigation water', perDa: 'per decare',
      rainCut: 'Expected {r} mm rain deducted', methods: 'Weekly water by method',
      save: 'Switching from {m} to drip saves about {v} m³ of water per week.',
      bestNow: 'Drip irrigation is the most efficient method.', m3: 'm³', mm: 'mm'
    }
  };
  function t(k, vars) {
    var s = (T[L()] || T.tr)[k] || T.tr[k] || k;
    if (vars) Object.keys(vars).forEach(function (v) { s = s.split('{' + v + '}').join(vars[v]); });
    return s;
  }

  /* OpenWeather hava kodları → simge */
  function icon(id, night) {
    if (id >= 200 && id < 300) return '⛈️';
    if (id >= 300 && id < 400) return '🌦️';
    if (id === 511) return '🌧️';
    if (id >= 500 && id < 600) return id < 502 ? '🌦️' : '🌧️';
    if (id >= 600 && id < 700) return '🌨️';
    if (id >= 700 && id < 800) return '🌫️';
    if (id === 800) return night ? '🌙' : '☀️';
    if (id === 801) return night ? '🌙' : '🌤️';
    if (id === 802) return '⛅';
    return '☁️';
  }
  function cap(s) { return s ? s.charAt(0).toLocaleUpperCase(L() === 'en' ? 'en' : 'tr') + s.slice(1) : ''; }

  /* Hargreaves-Samani ile referans buharlaşma (ET0, mm/gün) */
  function et0(tmax, tmin, latDeg, date) {
    var J = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 864e5);
    var phi = latDeg * Math.PI / 180;
    var dr = 1 + 0.033 * Math.cos(2 * Math.PI * J / 365);
    var dl = 0.409 * Math.sin(2 * Math.PI * J / 365 - 1.39);
    var ws = Math.acos(Math.max(-1, Math.min(1, -Math.tan(phi) * Math.tan(dl))));
    var Ra = 24 * 60 / Math.PI * 0.082 * dr * (ws * Math.sin(phi) * Math.sin(dl) + Math.cos(phi) * Math.cos(dl) * Math.sin(ws));
    var v = 0.0023 * ((tmax + tmin) / 2 + 17.8) * Math.sqrt(Math.max(0, tmax - tmin)) * Ra * 0.408;
    return Math.max(0, v);
  }

  /* ================= HAVA DURUMU ================= */
  var wxSec = $('wx');
  var data = null, loading = false;
  var loc = load('mt-loc') || DEFAULT_LOC;

  if (!HAS_WX && wxSec) {
    wxSec.remove(); wxSec = null;
    var grid = document.querySelector('.tools-grid'); if (grid) grid.classList.add('single');
    document.querySelectorAll('[data-wx-only]').forEach(function (el) { el.hidden = true; });
    document.querySelectorAll('[data-calc-only]').forEach(function (el) { el.hidden = false; });
  }

  function owm(path, extra) {
    return fetch(OWM + path + '?' + extra + '&appid=' + OWM_API_KEY).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  }

  // 3 saatlik tahmini yerel günlere topla
  function build(cur, fc) {
    var tz = fc.city.timezone || 0, days = {}, order = [];
    var key = function (dt) { return new Date((dt + tz) * 1000).toISOString().slice(0, 10); };
    fc.list.forEach(function (it) {
      var k = key(it.dt);
      if (!days[k]) { days[k] = { iso: k, max: -99, min: 99, rain: 0, pop: 0, ids: [] }; order.push(k); }
      var d = days[k];
      d.max = Math.max(d.max, it.main.temp_max); d.min = Math.min(d.min, it.main.temp_min);
      d.rain += (it.rain && it.rain['3h']) || 0; d.rain += (it.snow && it.snow['3h']) || 0;
      d.pop = Math.max(d.pop, Math.round((it.pop || 0) * 100));
      d.ids.push(it.weather[0].id);
    });
    var list = order.map(function (k) {
      var d = days[k];
      var worst = d.ids.slice().sort(function (a, b) { return a - b; })[0]; // en "olaylı" kod (yağış/fırtına öne çıkar)
      d.id = worst < 800 ? worst : d.ids[Math.floor(d.ids.length / 2)];
      return d;
    }).slice(0, 5);
    var next = fc.list.slice(0, 8);
    var tmax24 = Math.max.apply(null, next.map(function (x) { return x.main.temp_max; }).concat(cur.main.temp));
    var tmin24 = Math.min.apply(null, next.map(function (x) { return x.main.temp_min; }).concat(cur.main.temp));
    return {
      cur: cur, list: fc.list, days: list,
      et0: et0(tmax24, tmin24, fc.city.coord.lat, new Date()),
      rain7: list.reduce(function (a, d) { return a + d.rain; }, 0),
      night: /n$/.test(cur.weather[0].icon)
    };
  }

  function fetchWeather() {
    if (loading || !HAS_WX) return;
    loading = true;
    $('wxPlace').textContent = loc.name === '__me' ? t('myLoc') : loc.name;
    var q = 'lat=' + loc.lat + '&lon=' + loc.lon + '&units=metric&lang=' + (L() === 'en' ? 'en' : 'tr');
    Promise.all([owm('/data/2.5/weather', q), owm('/data/2.5/forecast', q)])
      .then(function (r) { data = build(r[0], r[1]); render(); calc(); })
      .catch(function () {
        $('wxNow').innerHTML = '<div class="wx-loading">' + t('err') + ' <button type="button" class="link-btn" id="wxRetry">' + t('retry') + '</button></div>';
        $('wxAgro').innerHTML = ''; $('wxDays').innerHTML = '';
        $('wxRetry').addEventListener('click', fetchWeather);
      })
      .then(function () { loading = false; });
  }

  function dayName(iso, i) {
    if (i === 0) return t('today');
    return new Date(iso + 'T12:00:00').toLocaleDateString(L() === 'en' ? 'en-GB' : 'tr-TR', { weekday: 'short' });
  }
  function dayLong(iso) { return new Date(iso + 'T12:00:00').toLocaleDateString(L() === 'en' ? 'en-GB' : 'tr-TR', { weekday: 'long' }); }

  function agroItems() {
    var c = data.cur, L8 = data.list.slice(0, 8), L2 = data.list.slice(0, 2), items = [];
    // İlaçlama: önümüzdeki ~6 saat
    var w6 = Math.round(Math.max.apply(null, L2.map(function (x) { return x.wind.speed * 3.6; }).concat(c.wind.speed * 3.6)));
    var p6 = Math.round(Math.max.apply(null, L2.map(function (x) { return (x.pop || 0) * 100; })));
    var tc = Math.round(c.main.temp);
    var sl = (w6 > 20 || p6 >= 60) ? 'bad' : (w6 > 12 || p6 >= 30 || tc < 5 || tc > 28) ? 'warn' : 'ok';
    items.push({ icon: 'i-flask', title: t('spray'), level: sl, tag: t(sl),
      text: t(sl === 'ok' ? 'sprayOk' : sl === 'warn' ? 'sprayWarn' : 'sprayBad', { w: w6, p: p6, t: tc }) });
    // Don: 3 gün
    var d3 = data.days.slice(0, 3), mi = 0;
    d3.forEach(function (d, k) { if (d.min < d3[mi].min) mi = k; });
    var tm = r1(d3[mi].min), fl = tm <= 0 ? 'bad' : tm <= 3 ? 'warn' : 'ok';
    items.push({ icon: 'i-snow', title: t('frost'), level: fl, tag: fl === 'ok' ? t('riskLow') : fl === 'warn' ? t('riskMid') : t('riskHigh'),
      text: t(fl === 'ok' ? 'frostOk' : fl === 'warn' ? 'frostWarn' : 'frostBad', { t: fmt(tm), d: dayLong(d3[mi].iso) }) });
    // Sulama
    var r3 = r1(data.list.slice(0, 24).reduce(function (a, x) { return a + ((x.rain && x.rain['3h']) || 0); }, 0)), e0 = r1(data.et0);
    items.push({ icon: 'i-drop', title: t('irrig'), level: r3 >= 10 ? 'info' : e0 >= 4 ? 'warn' : 'ok', tag: 'ET₀ ' + fmt(e0) + ' mm',
      text: r3 >= 10 ? t('irrRain', { r: fmt(r3) }) : t(e0 >= 4 ? 'irrHigh' : 'irrLow', { e: fmt(e0) }) });
    // Mantar: 24 saat
    var hrs = 3 * L8.filter(function (x) { return x.main.humidity >= 85 && x.main.temp >= 10 && x.main.temp <= 25; }).length;
    var gl = hrs >= 10 ? 'bad' : hrs >= 5 ? 'warn' : 'ok';
    items.push({ icon: 'i-sprout', title: t('fungus'), level: gl, tag: gl === 'ok' ? t('riskLow') : gl === 'warn' ? t('riskMid') : t('riskHigh'),
      text: t(gl === 'ok' ? 'fungLow' : gl === 'warn' ? 'fungMid' : 'fungHigh', { h: hrs }) });
    return items;
  }

  function render() {
    if (!data || !wxSec) return;
    var c = data.cur, d0 = data.days[0];
    var hum = Math.round(c.main.humidity);
    $('wxPlace').textContent = loc.name === '__me' ? (c.name || t('myLoc')) : loc.name;
    $('wxNow').innerHTML =
      '<div class="wx-temp"><span class="wx-ico" aria-hidden="true">' + icon(c.weather[0].id, data.night) + '</span><b>' + Math.round(c.main.temp) + '°</b>' +
      '<div><strong>' + cap(c.weather[0].description) + '</strong><small>' + t('feels') + ' ' + Math.round(c.main.feels_like) + '° · ' +
      Math.round(d0.max) + '° / ' + Math.round(d0.min) + '°</small></div></div>' +
      '<ul class="wx-stats">' +
      '<li><small>' + t('hum') + '</small><b>' + (L() === 'en' ? hum + '%' : '%' + hum) + '</b></li>' +
      '<li><small>' + t('wind') + '</small><b>' + Math.round(c.wind.speed * 3.6) + ' ' + t('kmh') + '</b></li>' +
      '<li><small>' + t('rain') + '</small><b>' + fmt(d0.rain) + ' mm</b></li></ul>';
    $('wxAgro').innerHTML = agroItems().map(function (it) {
      return '<div class="agro-item lv-' + it.level + '"><div class="agro-top"><span class="agro-ico"><svg><use href="#' + it.icon + '"/></svg></span>' +
        '<b>' + it.title + '</b><em>' + it.tag + '</em></div><p>' + it.text + '</p></div>';
    }).join('');
    $('wxDays').innerHTML = data.days.map(function (d, i) {
      return '<div class="day' + (i === 0 ? ' now' : '') + '"><small>' + dayName(d.iso, i) + '</small><span aria-hidden="true">' + icon(d.id, false) + '</span>' +
        '<b>' + Math.round(d.max) + '°</b><i>' + Math.round(d.min) + '°</i><em class="' + (d.pop >= 50 ? 'wet' : '') + '">💧' + d.pop + '%</em></div>';
    }).join('');
  }

  function setLoc(l) { loc = l; store('mt-loc', l); data = null; fetchWeather(); }

  if (wxSec) {
    var results = $('wxResults');
    $('wxSearch').addEventListener('submit', function (e) {
      e.preventDefault();
      var q = $('wxQuery').value.trim(); if (q.length < 2) return;
      owm('/geo/1.0/direct', 'q=' + encodeURIComponent(q) + '&limit=6')
        .then(function (list) {
          results.hidden = false;
          if (!list || !list.length) { results.innerHTML = '<p>' + t('noRes') + '</p>'; return; }
          results.innerHTML = '';
          list.forEach(function (p) {
            var nm = (p.local_names && p.local_names[L() === 'en' ? 'en' : 'tr']) || p.name;
            var b = document.createElement('button');
            b.type = 'button'; b.innerHTML = '<b></b><small></small>';
            b.firstChild.textContent = nm;
            b.lastChild.textContent = [p.state, p.country].filter(Boolean).join(', ');
            b.addEventListener('click', function () {
              results.hidden = true; $('wxQuery').value = '';
              setLoc({ name: nm, lat: Math.round(p.lat * 1e4) / 1e4, lon: Math.round(p.lon * 1e4) / 1e4 });
            });
            results.appendChild(b);
          });
        })
        .catch(function () { results.hidden = false; results.innerHTML = '<p>' + t('err') + '</p>'; });
    });
    document.addEventListener('click', function (e) { if (!$('wxSearch').contains(e.target)) results.hidden = true; });
    $('wxGeo').addEventListener('click', function () {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(function (p) {
        setLoc({ name: '__me', lat: Math.round(p.coords.latitude * 100) / 100, lon: Math.round(p.coords.longitude * 100) / 100 });
      }, function () { $('wxPlace').textContent = t('geoErr'); }, { timeout: 10000, maximumAge: 600000 });
    });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); fetchWeather(); } }, { rootMargin: '600px 0px' });
      io.observe(wxSec);
    } else fetchWeather();
  }

  /* ================= SULAMA HESAPLAYICI ================= */
  // FAO-56 bitki katsayıları (Kc): başlangıç, orta dönem, olgunlaşma
  var KC = {
    wheat: [0.4, 1.15, 0.3], barley: [0.3, 1.15, 0.25], maize: [0.3, 1.2, 0.35], beet: [0.35, 1.2, 0.7],
    sunflower: [0.35, 1.1, 0.35], potato: [0.5, 1.15, 0.75], tomato: [0.6, 1.15, 0.8], alfalfa: [0.4, 0.95, 0.9]
  };
  // Orta Anadolu için yaklaşık aylık ortalama ET0 (mm/gün)
  var ET0_MONTH = [0.7, 1.1, 2.0, 3.2, 4.3, 5.6, 6.6, 6.0, 4.3, 2.5, 1.2, 0.7];
  var et0Input = $('cEt0'), et0Touched = false;
  et0Input.value = ET0_MONTH[new Date().getMonth()];
  et0Input.addEventListener('input', function () { et0Touched = true; $('cEt0Src').textContent = ''; calc(); });

  function kc(crop, stage) {
    var k = KC[crop] || KC.wheat;
    return stage === 'ini' ? k[0] : stage === 'mid' ? k[1] : stage === 'end' ? k[2] : (k[0] + k[1]) / 2;
  }

  function calc() {
    if (data && !et0Touched) {
      et0Input.value = r1(data.et0);
      $('cEt0Src').textContent = t('et0Live', { p: loc.name === '__me' ? (data.cur.name || t('myLoc')) : loc.name });
    } else if (!et0Touched) $('cEt0Src').textContent = t('et0Season');

    var area = Math.max(0, parseFloat($('cArea').value) || 0);
    var et0 = Math.max(0, parseFloat(et0Input.value) || 0);
    var eff = parseFloat($('cMethod').value) || 0.75;
    var etc = kc($('cCrop').value, $('cStage').value) * et0;              // mm/gün
    var rain7 = data ? data.rain7 : 0;
    var netWeek = Math.max(0, etc * 7 - 0.8 * rain7);                      // mm/hafta (etkili yağış %80)
    var gross = function (e) { return netWeek * area / e; };              // 1 mm × 1 dekar = 1 m³
    var methods = [[0.5, 'm.surface'], [0.75, 'm.sprinkler'], [0.9, 'm.drip']];
    var maxV = gross(0.5) || 1;
    var mName = function (key) { var el = document.querySelector('#cMethod option[data-i18n="' + key + '"]'); return el ? el.textContent : key; };
    var cur = methods.filter(function (m) { return m[0] === eff; })[0] || methods[1];

    var html =
      '<div class="calc-kpis">' +
      '<div><small>' + t('daily') + '</small><b>' + fmt(etc) + ' <em>mm</em></b><span>' + fmt(etc, 1) + ' m³ ' + t('perDa') + '</span></div>' +
      '<div class="hl"><small>' + t('weekly') + '</small><b>' + fmt(gross(eff), 0) + ' <em>m³</em></b><span>' + fmt(area) + ' da · ' + mName(cur[1]) + '</span></div>' +
      '</div>';
    if (rain7 > 0.5) html += '<p class="calc-note">🌧️ ' + t('rainCut', { r: fmt(rain7) }) + '</p>';
    html += '<div class="bars"><small>' + t('methods') + '</small>' + methods.map(function (m) {
      var v = gross(m[0]);
      return '<div class="bar-row' + (m[0] === eff ? ' sel' : '') + '"><span>' + mName(m[1]) + '</span><div class="bar-track"><i style="width:' +
        Math.max(3, v / maxV * 100) + '%"></i></div><b>' + fmt(v, 0) + ' m³</b></div>';
    }).join('') + '</div>';
    var saving = gross(eff) - gross(0.9);
    html += '<p class="calc-save">💧 ' + (saving > 0.5 ? t('save', { m: mName(cur[1]).toLocaleLowerCase(L() === 'en' ? 'en' : 'tr'), v: fmt(saving, 0) }) : t('bestNow')) + '</p>';
    $('calcOut').innerHTML = html;
  }
  ['cCrop', 'cStage', 'cArea', 'cMethod'].forEach(function (id) { $(id).addEventListener('input', calc); $(id).addEventListener('change', calc); });
  calc();

  document.addEventListener('mt:lang', function () { if (data) fetchWeather(); calc(); });
})();
