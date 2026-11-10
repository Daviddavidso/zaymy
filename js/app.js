/* ═══════════════════════════════════════════════════════════════════════
   ВИТРИНА «ЗАЙМЫ СЕГОДНЯ» — баннер дня, сетка карточек, блок «Отказали?».

   Каталог объявлен глобальными const в data.js (или data.php на хостинге
   с PHP). const мимо window не переприсвоить, поэтому работаем с копиями:
   на адресе index.html?draft=1 вместо боевого файла подставляется черновик
   из панели управления.

   Разделы каталога — это блоки страницы:
     deal  — баннер «Предложение дня» (первая видимая карточка раздела);
     retry — жёлтый блок «Отказали?» (первые три);
     любой другой — сетка карточек; у первой сетки заголовок h1 и медали.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var site   = typeof SITE       !== 'undefined' ? SITE       : {};
  var cats   = typeof CATEGORIES !== 'undefined' ? CATEGORIES : [];
  var offers = typeof OFFERS     !== 'undefined' ? OFFERS     : [];

  if (/[?&]draft/.test(location.search)) {
    try {
      var draftFile = localStorage.getItem('zaymy_admin_draft:file');
      if (draftFile) {
        var d = new Function(draftFile + '\n;return { SITE: SITE, CATEGORIES: CATEGORIES, OFFERS: OFFERS };')();
        site = d.SITE || site; cats = d.CATEGORIES || cats; offers = d.OFFERS || offers;
      }
    } catch (e) { /* битый черновик — показываем боевой каталог */ }
  }

  /* Превью (компьютер разработчика и GitHub Pages) — демо-режим: у карточек
     без ссылки кнопка всё равно нарисована, чтобы дизайн был виден целиком,
     и ведёт на полоску-пояснение вверху. На боевом домене вместо кнопки
     честное «Скоро». Принудительно: ?demo=1 / ?demo=0. */
  var host = location.hostname;
  var demo = /(^|\.)github\.io$/.test(host) || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(host) ||
             location.protocol === 'file:';
  if (/[?&]demo=0/.test(location.search)) demo = false;
  if (/[?&]demo=1/.test(location.search)) demo = true;

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── мелкие помощники ─────────────────────────────────────────────── */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* Неразрывные пробелы: между разрядами («100 000») и перед единицей
     («30 дн.», «5 000 ₽») — чтобы число не рвалось на две строки. */
  function nb(s) {
    return esc(String(s == null ? '' : s)
      .replace(/(\d)[   ](?=\d)/g, '$1 ')
      .replace(/(\d) (?=(₽|руб|дн|день|дня|дней|мес|%))/g, '$1 '));
  }

  function lastNumber(text) {
    var m = String(text == null ? '' : text).replace(/[\s   ]/g, '').match(/\d+/g);
    return m ? parseInt(m[m.length - 1], 10) : 0;
  }
  function money(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
    return many;
  }

  function initials(name) {
    return String(name || '?').trim().split(/[\s,-]+/).slice(0, 2)
      .map(function (w) { return w.charAt(0); }).join('').toUpperCase();
  }

  /* Контраст пары цветов плашки. Клиент выбирает их в панели сам — если
     пара не читается, сайт подставляет синюю с белым. */
  function lum(hex) {
    var m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
    if (!m) return null;
    var n = parseInt(m[1], 16);
    var c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(function (v) {
      v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function tonePair(o) {
    var bg = o.tone && o.tone.bg, ink = o.tone && o.tone.ink;
    var a = lum(bg), b = lum(ink);
    if (a == null || b == null) return ['#3662E3', '#FFFFFF'];
    var cr = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    return cr >= 4.5 ? [bg, ink] : ['#3662E3', '#FFFFFF'];
  }

  /* Ссылка из панели — только http(s): javascript: и прочее сюда не пройдёт. */
  function safeUrl(u) {
    u = String(u || '').trim();
    return /^https?:\/\/[^\s]+$/i.test(u) ? u : '';
  }

  /* Логотип — картинка без alt: название компании стоит рядом текстом.
     Без картинки — плашка с инициалами, от скринридера скрыта по той же причине. */
  function logoInner(o, size, tileClass) {
    if (o.logo) {
      return '<img src="' + esc(o.logo) + '" alt="" width="' + size + '" height="' + size +
        '" loading="lazy" decoding="async">';
    }
    var t = tonePair(o);
    return '<span class="' + tileClass + '" aria-hidden="true" style="background:' + esc(t[0]) +
      ';color:' + esc(t[1]) + '">' + esc(initials(o.partner)) + '</span>';
  }

  /* Кнопка-ссылка. Видимая надпись у всех кнопок одинаковая, поэтому к ней
     дописан скрытый хвост с названием компании: в списке ссылок скринридера
     иначе стоял бы десяток одинаковых строк. Видимый текст идёт первым —
     голосовое управление находит кнопку по нему. Без noreferrer: партнёрке
     реферер нужен, чтобы засчитать переход. */
  function linkHTML(o, cls, label, extra) {
    var url = safeUrl(o.url);
    if (url) {
      return '<a class="' + cls + '" href="' + esc(url) + '" target="_blank" rel="sponsored nofollow noopener">' +
        esc(label) + (extra || '') +
        '<span class="vh"> в МФО «' + esc(o.partner) + '», откроется в новой вкладке</span></a>';
    }
    if (demo) {
      return '<a class="' + cls + '" href="#demo-note">' + esc(label) + (extra || '') +
        '<span class="vh"> в МФО «' + esc(o.partner) + '» — демо, ссылка появится позже</span></a>';
    }
    return '';
  }

  /* ── разбор каталога ──────────────────────────────────────────────── */

  var live = offers.filter(function (o) { return !o.hidden; }).map(function (o, i) {
    return {
      i: i,
      cat: o.cat,
      partner: String(o.partner || '').trim(),
      usp: String(o.usp || '').trim(),
      logo: String(o.logo || '').trim(),
      tone: o.tone || {},
      sum: String(o.sum || '').trim(),
      term: String(o.term || '').trim(),
      free: String(o.free || '').trim(),
      badges: (o.badges || []).filter(Boolean),
      note: String(o.note || '').trim(),
      url: o.url || '',
      legal: String(o.legal || '').trim()
    };
  });

  function byCat(id) { return live.filter(function (o) { return o.cat === id; }); }
  function cat(id) {
    for (var k = 0; k < cats.length; k++) if (cats[k].id === id) return cats[k];
    return null;
  }
  function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }

  /* ── тексты сайта из панели ───────────────────────────────────────── */

  var brand = String(site.brand || '').trim();
  if (brand) {
    each('[data-brand]', function (n) { n.textContent = brand; });
    /* Знак в шапке: первое слово зелёное, остальное оранжевое, слитно — как
       у референса. Вслух ссылка читается по aria-label, с обычным пробелом. */
    each('[data-brand-mark]', function (n) {
      var parts = brand.split(/\s+/);
      n.innerHTML = '<span class="brand__a">' + esc(parts[0]) + '</span>' +
        (parts.length > 1 ? '<span class="brand__b">' + esc(parts.slice(1).join(' ')) + '</span>' : '');
    });
    each('a.brand', function (a) { a.setAttribute('aria-label', brand + ' — на главную'); });
    /* Заголовок вкладки: у главной свой, у остальных страниц меняем только
       название сайта после тире — «Политика обработки данных — …». */
    if (document.getElementById('cards')) document.title = brand + ' — займы онлайн на карту';
    else document.title = document.title.replace(/\s—\s[^—]*$/, '') + ' — ' + brand;
  }

  var termsEl = document.querySelector('[data-terms]');
  if (termsEl && site.terms) termsEl.textContent = site.terms;
  if (termsEl && !String(site.terms || '').trim() && typeof SITE !== 'undefined') {
    var termsBox = document.getElementById('terms');
    if (termsBox) termsBox.hidden = true;
  }

  var owner = String(site.owner || '').trim();
  each('[data-owner]', function (n) { n.textContent = owner; n.hidden = !owner; });

  var email = String(site.email || '').trim();
  if (/^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(email)) {
    each('[data-email]', function (a) { a.textContent = email; a.setAttribute('href', 'mailto:' + email); });
    each('[data-email-box]', function (n) { n.hidden = false; });
  }

  var updated = String(site.updated || '').trim();
  if (updated) {
    each('[data-updated]', function (n) { n.textContent = updated; });
    each('[data-updated-box]', function (n) { n.hidden = false; });
  }

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  var medals = String(site.medals || '').split(/\n+/).map(function (s) { return s.trim(); }).filter(Boolean);
  var MEDAL_DEFAULT = ['№1 в подборке', '№2 в подборке', '№3 в подборке'];
  var MEDAL_CLASS = ['gold', 'silver', 'bronze'];
  var MEDAL_ICON = ['&#129351;', '&#129352;', '&#129353;'];   /* медали — украшение */

  /* ── «Предложение дня» ────────────────────────────────────────────── */

  var dealBox = document.getElementById('deal');
  var dealCat = cat('deal');
  var dealOffer = byCat('deal')[0];
  if (dealBox && dealCat && dealOffer) {
    var o = dealOffer;
    var chips = o.badges.slice(0, 3);
    if (!chips.length) {
      /* Плашки не заданы — собираем из условий карточки. */
      var sMax = lastNumber(o.sum), tMax = lastNumber(o.term);
      if (sMax) chips.push('До ' + money(sMax) + ' ₽');
      if (tMax) chips.push('Срок до ' + tMax + ' ' + plural(tMax, 'дня', 'дней', 'дней'));
      if (o.free) chips.push('Первый заём 0%');
    }
    var CHIP_ICON = ['&#9989;', '&#9889;', '&#127873;'];
    var go = linkHTML(o, 'deal__btn', dealCat.cta || 'Получить заём');
    dealBox.innerHTML =
      '<p class="deal__badge" id="deal-badge"><span aria-hidden="true">&#128293; </span>' +
        esc(dealCat.label || 'Предложение дня') + '</p>' +
      '<div class="deal__content">' +
        '<div class="deal__logo">' + logoInner(o, 60, 'deal__tile') + '</div>' +
        '<div class="deal__info">' +
          '<p class="deal__title" id="deal-name">' + esc(o.partner) + '</p>' +
          (chips.length ? '<ul class="deal__chips" role="list">' + chips.map(function (c, n) {
            return '<li><span aria-hidden="true">' + CHIP_ICON[n % 3] + ' </span>' + nb(c) + '</li>';
          }).join('') + '</ul>' : '') +
          (o.note || o.usp ? '<p class="deal__text">' + esc(o.note || o.usp) + '</p>' : '') +
        '</div>' +
        '<div class="deal__cta">' +
          (go
            ? go + '<p class="deal__hint">Точные условия — на сайте компании</p>'
            : '<p class="deal__soon"><b>Скоро</b> — ссылка на оформление появится позже</p>') +
        '</div>' +
      '</div>';
    /* У плашки с инициалами своя заливка — белая подложка логотипа не нужна. */
    var tile = dealBox.querySelector('.deal__tile');
    if (tile) {
      var box = tile.parentNode;
      box.style.background = tile.style.background; box.style.color = tile.style.color;
      tile.removeAttribute('style');
    }
    dealBox.hidden = false;
  }

  /* ── карточка сетки ───────────────────────────────────────────────── */

  function factsHTML(o, cls) {
    return '<dl class="' + cls + '">' +
      (o.sum  ? '<div><dt>Сумма</dt><dd>' + nb(o.sum) + '</dd></div>' : '') +
      (o.term ? '<div><dt>Срок</dt><dd>' + nb(o.term) + '</dd></div>' : '') +
      (o.free ? '<div><dt>Дней без %</dt><dd>' + nb(o.free) + '</dd></div>' : '') +
      '</dl>';
  }

  function cardHTML(o, place, cta, tag, withMedals) {
    var medal = withMedals && place < 3;
    var id = 'o' + o.i + '-name';
    var go = linkHTML(o, 'btn card__cta', cta);
    return '' +
      '<li><article class="card' + (medal ? ' card--' + MEDAL_CLASS[place] : '') + '" aria-labelledby="' + id + '">' +
        '<div class="card__body">' +
          '<div class="card__logo">' + logoInner(o, 62, 'card__tile') + '</div>' +
          '<' + tag + ' class="card__name" id="' + id + '">' + esc(o.partner) + '</' + tag + '>' +
          (medal ? '<p class="card__medal"><span aria-hidden="true">' + MEDAL_ICON[place] + ' </span>' +
            esc(medals[place] || MEDAL_DEFAULT[place]) + '</p>' : '') +
          (o.usp ? '<p class="card__usp">' + esc(o.usp) + '</p>' : '') +
          factsHTML(o, 'card__facts') +
          '<div class="card__go">' +
            /* Без ссылки кнопки нет вовсе: нажимать нечего — значит, и
               фокусировать нечего. Недоступность сказана словом. */
            (go || '<p class="card__soon"><b>Скоро</b>Ссылка на оформление появится позже</p>') +
          '</div>' +
        '</div>' +
      '</article></li>';
  }

  /* ── сетки ────────────────────────────────────────────────────────── */

  var grids = cats.filter(function (c) { return c.id !== 'deal' && c.id !== 'retry'; });
  var first = grids[0];
  var listBox = document.getElementById('cards');

  if (listBox) {
    var firstItems = first ? byCat(first.id) : [];
    var titleEl = document.querySelector('[data-main-title]');
    var leadEl = document.querySelector('[data-main-lead]');
    if (first && titleEl && first.label) titleEl.textContent = first.label;
    if (first && leadEl) { leadEl.textContent = first.lead || ''; leadEl.hidden = !first.lead; }
    listBox.innerHTML = firstItems.map(function (o, n) {
      return cardHTML(o, n, (first && first.cta) || 'Получить деньги', 'h2', true);
    }).join('');
    var emptyBox = document.getElementById('cards-empty');
    if (emptyBox) emptyBox.hidden = firstItems.length > 0;
  }

  var more = document.getElementById('more');
  if (more) {
    more.innerHTML = grids.slice(1).map(function (c, n) {
      var items = byCat(c.id);
      if (!items.length) return '';
      var hid = 'more-' + n + '-title';
      return '<section aria-labelledby="' + hid + '"><div class="band">' +
        '<h2 class="band__title" id="' + hid + '">' + esc(c.label) + '</h2>' +
        (c.lead ? '<p class="band__text">' + esc(c.lead) + '</p>' : '') + '</div>' +
        '<div class="wrap"><ul class="cards" role="list">' + items.map(function (o, k) {
          return cardHTML(o, k, c.cta || 'Получить деньги', 'h3', false);
        }).join('') + '</ul></div></section>';
    }).join('');
  }

  /* ── «Отказали?» ──────────────────────────────────────────────────── */

  var retryBox = document.getElementById('retry');
  var retryCat = cat('retry');
  var retryItems = byCat('retry').slice(0, 3);
  if (retryBox && retryCat && retryItems.length) {
    var RETRY_CLASS = ['green', 'blue', 'orange'];
    var rTitle = document.getElementById('retry-title');
    var rLead = document.getElementById('retry-lead');
    if (rTitle && retryCat.label) rTitle.textContent = retryCat.label;
    if (rLead) { rLead.textContent = retryCat.lead || ''; rLead.hidden = !retryCat.lead; }
    document.getElementById('retry-list').innerHTML = retryItems.map(function (o, n) {
      var id = 'r' + o.i + '-name';
      var go = linkHTML(o, 'rbtn', retryCat.cta || 'Получить деньги', ' <span aria-hidden="true">→</span>');
      return '' +
        '<li><article class="rcard rcard--' + RETRY_CLASS[n] + '" aria-labelledby="' + id + '">' +
          '<div class="rcard__head">' +
            '<div class="rcard__logo">' + logoInner(o, 36, 'rcard__tile') + '</div>' +
            '<div><h3 class="rcard__name" id="' + id + '">' + esc(o.partner) + '</h3>' +
              (o.usp ? '<p class="rcard__usp">' + esc(o.usp) + '</p>' : '') + '</div>' +
          '</div>' +
          '<div class="rcard__top">' +
            '<p class="rcard__tag"><span aria-hidden="true">' + MEDAL_ICON[n] + ' </span>Вариант ' + (n + 1) + '</p>' +
            (o.free ? '<p class="rcard__big">0%<span class="vh"> — первый заём без процентов</span></p>' : '') +
          '</div>' +
          factsHTML(o, 'rcard__facts') +
          (go || '<p class="card__soon rcard__soon"><b>Скоро</b>Ссылка на оформление появится позже</p>') +
        '</article></li>';
    }).join('');
    each('#retry-list .rcard__tile', function (t) {
      var b = t.parentNode;
      b.style.background = t.style.background; b.style.color = t.style.color;
      t.removeAttribute('style');
    });
    retryBox.hidden = false;
  }

  /* ── реквизиты компаний ───────────────────────────────────────────── */

  var legalBox = document.getElementById('companies');
  var legalList = document.getElementById('legal-list');
  if (legalBox && legalList) {
    var seen = {}, rows = [];
    live.forEach(function (o) {
      if (!o.legal || seen[o.legal]) return;
      seen[o.legal] = true;
      /* Название компании — до первой точки с пробелом, дальше реквизиты. */
      var cut = o.legal.indexOf('. ');
      var name = cut > 0 ? o.legal.slice(0, cut) : o.legal;
      var rest = cut > 0 ? o.legal.slice(cut) : '';
      rows.push('<li><b>' + esc(name) + '</b>' + esc(rest) + '</li>');
    });
    legalList.innerHTML = rows.join('');
    legalBox.hidden = rows.length === 0;
  }

  /* ── демо-полоска ─────────────────────────────────────────────────── */

  var demoNote = document.getElementById('demo-note');
  if (demoNote && demo && live.some(function (o) { return !safeUrl(o.url); })) demoNote.hidden = false;

  /* Ссылка-якорь переносит и фокус, а не только экран: иначе следующий Tab
     вернул бы человека туда, откуда он ушёл. */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    var t = id && document.getElementById(id);
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    t.focus({ preventScroll: true });
  });

  /* ── «Наверх» ─────────────────────────────────────────────────────── */

  var topBtn = document.getElementById('to-top');
  var logo = document.getElementById('logo');
  if (topBtn) {
    var onScroll = function () {
      /* Кнопку с фокусом не прячем: фокус провалился бы в никуда. */
      if (document.activeElement === topBtn) return;
      topBtn.hidden = window.scrollY <= 300;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    topBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
      /* Фокус — на логотип: это первый элемент страницы, кольцо видно.
         Саму кнопку спрячет обработчик прокрутки, когда экран доедет до верха. */
      if (logo) logo.focus({ preventScroll: true });
      else topBtn.hidden = true;
    });
  }
})();
