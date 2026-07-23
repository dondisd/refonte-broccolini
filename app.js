/* BROCCOLINI v3 — scroll-driven (GSAP/ScrollTrigger/Lenis via ScrollFX) :
   hero épinglé au fondu des tours, compteurs scrubbed, galerie horizontale
   épinglée, éditorial mot à mot. Fallback complet sans JS avancé (IO). */
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

  if (fx) {
    /* ── MODE SCROLL-DRIVEN ─────────────────────────────────────────── */
    document.body.classList.add('fx');
    ScrollFX.init();

    /* ── RIDEAU « monte-charge » : lettres qui s'allument, scan NIV 00->75,
       ouverture des panneaux, puis les monolithes SORTENT DE TERRE. Skippable. ── */
    const rideau = document.querySelector('.rideau');
    const nivEl = document.querySelector('.r-niv');
    const nivState = { v: 0 };
    const monolithes = ['.m-l1', '.m-l2', '.m-g', '.m-d', '.m-c'];

    gsap.set('.r-marque span', { opacity: 0 });
    gsap.set(monolithes, { yPercent: 118, opacity: 0 });
    gsap.set('.halo', { opacity: 0, scale: 0.6 });
    gsap.set(['.hero-bas h1', '.sous-titre', '.hero-boutons', '.hud'], { opacity: 0, y: 26 });
    gsap.set('.ville', { scale: 1.16, rotationX: 7, transformOrigin: '50% 78%' });

    const ouverture = gsap.timeline();
    ouverture
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
      /* Entrée caméra + la ville sort de terre (chevauche l'ouverture) */
      .to('.ville', { scale: 1, rotationX: 0, duration: 1.6, ease: 'power2.out' }, 2.35)
      .to('.halo', { opacity: 1, scale: 1, duration: 1.1, ease: 'power2.out' }, 2.5)
      .to(monolithes, {
        yPercent: 0, opacity: 1, duration: 1.05, ease: 'back.out(1.4)', stagger: 0.16
      }, 2.45)
      .to('.hero-bas h1', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 3.15)
      .to('.sous-titre', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 3.35)
      .to('.hero-boutons', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 3.5)
      .to('.hud', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 3.55);
    /* Skip : premier geste = saut à la fin du rite */
    const skip = () => { if (ouverture.progress() < 1) ouverture.progress(1); retire(); };
    const retire = () => ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((e) => removeEventListener(e, skip));
    ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((e) => addEventListener(e, skip, { passive: true, once: false }));
    setTimeout(retire, 4200);

    /* ── PARALLAXE POINTEUR sur 3 couches (+ dérive automatique au repos) ── */
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
    /* Dérive sinusoïdale quand aucun pointeur (mobile / captures sans souris) */
    gsap.ticker.add((t) => {
      if (performance.now() - derniereSouris < 2600) return;
      rotY(Math.sin(t * 0.45) * 4.5);
      rotX(Math.cos(t * 0.32) * 1.8);
      pousX(Math.sin(t * 0.5) * 16);
    });

    /* ── PLONGÉE-CAMÉRA : le scroll entre DANS la tour centrale, la matière
       fait le raccord vers la barre rouge (loi n°2 du storytelling). ── */
    const dive = gsap.timeline({
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=160%', scrub: 0.8, pin: true, anticipatePin: 1 }
    });
    dive
      .to(['.hero-bas', '.hud-g', '.hud-d'], { opacity: 0, y: -40, duration: 0.55, ease: 'power1.in' }, 0)
      .to('.ville', { scale: 3.1, y: '22svh', transformOrigin: '50% 62%', duration: 2.2, ease: 'power2.in' }, 0.12)
      .to('.poussiere', { opacity: 0, duration: 0.8 }, 0.3)
      .to('.ciel', { opacity: 0.4, duration: 1.4 }, 0.8)
      .to('.hero', { backgroundColor: '#c60e26', duration: 0.9, ease: 'power1.in' }, 1.7)
      .to('.monde', { opacity: 0, duration: 0.7, ease: 'power1.in' }, 1.75);

    /* Compteurs pilotés par le scroll (l'ancre VO « numbers count themselves up ») */
    document.querySelectorAll('.compteur').forEach((el) => {
      const cible = parseInt(el.dataset.cible, 10);
      const st = { v: 0 };
      gsap.to(st, {
        v: cible, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 88%', end: 'top 35%', scrub: 0.6 },
        onUpdate: () => { el.textContent = Math.round(st.v); }
      });
    });

    /* Galerie horizontale épinglée : le scroll vertical fait défiler les adresses */
    ScrollFX.horizontal(document.querySelector('.galzone'));

    /* Éditorial mot à mot */
    ScrollFX.textScrub(document.querySelector('.grand-texte'));

    /* Ancres internes via Lenis (offset nav pill) */
    if (ScrollFX.lenis) {
      document.querySelectorAll('a[href^="#"]').forEach((a) => {
        a.addEventListener('click', (e) => {
          const t = document.querySelector(a.getAttribute('href'));
          if (!t) return;
          e.preventDefault();
          ScrollFX.lenis.scrollTo(t, { offset: -90 });
        });
      });
    }
  } else {
    /* ── FALLBACK (reduced motion ou GSAP absent) : compteurs IO ────── */
    const ioC = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        ioC.unobserve(e.target);
        const cible = parseInt(e.target.dataset.cible, 10);
        if (reduced) { e.target.textContent = cible; return; }
        const t0 = performance.now();
        const tick = (t) => {
          const p = Math.min(1, (t - t0) / 1800);
          e.target.textContent = Math.round(cible * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('.compteur').forEach((el) => ioC.observe(el));
  }

  /* Cartes : révélation en glissant depuis la droite (une seule fois) */
  const ioR = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('vue'); ioR.unobserve(e.target); } });
  }, { threshold: 0.15 });
  document.querySelectorAll('.carte').forEach((el) => ioR.observe(el));

  /* Nav active (threshold 0.6) + clic -> scroll centré */
  const boutons = [...document.querySelectorAll('.nav-cartes button')];
  const ioA = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      boutons.forEach((b) => b.classList.toggle('actif', b.dataset.cible === e.target.id));
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('.carte').forEach((el) => ioA.observe(el));
  boutons.forEach((b) => b.addEventListener('click', () => {
    const t = document.getElementById(b.dataset.cible);
    if (!t) return;
    if (fx && ScrollFX.lenis) ScrollFX.lenis.scrollTo(t, { offset: -window.innerHeight * 0.25 });
    else t.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }));

  /* Formulaire du footer (maquette : aucune donnée transmise) */
  const form = document.querySelector('.fa-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      form.innerHTML = '<p style="font-size:18px;font-weight:600">Demande envoyée ✓</p><p style="color:rgba(255,255,255,.5);font-size:14px;margin-top:8px">L\'équipe vous revient rapidement. (Maquette : aucune donnée transmise.)</p>';
    });
  }
})();
