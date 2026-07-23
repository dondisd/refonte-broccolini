/* BROCCOLINI v6 — rideau signature + hero diorama (approuvés) + plongée raccordée
   au NOIR de la Collection (fix transition) + chapitres musée auto-cyclés + chips. */
(() => {
  'use strict';

  /* Progression */
  const bar = document.querySelector('.progress');
  addEventListener('scroll', () => {
    const h = document.documentElement;
    if (bar) bar.style.width = ((h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)) * 100).toFixed(2) + '%';
  }, { passive: true });

  /* Menu pill */
  const burger = document.querySelector('.burger');
  const menu = document.querySelector('.menu');
  if (burger && menu) {
    const toggle = (open) => { menu.hidden = !open; burger.setAttribute('aria-expanded', String(open)); };
    burger.addEventListener('click', () => toggle(menu.hidden));
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => toggle(false)));
  }

  /* Reveals */
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.18 });
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fx = !reduced && window.gsap && window.ScrollFX;

  /* ── CHAPITRES DU MUSÉE : auto-cycle 3,5 s + clic (structure #31 transposée) ── */
  const chapImgs = [...document.querySelectorAll('.chap-img')];
  const chapBtns = [...document.querySelectorAll('.chap')];
  const scCur = document.querySelector('.sc-cur');
  const chapN = document.querySelector('.chap-n');
  let chapActif = 0, chapTimer = null;
  function montreChap(i) {
    chapActif = i;
    chapImgs.forEach((im, k) => im.classList.toggle('actif', k === i));
    chapBtns.forEach((b, k) => b.classList.toggle('actif', k === i));
    const num = String(i + 1).padStart(2, '0');
    if (scCur) scCur.textContent = num;
    if (chapN) chapN.textContent = num;
  }
  function relanceCycle() {
    if (chapTimer) clearInterval(chapTimer);
    if (!reduced) chapTimer = setInterval(() => montreChap((chapActif + 1) % chapImgs.length), 3500);
  }
  chapBtns.forEach((b) => b.addEventListener('click', () => { montreChap(+b.dataset.i); relanceCycle(); }));
  if (chapImgs.length) relanceCycle();

  /* ── CHIPS du formulaire (multi-sélection) ── */
  document.querySelectorAll('.cc-chips .chip').forEach((c) =>
    c.addEventListener('click', () => c.classList.toggle('actif')));

  /* Formulaire (maquette) */
  const form = document.querySelector('.fa-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      form.innerHTML = '<p style="font-size:18px;font-weight:600">Demande envoyée ✓</p><p style="color:rgba(13,13,13,.55);font-size:13.5px;margin-top:6px">L\'équipe vous revient rapidement. (Maquette : aucune donnée transmise.)</p>';
    });
  }

  if (fx) {
    /* ── MODE SCROLL-DRIVEN ── */
    document.body.classList.add('fx');
    ScrollFX.init();

    /* RIDEAU « monte-charge » (signature Dondi), skippable */
    const rideau = document.querySelector('.rideau');
    const nivEl = document.querySelector('.r-niv');
    const nivState = { v: 0 };
    const monolithes = ['.m-l1', '.m-l2', '.m-g', '.m-d', '.m-c'];

    gsap.set('.r-marque span', { opacity: 0 });
    const ouverture = gsap.timeline();
    ouverture
      .set(monolithes, { yPercent: 118, opacity: 0 }, 2.1)
      .set('.halo', { opacity: 0, scale: 0.6 }, 2.1)
      .set(['.hero-bas h1', '.sous-titre', '.hero-boutons', '.hud'], { opacity: 0, y: 26 }, 2.1)
      .set('.ville', { scale: 1.16, rotationX: 7, transformOrigin: '50% 78%' }, 2.1)
      .to('.r-marque span', { opacity: 1, duration: 0.06, stagger: 0.055, ease: 'none' }, 0.15)
      .fromTo('.r-scan', { yPercent: 0, opacity: 1 }, {
        yPercent: () => -innerHeight, opacity: 1, duration: 1.5, ease: 'power1.inOut'
      }, 0.5)
      .to(nivState, {
        v: 75, duration: 1.5, ease: 'power1.inOut',
        onUpdate: () => { if (nivEl) nivEl.textContent = 'NIV ' + String(Math.round(nivState.v)).padStart(2, '0'); }
      }, 0.5)
      .to('.r-scan', { opacity: 0, duration: 0.2 }, 2.0)
      .to('.r-centre', { opacity: 0, duration: 0.35, ease: 'power1.in' }, 2.05)
      .to('.r-haut', { yPercent: -102, duration: 0.85, ease: 'expo.inOut' }, 2.3)
      .to('.r-bas', { yPercent: 102, duration: 0.85, ease: 'expo.inOut' }, 2.3)
      .set(rideau, { display: 'none' }, 3.2)
      .to('.ville', { scale: 1, rotationX: 0, duration: 1.6, ease: 'power2.out' }, 2.35)
      .to('.halo', { opacity: 1, scale: 1, duration: 1.1, ease: 'power2.out' }, 2.5)
      .to(monolithes, { yPercent: 0, opacity: 1, duration: 1.05, ease: 'back.out(1.4)', stagger: 0.16 }, 2.45)
      .to('.hero-bas h1', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 3.15)
      .to('.sous-titre', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 3.35)
      .to('.hero-boutons', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 3.5)
      .to('.hud', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 3.55);
    const skip = () => { if (ouverture.progress() < 1) ouverture.progress(1); retire(); };
    const retire = () => ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((e) => removeEventListener(e, skip));
    ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((e) => addEventListener(e, skip, { passive: true }));
    setTimeout(retire, 4200);

    /* PARALLAXE POINTEUR + dérive au repos */
    const rotY = gsap.quickTo('.ville', 'rotationY', { duration: 0.9, ease: 'power2.out' });
    const rotX = gsap.quickTo('.ville', 'rotationX', { duration: 0.9, ease: 'power2.out' });
    const cielX = gsap.quickTo('.ciel', 'x', { duration: 1.2, ease: 'power2.out' });
    const pousX = gsap.quickTo('.poussiere', 'x', { duration: 0.7, ease: 'power2.out' });
    const pousY = gsap.quickTo('.poussiere', 'y', { duration: 0.7, ease: 'power2.out' });
    let derniereSouris = 0;
    addEventListener('mousemove', (e) => {
      derniereSouris = performance.now();
      const nx = (e.clientX / innerWidth) * 2 - 1;
      const ny = (e.clientY / innerHeight) * 2 - 1;
      rotY(nx * 7); rotX(-ny * 3.5);
      cielX(nx * -14); pousX(nx * 26); pousY(ny * 14);
    }, { passive: true });
    gsap.ticker.add((t) => {
      if (performance.now() - derniereSouris < 2600) return;
      rotY(Math.sin(t * 0.45) * 4.5);
      rotX(Math.cos(t * 0.32) * 1.8);
      pousX(Math.sin(t * 0.5) * 16);
    });

    /* PLONGÉE-CAMÉRA raccordée : zoom dans la tour centrale -> FONDU NOIR
       (la même matière que le fond de la Collection : raccord invisible),
       et la section suivante arrive pré-zoomée. Fix de la transition Dondi. */
    const dive = gsap.timeline({
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=130%', scrub: 0.8, pin: true, anticipatePin: 1 }
    });
    dive
      .to(['.hero-bas', '.hud-g', '.hud-d'], { opacity: 0, y: -40, duration: 0.5, ease: 'power1.in' }, 0)
      .to('.ville', { scale: 3.0, y: '20svh', transformOrigin: '50% 62%', duration: 2.0, ease: 'power2.in' }, 0.1)
      .to('.poussiere', { opacity: 0, duration: 0.7 }, 0.25)
      .to('.fondu-noir', { opacity: 1, duration: 0.9, ease: 'power1.in' }, 1.25);
    /* Émergence : l'intro de la Collection arrive légèrement zoomée puis se pose */
    gsap.fromTo('.intro-col > *', { scale: 1.06, opacity: 0.4 }, {
      scale: 1, opacity: 1, ease: 'power2.out',
      scrollTrigger: { trigger: '.intro-col', start: 'top 85%', end: 'top 30%', scrub: 0.6 }
    });

    /* Compteurs scrubbed */
    ScrollFX.counters();

    /* Ancres internes via Lenis */
    if (ScrollFX.lenis) {
      document.querySelectorAll('a[href^="#"]').forEach((a) => {
        a.addEventListener('click', (e) => {
          const t = document.querySelector(a.getAttribute('href'));
          if (!t) return;
          e.preventDefault();
          ScrollFX.lenis.scrollTo(t, { offset: -70 });
        });
      });
    }
  } else {
    /* Fallback compteurs */
    const ioC = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        ioC.unobserve(e.target);
        const cible = parseInt(e.target.dataset.countTo, 10);
        if (reduced) { e.target.textContent = cible; return; }
        const t0 = performance.now();
        const tick = (t) => {
          const p = Math.min(1, (t - t0) / 1600);
          e.target.textContent = Math.round(cible * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('[data-count-to]').forEach((el) => ioC.observe(el));
  }
})();
