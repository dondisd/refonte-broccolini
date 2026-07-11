/* BROCCOLINI — progression, reveals, compteurs animés. Vanilla, zéro lib. */
(() => {
  'use strict';

  const bar = document.querySelector('.progress');
  addEventListener('scroll', () => {
    const h = document.documentElement;
    if (bar) bar.style.width = ((h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)) * 100).toFixed(2) + '%';
  }, { passive: true });

  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.18 });
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

  /* Compteurs : 0 -> cible (easeOutCubic) au premier passage */
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
})();
