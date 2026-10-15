/* MUSTECH – site davranışları */
(function () {
  'use strict';

  // İletişim formunun gönderileceği adres (değiştirmek için yalnızca burayı güncelleyin)
  var CONTACT_EMAIL = 'info@mustech.com.tr';

  var body = document.body;
  var navbar = document.getElementById('navbar');
  var menuBtn = document.getElementById('menuBtn');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Navbar: kaydırınca arka plan ---- */
  function onScroll() { navbar.classList.toggle('scrolled', window.scrollY > 40); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- Mobil menü ---- */
  function closeMenu() {
    body.classList.remove('nav-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Menüyü aç');
  }
  menuBtn.addEventListener('click', function () {
    var open = body.classList.toggle('nav-open');
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
  });
  document.querySelectorAll('.nav-links a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeMenu(); closeDropdown(); } });

  /* ---- Ürünler açılır menüsü (dokunmatik + klavye) ---- */
  var dd = document.querySelector('.dropdown');
  var ddBtn = dd.querySelector('.dd-toggle');
  function closeDropdown() { dd.classList.remove('open'); ddBtn.setAttribute('aria-expanded', 'false'); }
  ddBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = dd.classList.toggle('open');
    ddBtn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', function (e) { if (!dd.contains(e.target)) closeDropdown(); });
  dd.querySelectorAll('.dropdown-menu a').forEach(function (a) { a.addEventListener('click', closeDropdown); });

  /* ---- Aktif menü bağlantısı ---- */
  var links = document.querySelectorAll('.nav-links > li > a[href^="#"]');
  if ('IntersectionObserver' in window) {
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['about', 'process', 'products', 'services', 'contact', 'hero'].forEach(function (id) {
      var el = document.getElementById(id); if (el) secObs.observe(el);
    });
  }

  /* ---- Kaydırınca beliren öğeler ---- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); revObs.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { revObs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- Hero videosu: yalnızca geniş ekran + hızlı bağlantı ---- */
  var video = document.getElementById('heroVideo');
  var conn = navigator.connection || {};
  var slow = conn.saveData || /(^|-)2g$|^3g$/.test(conn.effectiveType || '');
  if (video && !reduceMotion && !slow && window.innerWidth >= 900) {
    var srcs = (video.getAttribute('data-src') || '').split('|').filter(Boolean);
    srcs.forEach(function (s) {
      var el = document.createElement('source'); el.src = s; el.type = 'video/mp4'; video.appendChild(el);
    });
    video.addEventListener('playing', function () { video.classList.add('ready'); }, { once: true });
    video.load();
    var p = video.play(); if (p && p.catch) p.catch(function () {});
  }

  /* ---- Örnek panelde canlı değer animasyonu ---- */
  if (!reduceMotion) {
    var moist = document.querySelector('[data-live="moist"]');
    var temp = document.querySelector('[data-live="temp"]');
    var ph = document.querySelector('[data-live="ph"]');
    var bMoist = document.querySelector('[data-bar="moist"]');
    var bTemp = document.querySelector('[data-bar="temp"]');
    var m = 34, t = 18.6, h = 6.8;
    function jitter(v, d, min, max) { return Math.min(max, Math.max(min, v + (Math.random() - 0.5) * d)); }
    setInterval(function () {
      if (document.hidden) return;
      m = jitter(m, 1.6, 30, 38); t = jitter(t, 0.4, 17.5, 20); h = jitter(h, 0.06, 6.6, 7.0);
      moist.textContent = Math.round(m); temp.textContent = t.toFixed(1); ph.textContent = h.toFixed(1);
      bMoist.style.width = Math.round(m) + '%'; bTemp.style.width = Math.round(t / 35 * 100) + '%';
    }, 2600);
  }

  /* ---- Ürün kartından "Bilgi alın" → konu otomatik seçilsin ---- */
  var topic = document.getElementById('f-topic');
  document.querySelectorAll('[data-product]').forEach(function (a) {
    a.addEventListener('click', function () { topic.value = a.getAttribute('data-product'); });
  });

  /* ---- İletişim formu: e-posta uygulamasında hazır mesaj açar ---- */
  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    var name = f.name.value.trim(), email = f.email.value.trim(), msg = f.message.value.trim();
    if (!name || !msg || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      status.style.color = '#ffb4a8';
      status.textContent = 'Lütfen ad, geçerli bir e-posta ve mesaj alanlarını doldurun.';
      return;
    }
    var subject = 'Web sitesi: ' + f.topic.value + ' – ' + name;
    var text = msg + '\n\n—\nAd Soyad: ' + name + '\nE-posta: ' + email + (f.phone.value.trim() ? '\nTelefon: ' + f.phone.value.trim() : '');
    window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text);
    status.style.color = '';
    status.textContent = 'E-posta uygulamanız açılıyor. Açılmazsa bize ' + CONTACT_EMAIL + ' adresinden yazabilirsiniz.';
  });

  /* ---- Yıl ---- */
  var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
})();
