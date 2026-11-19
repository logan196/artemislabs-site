(() => {
  'use strict';
  function draw(items) {
    const target = document.getElementById('art-notes-latest');
    if (!target || target.childElementCount || !items.length) return;
    const ul = document.createElement('ul'); ul.className = 'art-latest-list';
    for (const {slug, date, title} of items) {
      const li = document.createElement('li'), a = document.createElement('a'), time = document.createElement('time');
      a.href = '/notes/' + slug + '/'; a.textContent = title; time.dateTime = date; time.textContent = date;
      li.append(a, time); ul.append(li);
    }
    target.append(ul);
  }
  async function ready() {
    try {
      const r = await fetch('/notes/feed.json', {cache:'no-cache', credentials:'same-origin', signal:AbortSignal.timeout(6000)});
      if (!r.ok) return; const j = await r.json(); if (j.schema !== 1 || !Array.isArray(j.entries)) return;
      const valid = j.entries.filter(e => typeof e?.slug === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(e.slug) && typeof e?.date === 'string' && /^\d{4}-\d\d-\d\d$/.test(e.date) && typeof e?.title === 'string').slice(0,3);
      draw(valid);
      let check = new MutationObserver(() => {if (document.querySelector('#art-notes-latest:empty')) draw(valid);});
      if (valid.length) { check.observe(document.body,{childList:true,subtree:true}); setTimeout(()=>check.disconnect(),6000); }
    } catch (_) { /* All notes remains an ordinary link on networks where the list cannot load. */ }
  }
  if (document.readyState === 'complete') ready(); else window.addEventListener('load',ready,{once:true});
})();
