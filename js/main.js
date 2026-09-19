/* ==========================================================================
   Auto-servis M&K — main.js (vanilla, bez závislostí)
   Moduly: mobilné menu · otváracie hodiny · točenie kolesa · kopírovanie čísla
           · aktívna položka menu · rok v pätičke
   ========================================================================== */
(() => {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------------
     ÚDAJE: otváracie hodiny (minúty od polnoci). 0 = nedeľa … 6 = sobota.
     Ak sa hodiny zmenia, upravte tu AJ v index.html (sekcia hodín, pätka, JSON-LD).
     ------------------------------------------------------------------------ */
  const HOURS = {
    0: null,
    1: [8 * 60 + 30, 17 * 60],
    2: [8 * 60 + 30, 17 * 60],
    3: [8 * 60 + 30, 17 * 60],
    4: [8 * 60 + 30, 17 * 60],
    5: [8 * 60 + 30, 17 * 60],
    6: [9 * 60, 12 * 60],
  };
  // tvary dní pre vetu „otvárame v …“
  const OPENS_ON = ['v nedeľu', 'v pondelok', 'v utorok', 'v stredu', 'vo štvrtok', 'v piatok', 'v sobotu'];
  const TIMEZONE = 'Europe/Bratislava';

  const pad = (n) => String(n).padStart(2, '0');
  const fmt = (mins) => `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;

  /* ------------------------------------------------------------------------
     MOBILNÉ MENU
     ------------------------------------------------------------------------ */
  function initNav() {
    const header = $('[data-header]');
    const toggle = $('[data-nav-toggle]');
    const nav = $('[data-nav]');
    if (!header || !toggle || !nav) return;

    const mq = window.matchMedia('(max-width: 60em)');
    const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

    function setOpen(open, { returnFocus = false } = {}) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Zavrieť menu' : 'Otvoriť menu');
      header.classList.toggle('is-menu-open', open);
      document.documentElement.classList.toggle('menu-lock', open);
      if (!open && returnFocus) toggle.focus();
    }

    toggle.addEventListener('click', () => setOpen(!isOpen()));

    // zavrieť po kliknutí na odkaz v menu
    $$('a', nav).forEach((a) => a.addEventListener('click', () => { if (isOpen()) setOpen(false); }));

    header.addEventListener('keydown', (e) => {
      if (!isOpen()) return;
      if (e.key === 'Escape') { setOpen(false, { returnFocus: true }); return; }

      // jednoduchá past na focus, kým je menu otvorené
      if (e.key === 'Tab') {
        const focusable = $$('a[href], button:not([disabled])', header).filter((el) => el.offsetParent !== null);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    // po zväčšení okna menu resetovať
    const onChange = () => { if (!mq.matches && isOpen()) setOpen(false); };
    mq.addEventListener ? mq.addEventListener('change', onChange) : mq.addListener(onChange);
  }

  /* ------------------------------------------------------------------------
     OTVÁRACIE HODINY: zvýraznenie dnešného dňa + stav „otvorené / zatvorené“
     Čas sa počíta v pásme Europe/Bratislava, nie podľa hodín návštevníka.
     ------------------------------------------------------------------------ */
  function getNow() {
    try {
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: TIMEZONE, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
      }).formatToParts(new Date());
      const get = (type) => parts.find((p) => p.type === type).value;
      const day = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[get('weekday')];
      return { day, minutes: parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10) };
    } catch (_) {
      const d = new Date();
      return { day: d.getDay(), minutes: d.getHours() * 60 + d.getMinutes() };
    }
  }

  function describeStatus({ day, minutes }) {
    const today = HOURS[day];
    if (today && minutes >= today[0] && minutes < today[1]) {
      return { state: 'open', text: `Teraz otvorené · do ${fmt(today[1])}` };
    }
    if (today && minutes < today[0]) {
      return { state: 'closed', text: `Teraz zatvorené · dnes otvárame o ${fmt(today[0])}` };
    }
    for (let i = 1; i <= 7; i++) {
      const d = (day + i) % 7;
      if (HOURS[d]) {
        const when = i === 1 ? 'zajtra' : OPENS_ON[d];
        return { state: 'closed', text: `Teraz zatvorené · otvárame ${when} o ${fmt(HOURS[d][0])}` };
      }
    }
    return { state: 'closed', text: 'Teraz zatvorené' };
  }

  function initHours() {
    const rows = $$('[data-days]');
    const badges = $$('[data-hours-status]');

    function update() {
      const now = getNow();

      rows.forEach((row) => {
        const days = row.dataset.days.split(',').map(Number);
        const isToday = days.includes(now.day);
        row.classList.toggle('is-today', isToday);
        if (isToday) row.setAttribute('aria-current', 'date'); else row.removeAttribute('aria-current');
        const label = $('.hours__now', row);
        if (label) label.hidden = !isToday;
      });

      const status = describeStatus(now);
      badges.forEach((badge) => {
        badge.dataset.state = status.state;
        const text = $('[data-hours-text]', badge);
        if (text) text.textContent = status.text;
      });
    }

    update();
    setInterval(update, 60 * 1000);
  }

  /* ------------------------------------------------------------------------
     KOLESO V HERO: pri skrolovaní sa mierne otočí (jediný „obrazový“ pohyb)
     ------------------------------------------------------------------------ */
  function initWheel() {
    const hero = $('.hero');
    const wheel = $('.hero__wheel');
    if (!hero || !wheel || prefersReducedMotion) return;

    let ticking = false;
    const DEG_PER_PX = 0.055;

    function update() {
      const y = Math.min(window.scrollY, hero.offsetHeight);
      wheel.style.setProperty('--spin', `${(y * DEG_PER_PX).toFixed(2)}deg`);
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ------------------------------------------------------------------------
     KOPÍROVANIE TELEFÓNNEHO ČÍSLA (tlačidlo sa zobrazí, len ak to prehliadač vie)
     ------------------------------------------------------------------------ */
  function initCopy() {
    const btn = $('[data-copy]');
    const msg = $('[data-copy-msg]');
    if (!btn || !msg || !navigator.clipboard || !navigator.clipboard.writeText) return;

    btn.hidden = false;
    let timer;
    btn.addEventListener('click', async () => {
      clearTimeout(timer);
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        msg.textContent = 'Číslo je skopírované.';
      } catch (_) {
        msg.textContent = `Kopírovanie sa nepodarilo. Číslo: ${btn.dataset.copy}`;
      }
      timer = setTimeout(() => { msg.textContent = ''; }, 3500);
    });
  }

  /* ------------------------------------------------------------------------
     AKTÍVNA POLOŽKA MENU podľa sekcie na obrazovke
     ------------------------------------------------------------------------ */
  function initActiveLinks() {
    if (!('IntersectionObserver' in window)) return;
    const links = $$('[data-nav-link]');
    const map = new Map();
    links.forEach((a) => {
      const target = $(a.getAttribute('href'));
      if (target) map.set(target, a);
    });
    // „Kontakt“ = CTA sekcia aj blok s hodinami a polohou
    const visit = $('#navsteva');
    const contactLink = links.find((a) => a.getAttribute('href') === '#kontakt');
    if (visit && contactLink) map.set(visit, contactLink);

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.removeAttribute('aria-current'));
        const link = map.get(entry.target);
        if (link) link.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    map.forEach((_, section) => io.observe(section));

    // hore (hero) nie je aktívna žiadna položka
    const hero = $('#top');
    if (hero) {
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting) links.forEach((a) => a.removeAttribute('aria-current'));
      }, { rootMargin: '-40% 0px -55% 0px' }).observe(hero);
    }
  }

  /* ------------------------------------------------------------------------ */
  function initYear() {
    $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
  }

  initNav();
  initHours();
  initWheel();
  initCopy();
  initActiveLinks();
  initYear();
})();
