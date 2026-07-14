/* BROCCOLINI v2 — pill nav (hamburger animé), reveals, compteurs,
   cartes glissantes + nav active (IntersectionObserver). Vanilla, zéro lib. */
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

  /* Compteurs */
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
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
    document.getElementById(b.dataset.cible)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }));
})();
