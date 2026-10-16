/* MUSTECH Asistan – sitedeki bilgilere dayanarak soruları yanıtlayan iki dilli asistan.
   Yeni bir soru/cevap eklemek için aşağıdaki INTENTS listesine bir öğe ekleyin:
   kw = anahtar kelimeler (küçük harf, Türkçe karakter kullanmadan da yazılabilir),
   tr / en = cevaplar, go = (isteğe bağlı) cevabın altındaki düğme. */
(function () {
  'use strict';
  var MT = window.MT || { lang: function () { return 'tr'; }, email: 'mustechagro@gmail.com' };
  var EMAIL = MT.email;

  var INTENTS = [
    { id: 'greet', kw: ['merhaba', 'selam', 'slm', 'mrb', 'gunaydin', 'iyi gunler', 'iyi aksamlar', 'hello', 'hi', 'hey', 'good morning'],
      tr: 'Merhaba! 👋 Ben MUSTECH Asistan. Ürünlerimiz, hizmetlerimiz, kurulum, fiyat teklifi veya iletişim hakkında sorabilirsiniz.',
      en: 'Hello! 👋 I’m the MUSTECH Assistant. Ask me about our products, services, installation, quotes or how to reach us.' },
    { id: 'thanks', kw: ['tesekkur', 'sagol', 'sag ol', 'eyvallah', 'thanks', 'thank you', 'thx', 'cok iyi', 'super'],
      tr: 'Rica ederim! Başka bir sorunuz olursa buradayım. 🌾', en: 'You’re welcome! I’m here if you have any other questions. 🌾' },
    { id: 'bye', kw: ['gorusuruz', 'hoscakal', 'iyi gunler dilerim', 'bye', 'goodbye', 'see you'],
      tr: 'Görüşmek üzere! Bol bereketli günler dileriz. 🌾', en: 'See you! Wishing you bountiful harvests. 🌾' },

    { id: 'products', kw: ['urun', 'urunler', 'neler sat', 'ne sat', 'cozum', 'katalog', 'product', 'products', 'solution', 'what do you sell', 'what do you offer', 'offer'],
      tr: 'Altı ürünümüz var:<br>• Akıllı Sulama Sistemi<br>• Toprak Analiz Sensörü<br>• Drone Görüntüleme Modülü<br>• Tarla Yönetim Yazılımı<br>• Hava Durumu İstasyonu<br>• Gübre Optimizasyon Platformu<br>Hangisi hakkında bilgi almak istersiniz?',
      en: 'We offer six products:<br>• Smart Irrigation System<br>• Soil Analysis Sensor<br>• Drone Imaging Module<br>• Farm Management Software<br>• Weather Station<br>• Fertilizer Optimization Platform<br>Which one would you like to know more about?',
      go: { href: '#products', tr: 'Ürünleri gör', en: 'See products' },
      chips: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'] },

    { id: 'p1', kw: ['sulama', 'damla', 'yagmurlama', 'su tasarruf', 'irrigation', 'irrigate', 'watering', 'sprinkler', 'drip'],
      tr: '<b>Akıllı Sulama Sistemi</b>, toprak nem sensörleri ve hava durumu verisini kullanarak sulamayı otomatik zamanlar. Gereksiz sulamayı önleyerek su tasarrufu sağlar ve verimi artırır; sistemi uzaktan da kontrol edebilirsiniz.',
      en: 'The <b>Smart Irrigation System</b> schedules irrigation automatically using soil moisture sensors and weather data. It prevents over-watering, saves water and boosts yield, and you can control it remotely.',
      go: { href: '#urun-sulama', tr: 'Ürüne git', en: 'View product' }, topic: 'Akıllı Sulama Sistemi' },
    { id: 'p2', kw: ['toprak', 'ph', 'besin', 'nem sensor', 'toprak analiz', 'soil', 'nutrient', 'moisture sensor', 'sensor', 'sensör'],
      tr: '<b>Toprak Analiz Sensörü</b>, kablosuz bir sensör ağıdır. pH, nem, sıcaklık ve besin değerlerini gerçek zamanlı ölçer; verileri yazılımımıza aktarır.',
      en: 'The <b>Soil Analysis Sensor</b> is a wireless sensor network that measures pH, moisture, temperature and nutrient levels in real time and sends the data to our software.',
      go: { href: '#urun-toprak', tr: 'Ürüne git', en: 'View product' }, topic: 'Toprak Analiz Sensörü' },
    { id: 'p3', kw: ['drone', 'dron', 'iha', 'goruntu', 'kamera', 'multispektral', 'harita', 'ndvi', 'imaging', 'camera', 'multispectral', 'map', 'aerial'],
      tr: '<b>Drone Görüntüleme Modülü</b>, multispektral kamera ile tarlanızın bitki sağlığı haritasını çıkarır. Yapay zeka, sorunlu bölgeleri erkenden tespit etmenize yardımcı olur.',
      en: 'The <b>Drone Imaging Module</b> maps your field’s crop health with a multispectral camera. AI helps you spot problem areas early.',
      go: { href: '#urun-drone', tr: 'Ürüne git', en: 'View product' }, topic: 'Drone Görüntüleme Modülü' },
    { id: 'p4', kw: ['yazilim', 'uygulama', 'program', 'panel', 'tarla yonetim', 'hasat', 'ekim', 'maliyet takip', 'software', 'app', 'platform', 'dashboard', 'farm management', 'harvest', 'planting'],
      tr: '<b>Tarla Yönetim Yazılımı</b> ile tüm operasyonlarınızı tek ekrandan yönetirsiniz: ekim planı, hasat takvimi ve maliyet takibi. Sensör ve istasyon verileri de burada toplanır.',
      en: 'With the <b>Farm Management Software</b> you manage everything from one screen: planting plans, harvest calendar and cost tracking. Sensor and station data are collected here too.',
      go: { href: '#urun-yazilim', tr: 'Ürüne git', en: 'View product' }, topic: 'Tarla Yönetim Yazılımı' },
    { id: 'p5', kw: ['hava durumu', 'hava', 'iklim', 'istasyon', 'yagmur', 'yagis', 'ruzgar', 'uv', 'weather', 'climate', 'station', 'rain', 'wind', 'frost'],
      tr: '<b>Hava Durumu İstasyonu</b>, tarlanızın başında mikro-iklim verisi toplar: yağış, rüzgar, nem ve UV endeksi. Böylece genel tahminler yerine kendi tarlanızın verisiyle karar verirsiniz.',
      en: 'The <b>Weather Station</b> collects micro-climate data right at your field: rainfall, wind, humidity and UV index, so you decide based on your own field rather than general forecasts.',
      go: { href: '#urun-hava', tr: 'Ürüne git', en: 'View product' }, topic: 'Hava Durumu İstasyonu' },
    { id: 'p6', kw: ['gubre', 'gubreleme', 'azot', 'fosfor', 'potasyum', 'doz', 'fertilizer', 'fertiliser', 'nitrogen', 'dose', 'dosage'],
      tr: '<b>Gübre Optimizasyon Platformu</b>, toprak analizi ve bitkinin ihtiyacına göre doğru gübre dozunu hesaplayan bir yapay zeka motorudur. Fazla gübre kullanımını ve maliyeti azaltır.',
      en: 'The <b>Fertilizer Optimization Platform</b> is an AI engine that calculates the right fertilizer dose from soil analysis and crop needs, reducing overuse and cost.',
      go: { href: '#urun-gubre', tr: 'Ürüne git', en: 'View product' }, topic: 'Gübre Optimizasyon Platformu' },

    { id: 'price', kw: ['fiyat', 'ucret', 'kac para', 'kaca', 'kac tl', 'maliyet', 'teklif', 'pahali', 'odeme', 'taksit', 'price', 'pricing', 'cost', 'quote', 'how much', 'payment'],
      tr: 'Fiyatlar; tarla büyüklüğüne, ürün tipine ve kurulum ihtiyacına göre değiştiği için size özel teklif hazırlıyoruz. İletişim formundan tarlanızın büyüklüğünü ve ilgilendiğiniz ürünü yazmanız yeterli.',
      en: 'Pricing depends on field size, product type and installation needs, so we prepare a custom quote. Just send us your field size and the product you’re interested in via the contact form.',
      go: { href: '#contact', tr: 'Teklif iste', en: 'Request a quote' } },
    { id: 'install', kw: ['kurulum', 'montaj', 'kurmak', 'kim kuruyor', 'devreye', 'install', 'installation', 'setup', 'set up'],
      tr: 'Kurulumu uzman saha ekibimiz yapar: cihazları tarlanıza yerleştirir, yapılandırır ve devreye alır. Ardından kullanım eğitimi de veriyoruz.',
      en: 'Our expert field team handles installation: they place, configure and commission the devices in your field, then provide usage training.',
      go: { href: '#services', tr: 'Hizmetler', en: 'Services' } },
    { id: 'support', kw: ['destek', 'servis', 'ariza', 'bozuldu', 'calismiyor', 'sorun', 'bakim', 'kalibrasyon', 'garanti', 'support', 'service', 'broken', 'not working', 'problem', 'issue', 'maintenance', 'warranty', '7/24', '24/7'],
      tr: '7/24 teknik destek sunuyoruz: telefon, uzaktan bağlantı ve gerektiğinde saha ziyareti. Ayrıca sensör kalibrasyonu, yazılım güncellemeleri ve donanım bakımı için periyodik servis paketlerimiz var.',
      en: 'We provide 24/7 technical support by phone, remote access and on-site visits when needed. We also offer periodic service packages for sensor calibration, software updates and hardware maintenance.',
      go: { href: '#contact', tr: 'Destek talebi', en: 'Request support' }, topic: 'Teknik destek' },
    { id: 'training', kw: ['egitim', 'kurs', 'sertifika', 'ogren', 'nasil kullan', 'training', 'course', 'certificate', 'learn', 'how to use'],
      tr: 'Çiftçiler ve teknik personel için ürün kullanım eğitimleri ve sertifika programları düzenliyoruz.',
      en: 'We run product training and certification programs for farmers and technical staff.' },
    { id: 'data', kw: ['rapor', 'analiz', 'veri', 'yapay zeka', 'ai', 'report', 'analysis', 'data', 'artificial intelligence', 'machine learning'],
      tr: 'Toprak, su ve iklim verilerini yapay zeka ile analiz ediyor; sulama, gübreleme ve ilaçlama için karar destek raporları hazırlıyoruz.',
      en: 'We analyze soil, water and climate data with AI and prepare decision-support reports for irrigation, fertilizing and spraying.' },
    { id: 'how', kw: ['nasil calisir', 'nasil isliyor', 'surec', 'adim', 'how does it work', 'how it works', 'process', 'steps'],
      tr: 'Dört adımda çalışır: <b>Ölç</b> (sensörler veri toplar) → <b>Analiz et</b> (yapay zeka işler) → <b>Öner</b> (net öneriler) → <b>Uygula</b> (otomasyon ve saha ekibi).',
      en: 'It works in four steps: <b>Measure</b> (sensors collect data) → <b>Analyze</b> (AI processes it) → <b>Recommend</b> (clear advice) → <b>Apply</b> (automation and field team).',
      go: { href: '#process', tr: 'Nasıl çalışır', en: 'How it works' } },
    { id: 'custom', kw: ['ozel proje', 'entegrasyon', 'ozel cozum', 'buyuk isletme', 'kooperatif', 'custom', 'integration', 'enterprise', 'cooperative'],
      tr: 'İşletmenizin ihtiyacına özel projeler ve mevcut sistemlerinizle entegrasyon geliştiriyoruz. Detayları konuşmak için bize yazabilirsiniz.',
      en: 'We develop custom projects and integrations with your existing systems. Write to us to discuss the details.',
      go: { href: '#contact', tr: 'Bize yazın', en: 'Contact us' }, topic: 'İş birliği' },
    { id: 'demo', kw: ['demo', 'deneme', 'gorusme', 'randevu', 'toplanti', 'ziyaret', 'meeting', 'appointment', 'trial', 'visit'],
      tr: 'Memnuniyetle! İletişim formundan görüşme talebinizi iletin; ekibimiz size uygun bir zaman için dönüş yapsın.',
      en: 'Gladly! Send a meeting request via the contact form and our team will get back to you with a suitable time.',
      go: { href: '#contact', tr: 'Görüşme talep et', en: 'Request a meeting' } },
    { id: 'contact', kw: ['iletisim', 'mail adres', 'e-posta adres', 'email address', 'mail', 'e-posta', 'eposta', 'telefon', 'numara', 'ulas', 'yaz', 'contact', 'email', 'phone', 'number', 'reach', 'call'],
      tr: 'Bize <b>' + EMAIL + '</b> adresinden veya sayfadaki iletişim formundan ulaşabilirsiniz. En kısa sürede dönüş yapıyoruz.',
      en: 'You can reach us at <b>' + EMAIL + '</b> or through the contact form on this page. We reply as soon as possible.',
      go: { href: '#contact', tr: 'İletişim formu', en: 'Contact form' } },
    { id: 'location', kw: ['nerede', 'adres', 'konum', 'sehir', 'kayseri', 'ofis', 'where', 'address', 'location', 'office', 'city'],
      tr: 'Kayseri merkezliyiz. Saha kurulumu ve destek için tarlanıza geliyoruz; bölgenizi iletişim formunda belirtebilirsiniz.',
      en: 'We are based in Kayseri, Türkiye. We come to your field for installation and support; just mention your region in the contact form.' },
    { id: 'region', kw: ['hangi il', 'hangi bolge', 'turkiye geneli', 'yurt disi', 'which region', 'abroad', 'international', 'ship'],
      tr: 'Merkezimiz Kayseri’de. Hizmet verebileceğimiz bölgeler için bize yazmanız yeterli; projeye göre değerlendiriyoruz.',
      en: 'Our base is in Kayseri. Write to us about your region and we’ll evaluate it for your project.',
      go: { href: '#contact', tr: 'Bize yazın', en: 'Contact us' } },
    { id: 'about', kw: ['kimsiniz', 'hakkinizda', 'sirket', 'firma', 'mustech nedir', 'ne is yapiyor', 'who are you', 'about', 'company', 'what is mustech', 'what do you do'],
      tr: 'MUSTECH, Türkiye’nin tarım sektörünü dijital dönüşüme taşımak için kurulmuş bir akıllı tarım şirketidir. Donanım, yazılım ve saha desteğini tek çatı altında sunar.',
      en: 'MUSTECH is a smart agriculture company founded to drive the digital transformation of Turkish farming, offering hardware, software and field support under one roof.',
      go: { href: '#about', tr: 'Hakkımızda', en: 'About us' } },
    { id: 'crops', kw: ['hangi urun', 'hangi bitki', 'bugday', 'misir', 'arpa', 'seker pancari', 'meyve', 'sera', 'bahce', 'crop', 'wheat', 'corn', 'greenhouse', 'orchard'],
      tr: 'Çözümlerimiz tarla bitkileri başta olmak üzere farklı ürünlere uyarlanabilir. Ürününüzü ve alanınızı yazarsanız size en uygun yapılandırmayı önerelim.',
      en: 'Our solutions can be adapted to different crops, especially field crops. Tell us your crop and area and we’ll suggest the best setup.',
      go: { href: '#contact', tr: 'Bize yazın', en: 'Contact us' } },
    { id: 'savings', kw: ['tasarruf', 'verim', 'kazanc', 'fayda', 'neden', 'avantaj', 'save', 'saving', 'yield', 'benefit', 'why'],
      tr: 'Veriye dayalı sulama ve gübreleme ile gereksiz su ve gübre kullanımını azaltır, sorunları erkenden fark ederek verimi korursunuz. Kazanç tarlaya göre değişir; ihtiyaç analizinde birlikte değerlendirebiliriz.',
      en: 'Data-driven irrigation and fertilizing cut unnecessary water and fertilizer use, and early detection protects your yield. Gains vary by field; we can assess them together in a needs analysis.' }
  ];

  var UI = {
    tr: { welcome: 'Merhaba! 👋 Ben MUSTECH Asistan. Size nasıl yardımcı olabilirim?',
          fallback: 'Bu soruyu tam anlayamadım. 🤔 Ürünlerimiz, fiyat teklifi, kurulum, destek veya iletişim hakkında sorabilirsiniz. Dilerseniz sorunuzu doğrudan ekibimize de iletebilirsiniz.',
          fallbackBtn: 'Ekibe sor',
          chips: [['products', 'Ürünleriniz neler?'], ['price', 'Fiyat teklifi'], ['install', 'Kurulum nasıl?'], ['support', 'Teknik destek'], ['contact', 'İletişim']],
          names: { p1: 'Akıllı Sulama', p2: 'Toprak Sensörü', p3: 'Drone', p4: 'Yazılım', p5: 'Hava İstasyonu', p6: 'Gübre Platformu' } },
    en: { welcome: 'Hello! 👋 I’m the MUSTECH Assistant. How can I help you?',
          fallback: 'I didn’t quite get that. 🤔 You can ask about our products, quotes, installation, support or contact details. You can also send your question straight to our team.',
          fallbackBtn: 'Ask the team',
          chips: [['products', 'What are your products?'], ['price', 'Get a quote'], ['install', 'How is installation?'], ['support', 'Technical support'], ['contact', 'Contact']],
          names: { p1: 'Smart Irrigation', p2: 'Soil Sensor', p3: 'Drone', p4: 'Software', p5: 'Weather Station', p6: 'Fertilizer Platform' } }
  };

  function norm(s) {
    return (' ' + s + ' ').toLocaleLowerCase('tr')
      .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/İ/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
      .replace(/[^a-z0-9\/ ]+/g, ' ').replace(/\s+/g, ' ');
  }
  var NKW = INTENTS.map(function (it) { return it.kw.map(function (k) { return norm(k).trim(); }); });

  function match(text) {
    var s = norm(text), best = null, bestScore = 0;
    INTENTS.forEach(function (it, i) {
      var score = 0;
      NKW[i].forEach(function (k) {
        if (!k) return;
        // kısa kelimeler tam kelime olarak, uzunlar kelime başı olarak aranır
        var hit = k.length <= 3 ? s.indexOf(' ' + k + ' ') > -1 : s.indexOf(' ' + k) > -1;
        if (hit) score += 1 + k.length / 10;
      });
      if (/^p\d$/.test(it.id) && score) score += 0.5; // ürün sorularına öncelik
      if (score > bestScore) { bestScore = score; best = it; }
    });
    return best;
  }

  /* ---------- Arayüz ---------- */
  var fab = document.getElementById('botFab'), panel = document.getElementById('botPanel');
  var msgs = document.getElementById('botMsgs'), chipsEl = document.getElementById('botChips');
  var form = document.getElementById('botForm'), input = document.getElementById('botText');
  var closeBtn = document.getElementById('botClose');
  if (!fab) return;
  var started = false;
  function L() { return MT.lang ? MT.lang() : 'tr'; }

  function scrollDown() { msgs.scrollTop = msgs.scrollHeight; }
  function add(html, who, extra) {
    var el = document.createElement('div');
    el.className = 'msg is-' + who;
    var bubble = document.createElement('div');
    bubble.className = 'bubble';
    if (who === 'user') bubble.textContent = html; else bubble.innerHTML = html;
    el.appendChild(bubble);
    if (extra) el.appendChild(extra);
    msgs.appendChild(el); scrollDown();
  }
  function typing() {
    var el = document.createElement('div');
    el.className = 'msg is-bot typing';
    el.innerHTML = '<div class="bubble"><i></i><i></i><i></i></div>';
    msgs.appendChild(el); scrollDown();
    return el;
  }
  function linkBtn(go, topic) {
    var a = document.createElement('a');
    a.className = 'msg-link'; a.href = go.href; a.textContent = go[L()] + ' →';
    a.addEventListener('click', function () {
      if (topic && MT.setTopic) MT.setTopic(topic);
      if (window.innerWidth < 640) toggle(false);
    });
    return a;
  }
  function renderChips(list) {
    chipsEl.innerHTML = '';
    var ui = UI[L()];
    list.forEach(function (c) {
      var id = c[0], label = c[1] || ui.names[id];
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = label;
      b.addEventListener('click', function () { ask(label, id); });
      chipsEl.appendChild(b);
    });
  }
  function defaultChips() { renderChips(UI[L()].chips); }

  function reply(text, forcedId) {
    var it = forcedId ? INTENTS.filter(function (x) { return x.id === forcedId; })[0] : match(text);
    var lang = L(), t = typing();
    setTimeout(function () {
      t.remove();
      if (it) {
        add(it[lang], 'bot', it.go ? linkBtn(it.go, it.topic) : (it.topic ? linkBtn({ href: '#contact', tr: 'Bilgi talep et', en: 'Request info' }, it.topic) : null));
        if (it.chips) renderChips(it.chips.map(function (id) { return [id]; })); else defaultChips();
      } else {
        add(UI[lang].fallback, 'bot', linkBtn({ href: '#contact', tr: UI.tr.fallbackBtn, en: UI.en.fallbackBtn }));
        defaultChips();
      }
    }, 450 + Math.random() * 450);
  }
  function ask(text, id) { add(text, 'user'); reply(text, id); }

  function toggle(open) {
    var isOpen = open === undefined ? panel.hidden : open;
    panel.hidden = !isOpen;
    fab.setAttribute('aria-expanded', String(isOpen));
    document.getElementById('bot').classList.toggle('open', isOpen);
    if (isOpen) {
      if (!started) { started = true; add(UI[L()].welcome, 'bot'); defaultChips(); }
      if (window.innerWidth > 640) setTimeout(function () { input.focus(); }, 50);
    }
  }
  fab.addEventListener('click', function () { toggle(); });
  closeBtn.addEventListener('click', function () { toggle(false); fab.focus(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) toggle(false); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = input.value.trim(); if (!v) return;
    input.value = ''; ask(v);
  });
  document.addEventListener('mt:lang', function () { if (started) defaultChips(); });
})();
