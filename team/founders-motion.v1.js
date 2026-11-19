// A one-time, small reveal per card and for the founders' shared origin.
export function revealFounders(section, preference) {
  const targets = [...section.querySelectorAll('.art-profile, .art-team-time')];
  const running = new Set();
  const watching = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      watching.unobserve(e.target);
      if (preference.matches || e.target.matches(':focus-within')) continue;
      const index = targets.indexOf(e.target);
      const a = e.target.animate([
        {opacity: .87, transform: 'translate3d(0, 8px, 0)'},
        {opacity: 1, transform: 'translate3d(0, 0, 0)'}
      ], {duration: 460, delay: (index % 3) * 42, easing: 'cubic-bezier(.22,.78,.3,1)', fill: 'none'});
      running.add(a);
      a.finished.then(() => running.delete(a), () => running.delete(a));
    }
  }, {threshold: .2});
  const stop = () => {
    if (!preference.matches) return;
    watching.disconnect();
    for (const a of running) a.cancel();
    preference.removeEventListener('change', stop);
  };
  preference.addEventListener?.('change', stop);
  targets.forEach(node => watching.observe(node));
}
