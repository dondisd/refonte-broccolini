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

    /* Hero épinglé : le scroll fond leurs trois tours l'une dans l'autre
       avec une poussée de caméra continue (BNC -> Radio-Canada -> Victoria) */
    const heroTl = gsap.timeline({
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=160%', scrub: 1, pin: true, anticipatePin: 1 }
    });
    heroTl
      .fromTo('.hero-img', { scale: 1 }, { scale: 1.12, ease: 'none', duration: 3 }, 0)
      .to('.s2', { opacity: 1, ease: 'none', duration: 1 }, 0.35)
      .to('.s3', { opacity: 1, ease: 'none', duration: 1 }, 1.75);

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
