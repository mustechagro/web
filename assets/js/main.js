/* MUSTECH – site davranışları: tema, dil, menü, form */
(function () {
  'use strict';

  // İletişim formunun gideceği adres (değiştirmek için yalnızca burayı güncelleyin)
  var CONTACT_EMAIL = 'mustechagro@gmail.com';

  var root = document.documentElement;
  var body = document.body;
  var navbar = document.getElementById('navbar');
  var menuBtn = document.getElementById('menuBtn');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DICT = window.MT_I18N || { en: {}, js: { tr: {}, en: {} } };

  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function emit(name, detail) { document.dispatchEvent(new CustomEvent(name, { detail: detail })); }

  /* ================= DİL ================= */
  var TR = {}; // Türkçe metinler sayfadan okunur
  var attrs = [['data-i18n', 'text'], ['data-i18n-html', 'html'], ['data-i18n-ph', 'ph'], ['data-i18n-aria', 'aria']];
  attrs.forEach(function (a) {
    document.querySelectorAll('[' + a[0] + ']').forEach(function (el) {
      var key = el.getAttribute(a[0]);
      if (TR[key] !== undefined) return;
      TR[key] = a[1] === 'text' ? el.textContent : a[1] === 'html' ? el.innerHTML :
                a[1] === 'ph' ? el.getAttribute('placeholder') : el.getAttribute('aria-label');
    });
  });
  TR['meta.title'] = document.title;
  var metaDesc = document.querySelector('meta[name="description"]');
  TR['meta.desc'] = metaDesc.getAttribute('content');

  function t(key) {
    var l = root.lang === 'en' ? 'en' : 'tr';
    var d = l === 'en' ? DICT.en : TR;
    return d[key] !== undefined ? d[key] : TR[key];
  }
  function tjs(key) { return (DICT.js[root.lang === 'en' ? 'en' : 'tr'] || {})[key] || ''; }

  function applyLang(lang) {
    root.lang = lang;
    attrs.forEach(function (a) {
      document.querySelectorAll('[' + a[0] + ']').forEach(function (el) {
        var v = t(el.getAttribute(a[0])); if (v === undefined) return;
        if (a[1] === 'text') el.textContent = v;
        else if (a[1] === 'html') el.innerHTML = v;
        else if (a[1] === 'ph') el.setAttribute('placeholder', v);
        else el.setAttribute('aria-label', v);
      });
    });
    document.title = t('meta.title');
    metaDesc.setAttribute('content', t('meta.desc'));
    document.getElementById('langLabel').textContent = lang === 'en' ? 'TR' : 'EN';
    document.getElementById('langBtn').setAttribute('aria-label', tjs('langSwitch'));
    menuBtn.setAttribute('aria-label', tjs('menu'));
    updateThemeLabel();
    emit('mt:lang', lang);
  }
  document.getElementById('langBtn').addEventListener('click', function () {
    var next = root.lang === 'en' ? 'tr' : 'en';
    store('mt-lang', next); applyLang(next);
  });

  /* ================= TEMA ================= */
  var themeBtn = document.getElementById('themeBtn');
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  function updateThemeLabel() {
    themeBtn.setAttribute('aria-label', tjs(root.getAttribute('data-theme') === 'dark' ? 'themeToLight' : 'themeToDark'));
  }
  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    themeMeta.setAttribute('content', theme === 'dark' ? '#08120c' : '#0e2416');
    updateThemeLabel();
    emit('mt:theme', theme);
  }
  themeBtn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    store('mt-theme', next); applyTheme(next);
  });

  window.MT = { t: t, tjs: tjs, lang: function () { return root.lang === 'en' ? 'en' : 'tr'; },
                theme: function () { return root.getAttribute('data-theme'); }, email: CONTACT_EMAIL };

  /* ================= MENÜ ================= */
  var progress = document.getElementById('progress'), toTop = document.getElementById('toTop');
  function onScroll() {
    var y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
    navbar.classList.toggle('scrolled', y > 40);
    if (progress) progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
    if (toTop) toTop.classList.toggle('show', y > window.innerHeight * 0.9);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  function closeMenu() { body.classList.remove('nav-open'); menuBtn.setAttribute('aria-expanded', 'false'); }
  menuBtn.addEventListener('click', function () {
    var open = body.classList.toggle('nav-open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  document.querySelectorAll('.nav-links a').forEach(function (a) { a.addEventListener('click', closeMenu); });

  var dd = document.querySelector('.dropdown');
  var ddBtn = dd.querySelector('.dd-toggle');
  function closeDropdown() { dd.classList.remove('open'); ddBtn.setAttribute('aria-expanded', 'false'); }
  ddBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    ddBtn.setAttribute('aria-expanded', String(dd.classList.toggle('open')));
  });
  document.addEventListener('click', function (e) { if (!dd.contains(e.target)) closeDropdown(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeMenu(); closeDropdown(); } });

  var links = document.querySelectorAll('.nav-links > li > a[href^="#"]');
  if ('IntersectionObserver' in window) {
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) links.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['hero', 'about', 'process', 'products', 'tools', 'services', 'faq', 'contact'].forEach(function (id) {
      var el = document.getElementById(id); if (el) secObs.observe(el);
    });
  }

  /* ================= KAYDIRINCA BELİRME ================= */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); revObs.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { revObs.observe(el); });
  } else reveals.forEach(function (el) { el.classList.add('in'); });

  /* ================= ÖRNEK PANEL ================= */
  if (!reduceMotion) {
    var q = function (s) { return document.querySelector(s); };
    var mEl = q('[data-live="moist"]'), tEl = q('[data-live="temp"]'), pEl = q('[data-live="ph"]');
    var bM = q('[data-bar="moist"]'), bT = q('[data-bar="temp"]');
    var m = 34, tt = 18.6, h = 6.8;
    var j = function (v, d, a, b) { return Math.min(b, Math.max(a, v + (Math.random() - 0.5) * d)); };
    setInterval(function () {
      if (document.hidden) return;
      m = j(m, 1.6, 30, 38); tt = j(tt, 0.4, 17.5, 20); h = j(h, 0.06, 6.6, 7.0);
      mEl.textContent = Math.round(m); tEl.textContent = tt.toFixed(1); pEl.textContent = h.toFixed(1);
      bM.style.width = Math.round(m) + '%'; bT.style.width = Math.round(tt / 35 * 100) + '%';
    }, 2600);
  }

  /* ================= İLETİŞİM FORMU ================= */
  var topic = document.getElementById('f-topic');
  document.querySelectorAll('[data-product]').forEach(function (a) {
    a.addEventListener('click', function () { topic.value = a.getAttribute('data-product'); });
  });
  window.MT.setTopic = function (v) { topic.value = v; };

  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');
  var btn = document.getElementById('formBtn');
  function setStatus(msg, kind) { status.textContent = msg; status.className = 'form-status' + (kind ? ' ' + kind : ''); }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    var data = {
      name: f.name.value.trim(), email: f.email.value.trim(), phone: f.phone.value.trim(),
      topic: f.topic.value, message: f.message.value.trim()
    };
    if (f._honey.value) return; // spam botu
    if (!data.name || !data.message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) { setStatus(tjs('invalid'), 'err'); return; }

    var subject = 'Web sitesi: ' + data.topic + ' – ' + data.name;
    btn.disabled = true; setStatus(tjs('sending'));

    fetch('https://formsubmit.co/ajax/' + CONTACT_EMAIL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        'Ad Soyad': data.name, 'E-posta': data.email, 'Telefon': data.phone || '-', 'Konu': data.topic,
        'Mesaj': data.message, 'Dil': root.lang, _replyto: data.email, _subject: subject, _template: 'table', _captcha: 'false'
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (String(res.success) !== 'true') throw new Error(res.message || 'failed');
        setStatus(tjs('ok'), 'ok'); form.reset();
      })
      .catch(function () {
        setStatus(tjs('fail'), 'err');
        var text = data.message + '\n\n—\n' + data.name + '\n' + data.email + (data.phone ? '\n' + data.phone : '');
        window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text);
      })
      .then(function () { btn.disabled = false; });
  });

  /* ================= BAŞLAT ================= */
  document.getElementById('year').textContent = new Date().getFullYear();
  applyTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
  applyLang(root.lang === 'en' ? 'en' : 'tr');
})();
