// The founders are server-rendered and always readable. Load motion only when it may actually play.
const section = document.querySelector('#about-us.art-team, #team .art-team-people')?.closest('section');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
if (section && 'IntersectionObserver' in window && Element.prototype.animate) {
  const cards = [...section.querySelectorAll('.art-profile, .art-team-time')];
  let started = false;
  const loader = new IntersectionObserver(entries => {
    if (started || motion.matches || !entries.some(e => e.isIntersecting && e.intersectionRatio > 0)) return;
    started = true;
    loader.disconnect();
    import('./founders-motion.v1.js').then(({ revealFounders }) => {
      if (!motion.matches && section.isConnected) revealFounders(section, motion);
    }).catch(() => { /* The static section is the fallback. */ });
  }, {rootMargin: '24px 0px', threshold: [0, .05]});
  const start = () => { if (!started && !motion.matches) cards.forEach(card => loader.observe(card)); else loader.disconnect(); };
  start();
  motion.addEventListener?.('change', start);
}
