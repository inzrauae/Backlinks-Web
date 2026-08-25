/* ============================================================
   INZRA — interaction layer (vanilla ES6)
   ------------------------------------------------------------
   01. Utilities
   02. Loading screen
   03. Sticky nav, mobile menu, active link
   04. Scroll progress + scroll-to-top
   05. Typing effect
   06. Animated counters + SERP bar
   07. Reveal on scroll (Intersection Observer)
   08. Parallax on floating shapes
   09. FAQ accordion
   10. Button ripple
   11. Wishlist toggle
   12. Pricing period toggle
   13. Newsletter form
   14. Store search + category filter
   15. Buy button — WhatsApp link wiring
   ============================================================ */

(function () {
  'use strict';

  /* ==========================================================
     01. UTILITIES
     ========================================================== */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Throttle with requestAnimationFrame
  function onFrame(fn) {
    let ticking = false;
    return function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { fn(); ticking = false; });
    };
  }

  /* ==========================================================
     02. LOADING SCREEN
     ========================================================== */
  const loader = $('#loader');

  function hideLoader() {
    if (!loader) return;
    loader.classList.add('is-done');
    document.body.classList.remove('is-locked');
    window.setTimeout(() => { loader.style.display = 'none'; }, 700);
  }

  document.body.classList.add('is-locked');
  window.addEventListener('load', () => window.setTimeout(hideLoader, 650));
  // Safety net: never trap the page behind the loader
  window.setTimeout(hideLoader, 4000);


  /* ==========================================================
     03. STICKY NAV, MOBILE MENU, ACTIVE LINK
     ========================================================== */
  const nav = $('#nav');
  const burger = $('#burger');
  const navLinks = $('#navLinks');
  const links = $$('.nav__link');
  // Nav links now point to their own pages (e.g. marketplace.html); only
  // same-page hash links (e.g. #why) participate in scroll-based highlighting.
  const sections = links
    .map(link => link.getAttribute('href'))
    .filter(href => href && href.startsWith('#'))
    .map(href => $(href))
    .filter(Boolean);

  function closeMenu() {
    if (!burger || !navLinks) return;
    burger.classList.remove('is-open');
    navLinks.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
  }

  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const open = burger.classList.toggle('is-open');
      navLinks.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
  }

  // Close the menu after choosing a destination
  $$('#navLinks a').forEach(a => a.addEventListener('click', closeMenu));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });

  function updateNav() {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('is-stuck', y > 24);

    // Highlight the section currently under the header
    let current = sections[0];
    sections.forEach(sec => {
      if (sec.offsetTop - 140 <= y) current = sec;
    });
    if (current) {
      links.forEach(link => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${current.id}`);
      });
    }
  }


  /* ==========================================================
     04. SCROLL PROGRESS + SCROLL TO TOP
     ========================================================== */
  const progressFill = $('#progressFill');
  const toTop = $('#toTop');

  function updateScrollUI() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (toTop) toTop.classList.toggle('is-visible', window.scrollY > 520);
  }

  if (toTop) {
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }


  /* ==========================================================
     05. TYPING EFFECT
     ========================================================== */
  const typed = $('#typed');
  const phrases = ['actually rank.', 'editors stand behind.', 'pass real equity.', 'survive core updates.'];

  if (typed) {
    if (reduceMotion) {
      typed.textContent = phrases[0];
    } else {
      let pIndex = 0, cIndex = 0, deleting = false;

      const type = () => {
        const word = phrases[pIndex];
        cIndex += deleting ? -1 : 1;
        typed.textContent = word.slice(0, cIndex);

        let wait = deleting ? 34 : 62;
        if (!deleting && cIndex === word.length) { wait = 1900; deleting = true; }
        else if (deleting && cIndex === 0) {
          deleting = false;
          pIndex = (pIndex + 1) % phrases.length;
          wait = 260;
        }
        window.setTimeout(type, wait);
      };
      window.setTimeout(type, 700);
    }
  }


  /* ==========================================================
     06. ANIMATED COUNTERS + SERP BAR
     ========================================================== */
  function formatNumber(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function countUp(el) {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const duration = 1900;
    const start = performance.now();

    if (reduceMotion) {
      el.textContent = formatNumber(target) + suffix;
      return;
    }

    const step = now => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      el.textContent = formatNumber(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      countUp(entry.target);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  $$('.stat__num').forEach(el => counterObserver.observe(el));

  // SERP position bar in the hero
  const serpFill = $('#serpFill');
  if (serpFill) window.setTimeout(() => { serpFill.style.width = '92%'; }, 1200);


  /* ==========================================================
     07. REVEAL ON SCROLL
     ========================================================== */
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  $$('.reveal').forEach(el => revealObserver.observe(el));


  /* ==========================================================
     08. PARALLAX
     ========================================================== */
  const parallaxItems = $$('[data-parallax]');

  function updateParallax() {
    if (reduceMotion) return;
    const y = window.scrollY;
    parallaxItems.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0;
      el.style.setProperty('translate', `0 ${(y * speed).toFixed(1)}px`);
    });
  }


  /* ==========================================================
     09. FAQ ACCORDION
     ========================================================== */
  $$('.faq__item').forEach(item => {
    const btn = $('.faq__q', item);
    const panel = $('.faq__a', item);
    if (!btn || !panel) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // One panel at a time
      $$('.faq__item.is-open').forEach(other => {
        other.classList.remove('is-open');
        $('.faq__q', other).setAttribute('aria-expanded', 'false');
        $('.faq__a', other).style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = `${panel.scrollHeight}px`;
      }
    });
  });

  // Keep an open panel correctly sized when the layout reflows
  window.addEventListener('resize', onFrame(() => {
    const open = $('.faq__item.is-open .faq__a');
    if (open) open.style.maxHeight = `${open.scrollHeight}px`;
  }));


  /* ==========================================================
     10. BUTTON RIPPLE
     ========================================================== */
  $$('.ripple').forEach(btn => {
    btn.addEventListener('click', e => {
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const wave = document.createElement('span');
      wave.className = 'ripple__wave';
      wave.style.width = wave.style.height = `${size}px`;
      wave.style.left = `${e.clientX - rect.left - size / 2}px`;
      wave.style.top = `${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(wave);
      window.setTimeout(() => wave.remove(), 640);
    });
  });


  /* ==========================================================
     11. WISHLIST
     ========================================================== */
  $$('.pkg__wish').forEach(btn => {
    btn.addEventListener('click', () => {
      const saved = btn.classList.toggle('is-saved');
      btn.setAttribute('aria-pressed', String(saved));
      const icon = $('i', btn);
      if (icon) icon.className = saved ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    });
  });


  /* ==========================================================
     12. PRICING PERIOD TOGGLE
     ========================================================== */
  const monthlyBtn = $('#billMonthly');
  const annualBtn = $('#billAnnual');
  const amounts = $$('.plan__amt');

  function setPeriod(period) {
    const annual = period === 'annual';

    if (monthlyBtn && annualBtn) {
      monthlyBtn.classList.toggle('is-active', !annual);
      annualBtn.classList.toggle('is-active', annual);
      monthlyBtn.setAttribute('aria-pressed', String(!annual));
      annualBtn.setAttribute('aria-pressed', String(annual));
    }

    amounts.forEach(el => {
      const from = parseInt(el.textContent.replace(/[^\d]/g, ''), 10) || 0;
      const to = parseInt(annual ? el.dataset.annual : el.dataset.monthly, 10) || 0;

      if (reduceMotion) { el.textContent = formatNumber(to); return; }

      const start = performance.now();
      const step = now => {
        const p = Math.min((now - start) / 420, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = formatNumber(Math.round(from + (to - from) * eased));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  if (monthlyBtn) monthlyBtn.addEventListener('click', () => setPeriod('monthly'));
  if (annualBtn) annualBtn.addEventListener('click', () => setPeriod('annual'));


  /* ==========================================================
     13. NEWSLETTER FORM
     ========================================================== */
  const newsForm = $('#newsForm');
  const newsNote = $('#newsNote');
  const newsEmail = $('#newsEmail');

  if (newsForm && newsNote && newsEmail) {
    const field = newsEmail.closest('.field');
    const valid = value => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

    newsForm.addEventListener('submit', e => {
      e.preventDefault();
      newsNote.classList.remove('is-ok', 'is-error');
      field.classList.remove('has-error');

      if (!valid(newsEmail.value)) {
        field.classList.add('has-error');
        newsNote.classList.add('is-error');
        newsNote.textContent = 'That address is missing an @ or a domain. Check it and try again.';
        newsEmail.focus();
        return;
      }

      newsNote.classList.add('is-ok');
      newsNote.textContent = `Subscribed. The next publisher list lands in ${newsEmail.value.trim()} on Tuesday.`;
      newsForm.reset();
    });

    newsEmail.addEventListener('input', () => {
      field.classList.remove('has-error');
      newsNote.classList.remove('is-error');
    });
  }


  /* ==========================================================
     14. STORE SEARCH + CATEGORY FILTER (products page)
     ========================================================== */
  const productSearch = $('#productSearch');
  const productCategory = $('#productCategory');
  const listingCards = $$('.listing');
  const storeCount = $('#storeCount');
  const noResults = $('#noResults');

  function filterListings() {
    if (!listingCards.length) return;
    const q = (productSearch?.value || '').trim().toLowerCase();
    const cat = productCategory?.value || '';
    let visible = 0;

    listingCards.forEach(card => {
      const title = card.dataset.title || '';
      const category = card.dataset.category || '';
      const match = (!q || title.includes(q)) && (!cat || category === cat);
      card.style.display = match ? '' : 'none';
      if (match) visible++;
    });

    if (storeCount) storeCount.textContent = `Showing ${visible} of ${listingCards.length} products`;
    if (noResults) noResults.classList.toggle('is-visible', visible === 0);
  }

  if (productSearch) productSearch.addEventListener('input', filterListings);
  if (productCategory) productCategory.addEventListener('change', filterListings);


  /* ==========================================================
     15. BUY BUTTON — WHATSAPP LINK WIRING (product detail pages)
     ----------------------------------------------------------
     "Order on WhatsApp" opens a chat with INZRA, pre-filled with
     the product name, price and SKU so the buyer just adds their
     target URL and anchor text preference before sending.
     ========================================================== */
  const WHATSAPP_NUMBER = '94778064714';

  $$('.js-buy-btn').forEach(btn => {
    const product = btn.dataset.product;
    if (!product) return;
    const price = btn.dataset.price;
    const sku = btn.dataset.sku;

    const lines = [
      `Hi INZRA! I'd like to order: ${product}${price ? ` ($${price})` : ''}${sku ? ` — SKU ${sku}` : ''}.`,
      '',
      'Target URL: ',
      'Anchor text preference: '
    ];
    btn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
  });


  /* ==========================================================
     SINGLE SCROLL LISTENER
     ========================================================== */
  const onScroll = onFrame(() => {
    updateNav();
    updateScrollUI();
    updateParallax();
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  updateNav();
  updateScrollUI();

})();
