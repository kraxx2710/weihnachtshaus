/* ══════════════════════════════════════════════════════════
   Weihnachtshaus CMS – Vercel-native
   Backend: Vercel KV (Texte) + Vercel Blob (Bilder)
   Auth:    Passwort via /api/login → Token in localStorage
══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const TOKEN_KEY = 'wh_cms_token';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ── Schema ────────────────────────────────────────────
  const SCHEMA = [
    {
      key: 'hero', emoji: '🌟', label: 'Hero – Hauptbereich',
      selector: '.hero',
      felder: [
        { id: 'hero_eyebrow', label: 'Kleiner Text oben',               typ: 'text' },
        { id: 'hero_title1',  label: 'Überschrift Zeile 1',             typ: 'text' },
        { id: 'hero_title2',  label: 'Überschrift Zeile 2 (kursiv)',     typ: 'text' },
        { id: 'hero_copy',    label: 'Beschreibungstext',                typ: 'textarea' },
        { id: 'hero_date',    label: 'Datum (z.B. 21. Nov. 2026)',       typ: 'text' },
        { id: 'hero_image',   label: 'Hintergrundbild',                  typ: 'image' },
      ]
    },
    {
      key: 'zahlen', emoji: '✨', label: 'Zahlen & Fakten',
      selector: '.numbers',
      felder: [
        { id: 'num1_val', label: 'Zahl 1', typ: 'text' },
        { id: 'num1_lbl', label: 'Text 1', typ: 'text' },
        { id: 'num2_val', label: 'Zahl 2', typ: 'text' },
        { id: 'num2_lbl', label: 'Text 2', typ: 'text' },
        { id: 'num3_val', label: 'Zahl 3', typ: 'text' },
        { id: 'num3_lbl', label: 'Text 3', typ: 'text' },
        { id: 'num4_val', label: 'Zahl 4', typ: 'text' },
        { id: 'num4_lbl', label: 'Text 4', typ: 'text' },
      ]
    },
    {
      key: 'erlebnis', emoji: '🎄', label: 'Erlebnis / Bilder',
      selector: '.intro',
      felder: [
        { id: 'intro_h2',   label: 'Überschrift',        typ: 'text' },
        { id: 'intro_text', label: 'Beschreibungstext',  typ: 'textarea' },
        { id: 'feat1_img',  label: 'Bild 1 – Foto',      typ: 'image' },
        { id: 'feat1_tag',  label: 'Bild 1 – Kategorie', typ: 'text' },
        { id: 'feat1_h3',   label: 'Bild 1 – Titel',     typ: 'text' },
        { id: 'feat2_img',  label: 'Bild 2 – Foto',      typ: 'image' },
        { id: 'feat2_tag',  label: 'Bild 2 – Kategorie', typ: 'text' },
        { id: 'feat2_h3',   label: 'Bild 2 – Titel',     typ: 'text' },
        { id: 'feat_quote', label: 'Zitat',               typ: 'textarea' },
        { id: 'feat_cite',  label: 'Zitat – Autor',       typ: 'text' },
      ]
    },
    {
      key: 'besuch', emoji: '📅', label: 'Besuch planen',
      selector: '.visit',
      felder: [
        { id: 'visit_von_day',    label: 'Öffnung – Tag',         typ: 'text' },
        { id: 'visit_von_month',  label: 'Öffnung – Monat',       typ: 'text' },
        { id: 'visit_von_year',   label: 'Öffnung – Jahr',        typ: 'text' },
        { id: 'visit_bis_day',    label: 'Ende – Tag',            typ: 'text' },
        { id: 'visit_bis_month',  label: 'Ende – Monat',          typ: 'text' },
        { id: 'visit_bis_year',   label: 'Ende – Jahr',           typ: 'text' },
        { id: 'visit_hours',      label: 'Öffnungszeiten',        typ: 'text' },
        { id: 'visit_hours_note', label: 'Hinweis zu den Zeiten', typ: 'text' },
        { id: 'visit_tip_text',   label: 'Tipp – Text',           typ: 'textarea' },
        { id: 'visit_zug_text',   label: 'Bummelzug – Text',      typ: 'textarea' },
      ]
    },
    {
      key: 'charity', emoji: '❤️', label: 'Charity',
      selector: '.charity',
      felder: [
        { id: 'charity_img',           label: 'Bild',          typ: 'image' },
        { id: 'charity_eyebrow',       label: 'Kleiner Text',  typ: 'text' },
        { id: 'charity_h2',            label: 'Überschrift',   typ: 'text' },
        { id: 'charity_text',          label: 'Text',          typ: 'textarea' },
        { id: 'charity_impact_strong', label: 'Spendenbetrag', typ: 'text' },
        { id: 'charity_impact_span',   label: 'Spendentext',   typ: 'text' },
      ]
    },
    {
      key: 'projekte', emoji: '🤝', label: 'Spendenaktionen',
      selector: '.projects',
      felder: [
        { id: 'proj1_img',  label: 'Projekt 1 – Bild',     typ: 'image' },
        { id: 'proj1_tag',  label: 'Projekt 1 – Zeitraum', typ: 'text' },
        { id: 'proj1_h3',   label: 'Projekt 1 – Titel',    typ: 'text' },
        { id: 'proj1_text', label: 'Projekt 1 – Text',      typ: 'textarea' },
        { id: 'proj2_img',  label: 'Projekt 2 – Bild',     typ: 'image' },
        { id: 'proj2_tag',  label: 'Projekt 2 – Zeitraum', typ: 'text' },
        { id: 'proj2_h3',   label: 'Projekt 2 – Titel',    typ: 'text' },
        { id: 'proj2_text', label: 'Projekt 2 – Text',      typ: 'textarea' },
        { id: 'proj3_img',  label: 'Projekt 3 – Bild',     typ: 'image' },
        { id: 'proj3_tag',  label: 'Projekt 3 – Zeitraum', typ: 'text' },
        { id: 'proj3_h3',   label: 'Projekt 3 – Titel',    typ: 'text' },
        { id: 'proj3_text', label: 'Projekt 3 – Text',      typ: 'textarea' },
        { id: 'proj4_img',  label: 'Projekt 4 – Bild',     typ: 'image' },
        { id: 'proj4_tag',  label: 'Projekt 4 – Zeitraum', typ: 'text' },
        { id: 'proj4_h3',   label: 'Projekt 4 – Titel',    typ: 'text' },
        { id: 'proj4_text', label: 'Projekt 4 – Text',      typ: 'textarea' },
      ]
    },
    {
      key: 'geschichte', emoji: '📖', label: 'Geschichte / Familie',
      selector: '.story',
      felder: [
        { id: 'story_h2',    label: 'Überschrift', typ: 'text' },
        { id: 'story_p1',    label: 'Absatz 1',     typ: 'textarea' },
        { id: 'story_p2',    label: 'Absatz 2',     typ: 'textarea' },
        { id: 'story_p3',    label: 'Absatz 3',     typ: 'textarea' },
        { id: 'story_img',   label: 'Portraitfoto', typ: 'image' },
        { id: 'story_quote', label: 'Zitat',        typ: 'textarea' },
      ]
    },
    {
      key: 'galerie', emoji: '📷', label: 'Galerie – Fotos',
      selector: '.gallery',
      felder: [
        { id: 'gal1_img', label: 'Foto 1', typ: 'image' },
        { id: 'gal2_img', label: 'Foto 2', typ: 'image' },
        { id: 'gal3_img', label: 'Foto 3', typ: 'image' },
        { id: 'gal4_img', label: 'Foto 4', typ: 'image' },
        { id: 'gal5_img', label: 'Foto 5', typ: 'image' },
        { id: 'gal6_img', label: 'Foto 6', typ: 'image' },
      ]
    },
    {
      key: 'abschluss', emoji: '🌙', label: 'Abschluss / Einladung',
      selector: '.closing',
      felder: [
        { id: 'closing_eyebrow', label: 'Kleiner Text',                  typ: 'text' },
        { id: 'closing_h2_1',    label: 'Überschrift Zeile 1',           typ: 'text' },
        { id: 'closing_h2_2',    label: 'Überschrift Zeile 2 (kursiv)',   typ: 'text' },
      ]
    },
  ];

  // ── API-Helfer ────────────────────────────────────────
  function apiToken() { return localStorage.getItem(TOKEN_KEY); }

  async function apiFetch(path, opts = {}) {
    const res = await fetch(path, {
      headers: { 'Content-Type': 'application/json', ...opts.headers },
      ...opts,
    });
    if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
    return res.json();
  }

  // ── Inhalte laden (für alle Besucher) ────────────────
  async function loadContent() {
    try {
      const rows = await apiFetch('/api/content');
      rows.forEach(r => applyToDOM(r.id, r.wert));
    } catch (e) {
      console.warn('CMS: Inhalte konnten nicht geladen werden.', e.message);
    }
  }

  function applyToDOM(fieldId, value) {
    if (!value) return;
    const el = document.querySelector(`[data-cms="${fieldId}"]`);
    if (!el) return;
    if (el.tagName === 'IMG') {
      el.src = value;
      const btn = el.closest('[data-full]');
      if (btn) btn.dataset.full = value;
    } else {
      el.textContent = value;
    }
  }

  // ── Feld speichern ────────────────────────────────────
  let saveTimer = null;

  async function saveField(fieldId, value) {
    setToolbarStatus('Speichert…', 'saving');
    try {
      await apiFetch('/api/content', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiToken()}` },
        body: JSON.stringify({ id: fieldId, wert: value }),
      });
      setToolbarStatus('✓ Gespeichert', 'saved');
      setTimeout(() => setToolbarStatus('Admin-Modus aktiv', ''), 2500);
    } catch (e) {
      console.error('CMS save error:', e);
      setToolbarStatus('⚠ Fehler beim Speichern', 'error');
    }
  }

  function scheduleSave(fieldId, value) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveField(fieldId, value), 900);
  }

  // ── Bild hochladen ────────────────────────────────────
  async function uploadImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result.split(',')[1];
          const ext = file.name.split('.').pop();
          const { url } = await apiFetch('/api/upload', {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiToken()}` },
            body: JSON.stringify({ filename: `${Date.now()}.${ext}`, data: base64 }),
          });
          resolve(url);
        } catch (e) { reject(e); }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ── Toolbar-Status ────────────────────────────────────
  function setToolbarStatus(text, cls) {
    const el = document.getElementById('cms-status');
    if (!el) return;
    el.textContent = text;
    el.className = 'cms-status ' + (cls || '');
  }

  // ── Init ──────────────────────────────────────────────
  async function init() {
    await loadContent();
    if (new URLSearchParams(window.location.search).has('admin')) {
      loadAdminAssets();
    }
  }

  function loadAdminAssets() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'cms.css';
    document.head.appendChild(link);
    if (localStorage.getItem(TOKEN_KEY)) {
      startAdminMode();
    } else {
      showLoginModal();
    }
  }

  // ── Login-Modal ───────────────────────────────────────
  function showLoginModal() {
    const overlay = document.createElement('div');
    overlay.id = 'cms-login-overlay';
    overlay.innerHTML = `
      <div id="cms-login-box">
        <div class="cms-login-logo">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="#e6b554">
            <path d="M12 2L9 9H2l5.5 4-2 7L12 16l6.5 4-2-7L22 9h-7L12 2z"/>
          </svg>
          <span>Weihnachtshaus</span>
          <small>Admin-Bereich</small>
        </div>
        <h2>Bitte anmelden</h2>
        <div class="cms-field-group">
          <label>Passwort</label>
          <input type="password" id="cms-password" placeholder="••••••••" autocomplete="current-password">
        </div>
        <div id="cms-login-error"></div>
        <button id="cms-login-btn">Anmelden</button>
      </div>
    `;
    document.body.appendChild(overlay);

    const btn = document.getElementById('cms-login-btn');
    const errEl = document.getElementById('cms-login-error');

    async function doLogin() {
      const pw = document.getElementById('cms-password').value;
      if (!pw) { errEl.textContent = 'Bitte Passwort eingeben.'; return; }
      btn.disabled = true;
      btn.textContent = 'Anmelden …';
      errEl.textContent = '';
      try {
        const { token } = await apiFetch('/api/login', {
          method: 'POST',
          body: JSON.stringify({ password: pw }),
        });
        localStorage.setItem(TOKEN_KEY, token);
        overlay.remove();
        startAdminMode();
      } catch {
        errEl.textContent = 'Falsches Passwort.';
        btn.disabled = false;
        btn.textContent = 'Anmelden';
      }
    }

    btn.addEventListener('click', doLogin);
    document.getElementById('cms-password').addEventListener('keydown', e => {
      if (e.key === 'Enter') doLogin();
    });
  }

  // ── Admin-Modus ───────────────────────────────────────
  function startAdminMode() {
    document.body.classList.add('cms-active');
    injectToolbar();
    injectPanel();
    wrapSections();
  }

  function injectToolbar() {
    const bar = document.createElement('div');
    bar.id = 'cms-toolbar';
    bar.innerHTML = `
      <div class="cms-brand">
        <svg viewBox="0 0 24 24"><path d="M12 2L9 9H2l5.5 4-2 7L12 16l6.5 4-2-7L22 9h-7L12 2z"/></svg>
        Weihnachtshaus CMS
      </div>
      <div id="cms-status" class="cms-status">Admin-Modus aktiv</div>
      <span class="cms-hint">✏ Bereich anklicken zum Bearbeiten</span>
      <button id="cms-logout">Abmelden</button>
    `;
    document.body.prepend(bar);
    document.getElementById('cms-logout').addEventListener('click', () => {
      localStorage.removeItem(TOKEN_KEY);
      location.reload();
    });
  }

  function injectPanel() {
    const panel = document.createElement('div');
    panel.id = 'cms-panel';
    panel.innerHTML = `
      <div id="cms-panel-header">
        <div id="cms-panel-title"><span class="cms-section-emoji">✏️</span> Bereich bearbeiten</div>
        <button id="cms-panel-close">✕</button>
      </div>
      <div id="cms-panel-save-status"></div>
      <div id="cms-panel-body"></div>
      <div id="cms-panel-footer">
        <button id="cms-save-all">Alle Änderungen speichern</button>
      </div>
    `;
    document.body.appendChild(panel);
    document.getElementById('cms-panel-close').addEventListener('click', closePanel);
    document.getElementById('cms-save-all').addEventListener('click', saveAllVisible);
  }

  function openPanel(sec) {
    const panel = document.getElementById('cms-panel');
    document.getElementById('cms-panel-title').innerHTML =
      `<span class="cms-section-emoji">${sec.emoji}</span> ${sec.label}`;

    const status = document.getElementById('cms-panel-save-status');
    status.textContent = '';
    status.className = '';

    const body = document.getElementById('cms-panel-body');
    body.innerHTML = '';
    body.dataset.section = sec.key;

    sec.felder.forEach(feld => {
      const wrap = document.createElement('div');
      wrap.className = 'cms-field-group';
      wrap.dataset.fieldId = feld.id;

      const lbl = document.createElement('label');
      lbl.textContent = feld.label;
      wrap.appendChild(lbl);

      const domEl = document.querySelector(`[data-cms="${feld.id}"]`);

      if (feld.typ === 'image') {
        const fid = 'file-' + feld.id;
        const preview = document.createElement('div');
        preview.className = 'cms-image-field';
        preview.innerHTML = `
          <img class="cms-image-preview" src="${domEl ? domEl.src : ''}" alt="">
          <label class="cms-image-upload-btn" for="${fid}">📁 Neues Bild wählen</label>
          <input class="cms-image-upload-input" type="file" id="${fid}" accept="image/*">
        `;
        preview.querySelector('.cms-image-upload-input').addEventListener('change', async function () {
          const file = this.files[0];
          if (!file) return;
          setPanelStatus('Bild wird hochgeladen …', 'saving');
          try {
            const url = await uploadImage(file);
            preview.querySelector('.cms-image-preview').src = url;
            applyToDOM(feld.id, url);
            await saveField(feld.id, url);
            setPanelStatus('✓ Bild gespeichert', 'saved');
          } catch {
            setPanelStatus('⚠ Upload fehlgeschlagen', 'error');
          }
        });
        wrap.appendChild(preview);

      } else if (feld.typ === 'textarea') {
        const ta = document.createElement('textarea');
        ta.value = domEl ? domEl.textContent.trim() : '';
        ta.addEventListener('input', () => {
          applyToDOM(feld.id, ta.value);
          scheduleSave(feld.id, ta.value);
          setPanelStatus('Speichert…', 'saving');
        });
        wrap.appendChild(ta);

      } else {
        const inp = document.createElement('input');
        inp.type = 'text';
        inp.value = domEl ? domEl.textContent.trim() : '';
        inp.addEventListener('input', () => {
          applyToDOM(feld.id, inp.value);
          scheduleSave(feld.id, inp.value);
          setPanelStatus('Speichert…', 'saving');
        });
        wrap.appendChild(inp);
      }

      body.appendChild(wrap);
      const divider = document.createElement('div');
      divider.className = 'cms-divider';
      body.appendChild(divider);
    });

    panel.classList.add('open');
  }

  function closePanel() {
    document.getElementById('cms-panel').classList.remove('open');
  }

  function setPanelStatus(text, cls) {
    const el = document.getElementById('cms-panel-save-status');
    if (!el) return;
    el.textContent = text;
    el.className = cls || '';
  }

  async function saveAllVisible() {
    const body = document.getElementById('cms-panel-body');
    const sec = SCHEMA.find(s => s.key === body.dataset.section);
    if (!sec) return;
    const btn = document.getElementById('cms-save-all');
    btn.disabled = true;
    btn.textContent = 'Speichert …';
    for (const feld of sec.felder) {
      if (feld.typ === 'image') continue;
      const wrap = body.querySelector(`[data-field-id="${feld.id}"]`);
      const input = wrap && wrap.querySelector('input, textarea');
      if (input) await saveField(feld.id, input.value);
    }
    btn.disabled = false;
    btn.textContent = '✓ Alle gespeichert';
    setTimeout(() => { btn.textContent = 'Alle Änderungen speichern'; }, 2500);
    setPanelStatus('✓ Alle Felder gespeichert', 'saved');
  }

  function wrapSections() {
    SCHEMA.forEach(sec => {
      const el = document.querySelector(sec.selector);
      if (!el) return;
      el.classList.add('cms-section-wrap');
      const btn = document.createElement('button');
      btn.className = 'cms-edit-btn';
      btn.innerHTML = `✏️ ${sec.label} bearbeiten`;
      btn.addEventListener('click', e => { e.stopPropagation(); openPanel(sec); });
      el.appendChild(btn);
    });
  }

})();
