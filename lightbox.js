/* Großansicht für alle Galerien (Startseite, Presse, Bibliothek).
   Blättern per Pfeil, Tastatur, Wischen; Vorschauleiste unten. */
(function () {
  'use strict';
  const box = document.querySelector('.lightbox');
  if (!box) return;

  box.innerHTML = `
    <div class="lb-top">
      <span class="lb-counter" aria-live="polite"></span>
      <button class="lightbox-close" type="button" aria-label="Bild schließen">Schließen</button>
    </div>
    <div class="lb-stage">
      <button class="lb-nav lb-prev" type="button" aria-label="Vorheriges Bild">‹</button>
      <img src="" alt="" draggable="false">
      <button class="lb-nav lb-next" type="button" aria-label="Nächstes Bild">›</button>
    </div>
    <div class="lb-strip" role="listbox" aria-label="Alle Bilder"></div>
  `;
  const img = box.querySelector('img');
  const counter = box.querySelector('.lb-counter');
  const strip = box.querySelector('.lb-strip');
  const btnClose = box.querySelector('.lightbox-close');
  const btnPrev = box.querySelector('.lb-prev');
  const btnNext = box.querySelector('.lb-next');

  let items = [];   // { full, thumb, alt }
  let index = 0;
  let stripBuiltFor = null;

  function collect() {
    return [...document.querySelectorAll('.gallery-item')]
      .filter(el => el.dataset.full && el.offsetParent !== null)
      .map(el => {
        const t = el.querySelector('img');
        return { full: el.dataset.full, thumb: t ? t.currentSrc || t.src : el.dataset.full, alt: t ? t.alt : '', el };
      });
  }

  function buildStrip() {
    strip.innerHTML = '';
    items.forEach((it, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'lb-thumb';
      b.setAttribute('role', 'option');
      b.setAttribute('aria-label', `Bild ${i + 1}`);
      const t = document.createElement('img');
      t.src = it.thumb; t.alt = ''; t.loading = 'lazy'; t.decoding = 'async'; t.draggable = false;
      b.appendChild(t);
      b.addEventListener('click', () => show(i));
      strip.appendChild(b);
    });
    strip.hidden = items.length < 2;
    btnPrev.hidden = btnNext.hidden = items.length < 2;
  }

  function preload(i) {
    if (items[i]) { const p = new Image(); p.src = items[i].full; }
  }

  function show(i, direction) {
    if (!items.length) return;
    index = (i + items.length) % items.length;
    const it = items[index];
    img.classList.add('is-loading');
    img.classList.toggle('slide-left', direction === 1);
    img.classList.toggle('slide-right', direction === -1);
    const done = () => { img.classList.remove('is-loading', 'slide-left', 'slide-right'); };
    img.onload = done; img.onerror = done;
    img.src = it.full;
    img.alt = it.alt;
    counter.textContent = items.length > 1 ? `${index + 1} / ${items.length}` : '';
    [...strip.children].forEach((b, k) => {
      b.classList.toggle('active', k === index);
      b.setAttribute('aria-selected', k === index ? 'true' : 'false');
    });
    const active = strip.children[index];
    if (active) active.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    preload(index + 1); preload(index - 1);
  }

  function open(startEl) {
    items = collect();
    const key = items.map(x => x.full).join('|');
    if (key !== stripBuiltFor) { buildStrip(); stripBuiltFor = key; }
    const start = Math.max(0, items.findIndex(x => x.el === startEl));
    box.classList.add('open');
    box.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    show(start);
    btnClose.focus({ preventScroll: true });
  }

  function close() {
    box.classList.remove('open');
    box.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
  }

  // Öffnen per Delegation: gilt auch für nachgeladene Bilder
  document.addEventListener('click', e => {
    const item = e.target.closest('.gallery-item');
    if (item && item.dataset.full) { e.preventDefault(); open(item); }
  });
  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', e => { e.stopPropagation(); show(index - 1, -1); });
  btnNext.addEventListener('click', e => { e.stopPropagation(); show(index + 1, 1); });
  box.addEventListener('click', e => {
    // Klick auf den dunklen Hintergrund schließt; Klick aufs Bild blättert weiter
    if (e.target === box || e.target.classList.contains('lb-stage')) close();
    else if (e.target === img && items.length > 1 && !swiped) show(index + 1, 1);
  });
  document.addEventListener('keydown', e => {
    if (!box.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') show(index + 1, 1);
    else if (e.key === 'ArrowLeft') show(index - 1, -1);
  });

  // Wischen am Handy (und Ziehen mit der Maus)
  let startX = 0, startY = 0, tracking = false, swiped = false;
  const stage = box.querySelector('.lb-stage');
  stage.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; tracking = true; swiped = false; startX = e.clientX; startY = e.clientY; });
  stage.addEventListener('pointerup', e => {
    if (!tracking) return; tracking = false;
    const dx = e.clientX - startX, dy = e.clientY - startY;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) { swiped = true; show(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1); }
    else if (dy > 90 && Math.abs(dx) < 60) { swiped = true; close(); }
  });
  stage.addEventListener('pointercancel', () => { tracking = false; });
  // Vorschauleiste: horizontales Scrollen mit dem Mausrad
  strip.addEventListener('wheel', e => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { e.preventDefault(); strip.scrollLeft += e.deltaY; } }, { passive: false });
})();
