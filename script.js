/* ============================================================
   ANCHORBASE — interaction layer (vanilla ES6)
   ------------------------------------------------------------
   01. Utilities
   02. Loading screen
   03. Theme toggle (light / dark)
   04. Sticky nav, mobile menu, active link
   05. Scroll progress + scroll-to-top
   06. Typing effect
   07. Animated counters + SERP bar
   08. Reveal on scroll (Intersection Observer)
   09. Parallax on floating shapes
   10. FAQ accordion
   11. Button ripple
   12. Wishlist toggle
   13. Pricing period toggle
   14. Newsletter form
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

  // Storage that never throws in sandboxed contexts
  const store = {
    get(key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } },
    set(key, val) { try { window.localStorage.setItem(key, val); } catch (e) { /* session only */ } }
  };


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
     03. THEME TOGGLE
     ========================================================== */
  const root = document.documentElement;
  const themeBtn = $('#themeToggle');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (!themeBtn) return;
    const dark = theme === 'dark';
    themeBtn.innerHTML = `<i class="fa-solid fa-${dark ? 'sun' : 'moon'}" aria-hidden="true"></i>`;
    themeBtn.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`);
  }

  const savedTheme = store.get('anchorbase-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      store.set('anchorbase-theme', next);
    });
  }


  /* ==========================================================
     04. STICKY NAV, MOBILE MENU, ACTIVE LINK
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
     05. SCROLL PROGRESS + SCROLL TO TOP
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
     06. TYPING EFFECT
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
     07. ANIMATED COUNTERS + SERP BAR
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
     08. REVEAL ON SCROLL
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
     09. PARALLAX
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
     10. FAQ ACCORDION
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
     11. BUTTON RIPPLE
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
     12. WISHLIST
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
     13. PRICING PERIOD TOGGLE
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
     14. NEWSLETTER FORM
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
     15. STORE SEARCH + CATEGORY FILTER (products page)
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
     16. BUY BUTTON — PAYPAL LINK WIRING (product detail pages)
     ----------------------------------------------------------
     TODO before launch: replace PAYPAL_USERNAME with the real
     PayPal.me username so "Buy now" sends buyers to a real,
     working payment page. Until then this is a placeholder.
     ========================================================== */
  const PAYPAL_USERNAME = 'YOUR-PAYPAL-USERNAME';

  $$('.js-buy-btn').forEach(btn => {
    const price = btn.dataset.price;
    if (!price) return;
    btn.href = `https://paypal.me/${PAYPAL_USERNAME}/${price}`;
  });


  /* ==========================================================
     17. ORDER DETAILS MODAL — collects delivery info before PayPal
     ----------------------------------------------------------
     Buyer fills target URL / anchor text / email / notes. On
     submit we open a pre-filled mailto: to order@inzra.com (no
     backend involved) and open the PayPal link in a new tab.
     ========================================================== */
  const orderModal = $('#orderModal');
  const orderForm = $('#orderForm');
  const orderNote = $('#orderModalNote');
  const buyBtn = $('.js-buy-btn');

  if (orderModal && orderForm && buyBtn) {
    let pendingPaypalUrl = '';

    const openOrderModal = () => {
      pendingPaypalUrl = buyBtn.href;
      orderModal.classList.add('is-open');
      orderModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('is-locked');
      const firstField = $('input[name="url"]', orderForm);
      if (firstField) firstField.focus();
    };

    const closeOrderModal = () => {
      orderModal.classList.remove('is-open');
      orderModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('is-locked');
    };

    buyBtn.addEventListener('click', e => {
      e.preventDefault();
      openOrderModal();
    });

    $$('[data-order-close]', orderModal).forEach(el => el.addEventListener('click', closeOrderModal));

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && orderModal.classList.contains('is-open')) closeOrderModal();
    });

    const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
    const validUrl = value => /^https?:\/\/.+\..+/.test(value.trim());

    orderForm.addEventListener('submit', e => {
      e.preventDefault();
      orderNote.classList.remove('is-error', 'is-ok');

      const urlField = $('input[name="url"]', orderForm);
      const emailField = $('input[name="email"]', orderForm);
      const anchorField = $('input[name="anchor"]', orderForm);
      const notesField = $('textarea[name="notes"]', orderForm);

      urlField.closest('.order-modal__field').classList.remove('has-error');
      emailField.closest('.order-modal__field').classList.remove('has-error');

      let hasError = false;
      if (!validUrl(urlField.value)) {
        urlField.closest('.order-modal__field').classList.add('has-error');
        hasError = true;
      }
      if (!validEmail(emailField.value)) {
        emailField.closest('.order-modal__field').classList.add('has-error');
        hasError = true;
      }
      if (hasError) {
        orderNote.classList.add('is-error');
        orderNote.textContent = 'Please add a valid target URL (including https://) and email address.';
        return;
      }

      const product = buyBtn.dataset.product || document.title;
      const price = buyBtn.dataset.price || '';
      const sku = buyBtn.dataset.sku || '';

      const bodyLines = [
        `Product: ${product}`,
        `Price: $${price}`,
        `SKU: ${sku}`,
        '',
        `Target URL: ${urlField.value.trim()}`,
        `Anchor text: ${anchorField.value.trim() || '(none specified)'}`,
        `Buyer email: ${emailField.value.trim()}`,
        '',
        'Notes:',
        notesField.value.trim() || '(none)'
      ];
      const mailto = `mailto:order@inzra.com?subject=${encodeURIComponent('New order - ' + sku)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;

      if (pendingPaypalUrl) window.open(pendingPaypalUrl, '_blank', 'noopener');
      window.location.href = mailto;

      orderNote.classList.add('is-ok');
      orderNote.textContent = 'Opening your email app to send these details, and PayPal in a new tab.';
      window.setTimeout(closeOrderModal, 1800);
    });
  }


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
