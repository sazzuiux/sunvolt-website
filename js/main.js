/* Sunvolt Energy — interactions & animations (no dependencies) */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmt = (n) => Math.round(n).toLocaleString('en-US');

  /* ---------- 1. Hero watermark: letters rise out of the ocean ---------- */
  const wm = $('[data-split]');
  if (wm) {
    wm.innerHTML = [...wm.dataset.split].map((c, i) => `<span class="ch" style="--i:${i}">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
  }

  /* ---------- 2. Scroll reveal ---------- */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); revealIO.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach((el) => revealIO.observe(el));

  /* ---------- 3. Count-up numbers ---------- */
  // Animates every number inside the text, keeping prefix/suffix/commas/decimals ("35%–80%", "$1,850", "8.5 MW+").
  const countUp = (el, duration = 1800) => {
    const original = el.dataset.final || el.textContent;
    el.dataset.final = original;
    const parts = original.split(/(\d[\d,]*\.?\d*)/);
    const nums = parts.map((p) => (/^\d/.test(p) ? { v: parseFloat(p.replace(/,/g, '')), dec: (p.split('.')[1] || '').length, comma: p.includes(',') || parseFloat(p.replace(/,/g, '')) >= 10000 } : null));
    if (reduce || !nums.some(Boolean)) { el.textContent = original; return; }
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 4);
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      el.textContent = parts.map((p, i) => {
        const n = nums[i];
        if (!n) return p;
        const val = n.v * ease(t);
        const s = val.toFixed(n.dec);
        return n.comma ? Number(s).toLocaleString('en-US', { minimumFractionDigits: n.dec, maximumFractionDigits: n.dec }) : s;
      }).join('');
      if (t < 1) requestAnimationFrame(tick); else el.textContent = original;
    };
    requestAnimationFrame(tick);
  };
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { countUp(e.target); countIO.unobserve(e.target); } });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => {
    el.style.fontVariantNumeric = 'tabular-nums';
    // hero stats start after the hero entrance animation
    if (el.closest('.hero')) setTimeout(() => countUp(el, 2000), 1400);
    else countIO.observe(el);
  });

  /* ---------- 4. Partner logo marquee (duplicate group for a seamless loop) ---------- */
  const track = $('.marquee__track');
  if (track) {
    const group = $('.marquee__group', track);
    track.appendChild(group.cloneNode(true)).setAttribute('aria-hidden', 'true');
  }

  /* ---------- 5. Sticky nav + floating chat visibility + active link ---------- */
  const sticky = $('#stickyNav');
  const chat = $('#chat');
  const hero = $('.hero');
  const onScroll = () => {
    const past = hero.getBoundingClientRect().bottom < 80;
    sticky.classList.toggle('is-visible', past);
    sticky.setAttribute('aria-hidden', String(!past));
    $$('a, button', sticky).forEach((a) => (a.tabIndex = past ? 0 : -1));
    const nearEnd = window.innerHeight + window.scrollY > document.body.scrollHeight - 160;
    chat.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6 && !nearEnd);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const sections = ['about', 'services', 'calculator', 'projects', 'faq', 'contact'].map((id) => document.getElementById(id));
  const navIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      $$('.sticky-nav .nav__links a').forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => s && navIO.observe(s));

  /* ---------- 6. Mobile menu ---------- */
  const menu = $('#mmenu');
  $$('[data-menu-open]').forEach((b) => b.addEventListener('click', () => { menu.classList.add('is-open'); document.body.style.overflow = 'hidden'; }));
  $$('[data-menu-close]').forEach((b) => b.addEventListener('click', () => { menu.classList.remove('is-open'); document.body.style.overflow = ''; }));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { menu.classList.remove('is-open'); document.body.style.overflow = ''; } });

  /* ---------- 6b. Service accordion: hovered card expands, the others shrink ---------- */
  const svcGrid = $('#svcGrid');
  if (svcGrid) {
    const cards = $$('.svc', svcGrid);
    const activate = (card) => cards.forEach((c) => c.classList.toggle('is-active', c === card));
    cards.forEach((card) => {
      card.addEventListener('mouseenter', () => activate(card));
      card.addEventListener('focus', () => activate(card));
      // touch: first tap opens the card, second tap follows the link
      card.addEventListener('click', (e) => {
        if (!card.classList.contains('is-active')) { e.preventDefault(); activate(card); }
      });
    });
  }

  /* ---------- 7. Savings calculator ---------- */
  const state = { type: 'home', bill: 250, area: 1200, sun: 'full', addons: new Set(['battery', 'ev']) };
  const SUN = { full: { offset: 0.88, yield: 2290 }, partial: { offset: 0.74, yield: 1830 }, shade: { offset: 0.52, yield: 1370 } };
  const COST_PER_KW = { home: 2500, farm: 2300, business: 2200, industrial: 2000 };
  const ADDON_COST = { battery: 4500, ev: 900, wind: 8000, monitoring: 300 };
  const els = {
    bill: $('#bill'), area: $('#area'), billOut: $('#billOut'), areaOut: $('#areaOut'), sun: $('#sun'),
    year: $('#rYear'), sub: $('#rSub'), r25: $('#r25'), payback: $('#rPayback'), system: $('#rSystem'), co2: $('#rCo2'),
    before: $('#rBefore'), after: $('#rAfter'), afterBar: $('#rAfterBar'),
  };
  const setFill = (r) => r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min)) * 100 + '%');
  const tweens = new WeakMap();
  const animateTo = (el, to, render) => {
    const from = tweens.get(el) ?? to;
    tweens.set(el, to);
    if (reduce || from === to) { el.textContent = render(to); return; }
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / 600);
      const v = from + (to - from) * (1 - Math.pow(1 - t, 3));
      el.textContent = render(v);
      if (t < 1 && tweens.get(el) === to) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const calculate = () => {
    const s = SUN[state.sun];
    const annualBill = state.bill * 12;
    const annualKwh = annualBill / 0.16;
    let offset = s.offset + (state.addons.has('wind') ? 0.08 : 0);
    let kw = (annualKwh * s.offset) / s.yield;
    const maxKw = state.area / 100; // ~100 sq ft per kW
    if (kw > maxKw) { offset *= maxKw / kw; kw = maxKw; }
    offset = Math.min(offset, 0.97);
    const yearly = annualBill * offset * (state.addons.has('monitoring') ? 1.03 : 1);
    const monthly = yearly / 12;
    const after = Math.max(0, state.bill - monthly);
    const panels = Math.max(1, Math.round((kw * 1000) / 400));
    let cost = kw * COST_PER_KW[state.type];
    state.addons.forEach((a) => (cost += ADDON_COST[a]));
    const net = cost * 0.7; // 30% federal tax credit
    const payback = net / yearly;
    const twentyFive = yearly * ((Math.pow(1.014, 25) - 1) / 0.014); // 1.4% yearly utility inflation
    const co2 = (annualKwh * offset * 0.31) / 1000;

    animateTo(els.year, yearly, (v) => '$' + fmt(v));
    els.sub.textContent = `≈ $${fmt(monthly)} saved every month · ${Math.round(offset * 100)}% of your bill offset`;
    animateTo(els.r25, Math.round(twentyFive / 100) * 100, (v) => '$' + fmt(Math.round(v / 100) * 100));
    els.payback.textContent = payback.toFixed(1) + ' years';
    els.system.textContent = `${kw.toFixed(1)} kW · ${panels} panels`;
    els.co2.textContent = co2.toFixed(1) + ' tons / year';
    els.before.textContent = '$' + fmt(state.bill);
    els.after.textContent = '$' + fmt(after);
    els.afterBar.style.width = Math.max(4, (after / state.bill) * 100) + '%';
  };
  const syncSliders = () => {
    els.bill.value = state.bill; els.area.value = state.area;
    els.billOut.textContent = '$' + fmt(state.bill) + (state.bill >= 1000 ? '+' : '');
    els.areaOut.textContent = fmt(state.area) + ' sq ft' + (state.area >= 10000 ? '+' : '');
    setFill(els.bill); setFill(els.area);
  };
  const setType = (type) => {
    state.type = type;
    $$('.chip').forEach((c) => c.setAttribute('aria-checked', String(c.dataset.type === type)));
  };
  els.bill.addEventListener('input', () => { state.bill = +els.bill.value; syncSliders(); calculate(); });
  els.area.addEventListener('input', () => { state.area = +els.area.value; syncSliders(); calculate(); });
  els.sun.addEventListener('change', () => { state.sun = els.sun.value; calculate(); });
  $$('.chip').forEach((c) => c.addEventListener('click', () => { setType(c.dataset.type); calculate(); }));
  $$('.toggle').forEach((t) => t.addEventListener('click', () => {
    const on = t.getAttribute('aria-pressed') !== 'true';
    t.setAttribute('aria-pressed', String(on));
    on ? state.addons.add(t.dataset.addon) : state.addons.delete(t.dataset.addon);
    calculate();
  }));
  syncSliders(); calculate();

  // Hero quick-check → fills the calculator and scrolls to it
  $('#quickForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    const bill = parseInt(String(f.bill.value).replace(/[^\d]/g, ''), 10);
    if (bill) state.bill = Math.min(1000, Math.max(50, Math.round(bill / 10) * 10));
    if (f.zip.value) $('#zip').value = f.zip.value;
    setType(f.type.value);
    if (f.type.value !== 'home' && state.area < 3000) state.area = f.type.value === 'industrial' ? 8000 : 4000;
    syncSliders(); calculate();
    document.getElementById('calculator').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    const card = $('.calc__result');
    card.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.02)' }, { transform: 'scale(1)' }], { duration: 700, delay: 700, easing: 'ease-out' });
  });

  /* ---------- 8. Case-study carousel (auto-play) ---------- */
  const carousel = $('.carousel');
  const cTrack = $('.carousel__track');
  const slides = $$('.slide', cTrack);
  const dotsWrap = $('.dots');
  const casesSec = $('.cases');
  const DURATION = 6000;
  let index = 0, timer = null, paused = false, inView = false;
  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.type = 'button'; d.className = 'dot'; d.setAttribute('role', 'tab'); d.setAttribute('aria-label', `Project ${i + 1}`);
    d.style.setProperty('--dur', DURATION + 'ms');
    d.addEventListener('click', () => go(i, true));
    dotsWrap.appendChild(d);
  });
  const dots = $$('.dot', dotsWrap);
  const go = (i, user) => {
    index = (i + slides.length) % slides.length;
    cTrack.style.transform = `translateX(calc(${-index * 100}% - ${index * 24}px))`;
    slides.forEach((s, k) => s.setAttribute('aria-hidden', String(k !== index)));
    dots.forEach((d, k) => {
      d.classList.remove('is-active'); void d.offsetWidth; // restart progress animation
      d.classList.toggle('is-active', k === index); d.setAttribute('aria-selected', String(k === index));
    });
    $$('[data-count]', slides[index]).forEach((el) => countUp(el, 1200));
    if (user) restart();
  };
  const restart = () => { clearTimeout(timer); if (!paused && inView && !reduce) timer = setTimeout(() => go(index + 1), DURATION); };
  const setPaused = (p) => { paused = p; casesSec.classList.toggle('is-paused', p); p ? clearTimeout(timer) : restart(); };
  $('[data-next]').addEventListener('click', () => go(index + 1, true));
  $('[data-prev]').addEventListener('click', () => go(index - 1, true));
  carousel.addEventListener('mouseenter', () => setPaused(true));
  carousel.addEventListener('mouseleave', () => setPaused(false));
  carousel.addEventListener('focusin', () => setPaused(true));
  carousel.addEventListener('focusout', () => setPaused(false));
  // swipe
  let sx = null;
  carousel.addEventListener('pointerdown', (e) => (sx = e.clientX));
  carousel.addEventListener('pointerup', (e) => { if (sx !== null && Math.abs(e.clientX - sx) > 50) go(index + (e.clientX < sx ? 1 : -1), true); sx = null; });
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; restart(); }, { threshold: 0.35 }).observe(carousel);
  go(0);

  /* ---------- 9. FAQ accordion ---------- */
  const QA = [
    ['How do I know which energy system is right for my property?', 'We start with a free energy assessment. Our team reviews your electricity usage, roof or land space, sunlight exposure, wind potential and backup power needs, then recommends the best-fit system for your goals and budget.'],
    ['Can Sunvolt Energy install both solar panels and battery storage?', 'Yes — most of our residential and commercial projects combine solar with battery storage so you can use clean power at night and during outages.'],
    ['Do you install EV charging stations for businesses?', 'We design and install Level 2 and DC fast chargers for offices, retail sites, fleets and multi-unit buildings, including load management and billing.'],
    ['Is a wind turbine installation suitable for every property?', 'Wind works best on open land with consistent wind speeds. Our assessment measures your site’s wind potential before recommending a turbine.'],
    ['How long does installation usually take?', 'Most residential systems are installed in 1–3 days. Including design and permits, the full project typically takes 4–8 weeks.'],
    ['What financing and incentives are available?', 'You can go solar with $0 down, use the 30% federal tax credit and local rebates. We handle the paperwork and compare plans for you.'],
  ];
  const list = $('#faqList');
  list.innerHTML = QA.map(([q, a], i) => `
    <div class="qa reveal${i === 0 ? ' is-open' : ''}" style="--d:${i * 0.05}s">
      <button class="qa__q t-h5" type="button" aria-expanded="${i === 0}" aria-controls="qa-${i}"><span>${i + 1}. ${q}</span>
        <span class="qa__toggle"><svg class="icon icon--plus"><use href="#i-plus"/></svg><svg class="icon icon--minus"><use href="#i-minus"/></svg></span></button>
      <div class="qa__a" id="qa-${i}" role="region"><div><p class="t-body-m">${a}</p></div></div>
    </div>`).join('');
  $$('.qa', list).forEach((item) => {
    revealIO.observe(item);
    $('.qa__q', item).addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      $$('.qa', list).forEach((o) => { o.classList.remove('is-open'); $('.qa__q', o).setAttribute('aria-expanded', 'false'); });
      if (open) { item.classList.add('is-open'); $('.qa__q', item).setAttribute('aria-expanded', 'true'); }
    });
  });

  /* ---------- 10. Lead form + newsletter ---------- */
  const lead = $('#leadForm');
  lead.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    $$('[required]', lead).forEach((inp) => {
      const valid = inp.value.trim() && (inp.type !== 'email' || /\S+@\S+\.\S+/.test(inp.value));
      inp.closest('.field').classList.toggle('is-invalid', !valid);
      if (!valid) ok = false;
    });
    if (!ok) { $('.is-invalid .field__control', lead).focus(); return; }
    lead.classList.add('is-sent');
  });
  $$('[required]', lead).forEach((inp) => inp.addEventListener('input', () => inp.closest('.field').classList.remove('is-invalid')));
  $('[data-reset]', lead).addEventListener('click', () => { lead.reset(); lead.classList.remove('is-sent'); });
  $('#quoteBtn').addEventListener('click', () => {
    const msg = lead.message;
    msg.value = `Calculator estimate: ${els.year.textContent}/year, ${els.system.textContent}, payback ${els.payback.textContent}.`;
  });
  $('#newsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = $('button', e.currentTarget);
    btn.textContent = 'Subscribed ✓';
    e.currentTarget.reset();
    setTimeout(() => (btn.textContent = 'Subscribe'), 2500);
  });
})();
