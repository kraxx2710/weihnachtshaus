/* Öffentliche Darstellung der Medien-Ordner auf presse.html und
   bibliothek.html. Liest /api/media (Ordner) und /api/content
   (Seitentexte). Robust: fehlende Daten -> Hinweis statt Fehler. */
(function () {
  'use strict';

  const KIND = document.body.dataset.mediaKind; // "presse" | "bibliothek"
  const root = document.getElementById('media-root');
  if (!KIND || !root) return;

  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function fmtDate(d) {
    if (!d) return '';
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
    return m ? `${m[3]}.${m[2]}.${m[1]}` : d;
  }

  function downloadUrl(url) {
    return url.includes('blob.vercel-storage.com') ? `${url}${url.includes('?') ? '&' : '?'}download=1` : url;
  }

  function videoEmbed(link) {
    const yt = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/.exec(link || '');
    return yt ? `https://www.youtube-nocookie.com/embed/${yt[1]}` : null;
  }

  function cardImage(it) {
    return `
      <button class="media-card media-card--image gallery-item" type="button" data-full="${esc(it.url)}">
        <img src="${esc(it.thumb || it.url)}" alt="${esc(it.title || it.name || 'Bild')}" loading="lazy">
        ${it.title ? `<span class="media-card__cap">${esc(it.title)}</span>` : ''}
      </button>
      ${KIND === 'presse' ? `<a class="media-dl" href="${esc(downloadUrl(it.url))}" download>⬇ Download in Originalgröße</a>` : ''}`;
  }

  function cardPdf(it) {
    return `
      <a class="media-card media-card--doc" href="${esc(it.url)}" target="_blank" rel="noopener">
        <span class="media-doc__icon">PDF</span>
        <span class="media-doc__body">
          <strong>${esc(it.title || it.name || 'Dokument')}</strong>
          <small>${esc([it.source, fmtDate(it.date)].filter(Boolean).join(' · '))}</small>
        </span>
        <span class="media-doc__cta">Öffnen ↗</span>
      </a>`;
  }

  function cardLink(it) {
    const embed = videoEmbed(it.link);
    if (embed) {
      return `
        <div class="media-card media-card--video">
          <iframe src="${esc(embed)}" title="${esc(it.title || 'Video')}" loading="lazy" allowfullscreen
                  allow="accelerometer; encrypted-media; picture-in-picture"></iframe>
          <span class="media-doc__body">
            <strong>${esc(it.title || 'Video')}</strong>
            <small>${esc([it.source, fmtDate(it.date)].filter(Boolean).join(' · '))}</small>
          </span>
        </div>`;
    }
    return `
      <a class="media-card media-card--doc" href="${esc(it.link)}" target="_blank" rel="noopener">
        <span class="media-doc__icon">↗</span>
        <span class="media-doc__body">
          <strong>${esc(it.title || it.link)}</strong>
          <small>${esc([it.source, fmtDate(it.date)].filter(Boolean).join(' · '))}</small>
        </span>
        <span class="media-doc__cta">Beitrag ansehen</span>
      </a>`;
  }

  function renderAlbum(a) {
    const items = a.items.filter(i => !i.hidden);
    if (!items.length) return '';
    const cards = items.map(it =>
      `<div class="media-cell media-cell--${it.type}">${
        it.type === 'pdf' ? cardPdf(it) : it.type === 'link' ? cardLink(it) : cardImage(it)
      }</div>`).join('');
    return `
      <section class="media-album reveal visible">
        <div class="media-album__head">
          <h2>${esc(a.title)}</h2>
          ${a.text ? `<p>${esc(a.text)}</p>` : ''}
        </div>
        <div class="media-grid">${cards}</div>
      </section>`;
  }

  async function load() {
    try {
      const [media, content] = await Promise.all([
        fetch('/api/media').then(r => r.json()),
        fetch('/api/content').then(r => r.json()).catch(() => []),
      ]);
      const texte = {};
      (content || []).forEach(r => { texte[r.id] = r.wert; });
      const h1 = document.querySelector('[data-text="title"]');
      const p  = document.querySelector('[data-text="intro"]');
      if (h1 && texte[`${KIND}_title`]) h1.innerHTML = texte[`${KIND}_title`];
      if (p  && texte[`${KIND}_text`])  p.innerHTML  = texte[`${KIND}_text`];
      const note = document.querySelector('[data-cms="footer_ki_note"]');
      if (note && texte.footer_ki_note) note.innerHTML = texte.footer_ki_note;

      const albums = (media.albums || []).filter(a => a.kind === KIND);
      const html = albums.map(renderAlbum).join('');
      root.innerHTML = html || `<p class="media-empty">Hier gibt es bald mehr zu sehen.</p>`;
    } catch (e) {
      root.innerHTML = `<p class="media-empty">Inhalte konnten gerade nicht geladen werden. Bitte später erneut versuchen.</p>`;
    }
  }

  // Grossansicht: lightbox.js

  load();
})();
