/* ==========================================================================
   СХЕМА ПРОЕКТА «ЗАЙМЫ СЕГОДНЯ» ДЛЯ ЯДРА ПАНЕЛИ (panel-core.js).

   Ядро одинаковое во всех витринах и про формат data.js ничего не знает.
   Здесь сказано только: какие у карточки поля и как разложить общий вид
   обратно в файл, который читает сайт: SITE / CATEGORIES / OFFERS.

   Разделы панели = блоки страницы:
     deal  — баннер «Предложение дня» (сайт берёт первую карточку раздела);
     main  — сетка карточек (первые три — золото, серебро, бронза);
     retry — жёлтый блок «Отказали?» (первые три карточки).

   Порядок полей карточки = порядок полей в форме панели.
   ========================================================================== */

window.ADMIN = {
  brand: 'Займы Сегодня',
  dataFile: 'data.js',
  draftKey: 'zaymy_admin_draft',
  preview: 'index.html?draft=1',

  /* erid печатаем, только если он реально есть в ссылке: выдумывать
     маркировку нельзя, а запрещать сохранение из-за её отсутствия — тоже. */
  requireErid: false,

  /* Карточку без ссылки сайт показывает без кнопки, с надписью «Скоро» —
     панель отмечает такие карточки в списке. */
  flagNoUrl: true,

  /* Блок «Логотип»: либо готовый файл, либо цветная плашка с инициалами.
     Цвет плашки сайт при необходимости подправляет сам. */
  logo: true,

  /* Карточка на сайте белая — от неё ядро считает контраст плашки. */
  surface: '#FFFFFF',
  defaultTone: { bg: '#3662E3', ink: '#FFFFFF' },

  /* Готовые логотипы из img/logos. Своя картинка грузится кнопкой
     «Выбрать файл…» в карточке. */
  presets: [
    { label: 'МФО и займы', items: [
      { name: 'А Деньги', value: 'img/logos/adengi.png' },
      { name: 'Быстроденьги', value: 'img/logos/bistrodengi.png' },
      { name: 'Деньга', value: 'img/logos/denga.png' },
      { name: 'Деньги на дом', value: 'img/logos/denginadom.png' },
      { name: 'Деньги сразу', value: 'img/logos/dengisrazu.png' },
      { name: 'До зарплаты', value: 'img/logos/dozarplati.png' },
      { name: 'Доброзайм', value: 'img/logos/dobrozaim.png' },
      { name: 'еКапуста', value: 'img/logos/ekapusta.png' },
      { name: 'Займер', value: 'img/logos/zaymer.png' },
      { name: 'Займиго', value: 'img/logos/zaymigo.png' },
      { name: 'ЛайкЗайм', value: 'img/logos/likezaim.png' },
      { name: 'Лайм-Займ', value: 'img/logos/limezaim.png' },
      { name: 'МигКредит', value: 'img/logos/migcredit.png' },
      { name: 'Надо денег', value: 'img/logos/nadodeneg.svg' },
      { name: 'Простой вопрос', value: 'img/logos/prostoyvopros.png' },
      { name: 'Свои люди', value: 'img/logos/svoiludi.png' },
      { name: 'СМС Финанс', value: 'img/logos/smsfinance.png' },
      { name: 'Срочно деньги', value: 'img/logos/srochnodengi.png' },
      { name: 'Турбозайм', value: 'img/logos/turbozaim.png' },
      { name: 'Умные наличные', value: 'img/logos/smartcash.svg' },
      { name: 'Центрофинанс', value: 'img/logos/centrofinans.png' },
      { name: 'BelkaCredit', value: 'img/logos/belkacredit.png' },
      { name: 'Boostra', value: 'img/logos/boostra.jpg' },
      { name: 'CarMoney', value: 'img/logos/carmoney.png' },
      { name: 'Credit7', value: 'img/logos/credit7.png' },
      { name: 'Creditplus', value: 'img/logos/creditplus.png' },
      { name: 'JoyMoney', value: 'img/logos/joymoney.png' },
      { name: 'Kviku', value: 'img/logos/kviku.png' },
      { name: 'Max.Credit', value: 'img/logos/maxcredit.png' },
      { name: 'MoneyMan', value: 'img/logos/moneyman.png' },
      { name: 'OneClickMoney', value: 'img/logos/oneclickmoney.png' },
      { name: 'Platiza', value: 'img/logos/platiza.png' },
      { name: 'Rocketman', value: 'img/logos/rocketman.png' },
      { name: 'Webbankir', value: 'img/logos/webbankir.png' }
    ] }
  ],

  /* Только то, что сайт действительно показывает. */
  site: [
    { key: 'brand',   label: 'Название сайта', required: true,
      hint: 'Стоит в шапке, в подвале и в заголовке вкладки браузера. Из двух слов первое в шапке зелёное, второе оранжевое: «Займы Сегодня».' },
    { key: 'medals',  label: 'Подписи на медалях первых трёх карточек', type: 'textarea',
      hint: 'Три строки — золото, серебро, бронза: «№1 в подборке». Слова «лучший», «самый выгодный» без доказательств ФАС считает недостоверной рекламой.' },
    { key: 'terms',   label: 'Текст блока «Условия получения»', type: 'textarea',
      hint: 'Абзац внизу страницы: кто выдаёт займы, что цифры уточняются в договоре, что бывает при просрочке.' },
    { key: 'owner',   label: 'Владелец сайта',
      hint: 'Строка в подвале: «ИП Иванов И. И., ИНН 000000000000» или «Самозанятый Иванов И. И., ИНН …». Пусто — строки нет.' },
    { key: 'email',   label: 'Почта для связи',
      hint: 'Показывается в подвале ссылкой. Пусто — ссылки нет.' },
    { key: 'updated', label: 'Дата обновления условий',
      hint: 'Печатается в подвале: «Условия проверены 10.11.2026».' }
  ],

  groups: [
    { key: 'title', label: 'Заголовок блока', required: true,
      hint: 'У «Предложения дня» — надпись на жёлтой плашке, у сетки — главный заголовок страницы, у блока «Отказали?» — его заголовок.' },
    { key: 'lead',  label: 'Абзац под заголовком', type: 'textarea',
      hint: 'Одно-два предложения. У «Предложения дня» не используется.' },
    { key: 'cta',   label: 'Надпись на кнопках', required: true,
      hint: 'Одна на все карточки блока: «Получить деньги», «Получить заём».' }
  ],

  card: [
    { key: 'partner', label: 'Компания', required: true,
      hint: 'Название на карточке: «Займер», «MoneyMan».' },
    { key: 'usp',     label: 'Плашка под логотипом',
      hint: 'Короткая выгода: «Первый заём под 0%», «Быстрое решение». Без слов «гарантия» и «100% одобрение» — за них штрафуют.' },
    { key: 'sum',     label: 'Сумма', required: true,
      hint: 'Как на карточке: «1 000 – 30 000 ₽».' },
    { key: 'term',    label: 'Срок', required: true,
      hint: 'Например «7 – 30 дн.».' },
    { key: 'free',    label: 'Дней без %',
      hint: 'Только число: «30». Пусто — строки на карточке нет.' },
    { key: 'badges',  label: 'Плашки для «Предложения дня»', type: 'lines',
      hint: 'По одной в строке, до трёх: «До 100 000 ₽», «Срок до 30 дней». Работают только у карточки в блоке «Предложение дня». Пусто — сайт соберёт их из суммы, срока и дней без %.' },
    { key: 'note',    label: 'Строка под плашками',
      hint: 'Только для «Предложения дня»: «Заявка онлайн • Без справок • Круглосуточно».' },
    { key: 'url',     label: 'Партнёрская ссылка', type: 'url',
      hint: 'Вставьте ссылку из партнёрки целиком, вместе с метками и erid. Пока пусто — на карточке вместо кнопки надпись «Скоро», а в списке панели пометка.' },
    { key: 'legal',   label: 'Юридическое название и реквизиты', type: 'textarea',
      hint: 'Одной строкой: «ООО МФК «…». Адрес: … ОГРН …, ИНН …. В реестре МФО: № … от …». Из этих строк сайт собирает блок «Информация о компаниях» — он нужен по закону о рекламе. Реквизиты берите в партнёрке или в реестре Банка России.' }
  ],

  /* ---------------------------------------------- чтение --------------- */

  load: function () {
    var groups = CATEGORIES.map(function (c) {
      return { key: c.id, title: c.label, lead: c.lead || '', cta: c.cta };
    });

    var seen = {};
    var cards = OFFERS.map(function (o, i) {
      /* Устойчивый ключ: в файле его нет, а ядру он нужен, чтобы не путать
         карточки при перестановке. Одна компания бывает в двух блоках сразу,
         поэтому в ключ входит и раздел. */
      var base = (String(o.cat || '') + '-' + String(o.partner || '')).toLowerCase()
        .replace(/[^a-zа-яё0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 40) || ('c' + i);
      var uid = base, n = 2;
      while (seen[uid]) uid = base + '-' + (n++);
      seen[uid] = true;

      return {
        uid: uid,
        group: o.cat,
        hidden: !!o.hidden,
        partner: o.partner || '',
        usp: o.usp || '',
        sum: o.sum || '',
        term: o.term || '',
        free: o.free || '',
        badges: (o.badges || []).slice(),
        note: o.note || '',
        url: o.url || '',
        legal: o.legal || '',
        logo: o.logo || '',
        /* Цвета плашки читаем всегда: даже у карточки с логотипом они
           переживают круговорот, иначе следующее сохранение затрёт выбор. */
        tone: { bg: (o.tone && o.tone.bg) || '#3662E3', ink: (o.tone && o.tone.ink) || '#FFFFFF' }
      };
    });

    return {
      SITE: JSON.parse(JSON.stringify(SITE)),
      GROUPS: groups,
      CARDS: cards
    };
  },

  /* ---------------------------------------------- сборка файла --------- */

  build: function (m) {
    function js(v) { return JSON.stringify(v, null, 2); }
    function t(v) { return String(v == null ? '' : v).trim(); }

    var categories = m.GROUPS.map(function (g) {
      return { id: g.key, label: t(g.title), lead: t(g.lead), cta: t(g.cta) || 'Получить деньги' };
    });

    var offers = m.CARDS.map(function (c) {
      var o = {
        cat: c.group,
        partner: t(c.partner),
        usp: t(c.usp),
        logo: t(c.logo),
        tone: { bg: t(c.tone && c.tone.bg) || '#3662E3', ink: t(c.tone && c.tone.ink) || '#FFFFFF' },
        sum: t(c.sum),
        term: t(c.term),
        free: t(c.free),
        badges: (c.badges || []).map(t).filter(Boolean),
        note: t(c.note),
        url: t(c.url),
        legal: t(c.legal)
      };
      if (c.hidden) o.hidden = true;
      return o;
    });

    return [
      '/* ═════════════════════════════════════════════════════════════════════════',
      '   КАТАЛОГ «ЗАЙМЫ СЕГОДНЯ» — единственный файл с предложениями.',
      '   Собран панелью ' + new Date().toLocaleString('ru-RU') + '.',
      '',
      '   Правится через panel.html. Руками тоже можно, но при следующем',
      '   сохранении из панели правки будут перезаписаны.',
      '',
      '   Разделы (CATEGORIES) — это блоки страницы:',
      '     deal  — фиолетовый баннер «Предложение дня» (берётся первая карточка);',
      '     main  — сетка карточек, первые три получают золото/серебро/бронзу;',
      '     retry — жёлтый блок «Отказали?» (первые три карточки).',
      '   Любой другой раздел сайт покажет ещё одной сеткой ниже основной.',
      '',
      '   url    — партнёрская ссылка. Пусто — на карточке вместо кнопки «Скоро».',
      '   free   — сколько дней без процентов; пусто — строки на карточке нет.',
      '   badges — плашки баннера «Предложение дня» (в сетке не используются).',
      '   legal  — юр. название и реквизиты компании, блок внизу сайта.',
      '',
      '   ВАЖНО ПРО ЦИФРЫ: суммы, сроки и дни без процентов ставьте только те,',
      '   что подтверждены вашей партнёркой. Цифра «на глаз» — недостоверная',
      '   реклама: партнёрка может снять оффер, а ФАС — оштрафовать.',
      '   ═════════════════════════════════════════════════════════════════════════ */',
      '',
      'const SITE = ' + js(m.SITE) + ';',
      '',
      '/* label — заголовок блока, lead — абзац под ним, cta — надпись на кнопках. */',
      'const CATEGORIES = ' + js(categories) + ';',
      '',
      'const OFFERS = ' + js(offers) + ';',
      ''
    ].join('\n');
  }
};
