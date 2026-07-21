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

    /* OBJET-HÉROS : la Place Banque Nationale s'assemble étage par étage.
       Tranches posées du BAS vers le HAUT (comme un chantier), ligne de
       niveau qui monte, HUD (étages, année) soudé à la même timeline. */
    const hudEtage = document.querySelector('[data-hud="etage"]');
    const hudAnnee = document.querySelector('[data-hud="annee"]');
    const tranches = [...document.querySelectorAll('.tranche')]
      .sort((a, b) => b.style.getPropertyValue('--i') - a.style.getPropertyValue('--i'));

    const buildTl = gsap.timeline({
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=250%', scrub: 1, pin: true, anticipatePin: 1 },
      onUpdate: () => {
        const p = Math.min(1, Math.max(0, (buildTl.progress() - 0.04) / 0.84));
        if (hudEtage) hudEtage.textContent = String(10 + Math.round(30 * p)).padStart(2, '0');
        if (hudAnnee) hudAnnee.textContent = String(1949 + Math.round(77 * p));
      }
    });
    /* Les 2 tranches du bas (fondations) sont déjà posées au chargement : LCP
       peinte immédiatement. Les 6 étages supérieurs s'assemblent au scroll. */
    tranches.slice(2).forEach((el, k) => {
      buildTl.from(el, { y: '-52svh', opacity: 0, ease: 'power2.out', duration: 1 }, 0.3 + k * 0.55);
    });
    buildTl.fromTo('.niveau', { bottom: '24.9%' }, { bottom: '99.6%', ease: 'none', duration: 0.3 + 5 * 0.55 + 0.7 }, 0);
    buildTl.to('.chantier', { opacity: 0, ease: 'none', duration: 0.7 }, '>-0.1');

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
