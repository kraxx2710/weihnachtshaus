/* ══════════════════════════════════════════════════════════
   Weihnachtshaus CMS – Vercel-native
   Backend: Vercel KV (Texte) + Vercel Blob (Bilder)
   Auth:    Passwort via /api/login → Token in localStorage
══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const TOKEN_KEY = 'wh_cms_token';

  // Website-Farben für den Textfarben-Picker
  const FARBEN = [
    { name: 'Gold',  value: '#e6b554' },
    { name: 'Creme', value: '#f5efe0' },
    { name: 'Weiß',  value: '#ffffff' },
    { name: 'Grün',  value: '#0d2e23' },
    { name: 'Dunkel',value: '#071710' },
    { name: 'Rot',   value: '#b94040' },
  ];

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
        { id: 'hero_eyebrow', label: 'Kleiner Text oben',           typ: 'text' },
        { id: 'hero_title1',  label: 'Überschrift Zeile 1',         typ: 'text' },
        { id: 'hero_title2',  label: 'Überschrift Zeile 2 (kursiv)',typ: 'text' },
        { id: 'hero_copy',    label: 'Beschreibungstext',            typ: 'textarea' },
        { id: 'hero_date',    label: 'Datum (z.B. 21. Nov. 2026)',   typ: 'text' },
        { id: 'hero_image',   label: 'Hintergrundbild',              typ: 'image' },
      ]
    },
    {
      key: 'zahlen', emoji: '✨', label: 'Zahlen & Fakten',
      selector: '.numbers',
      felder: [
        { id: 'num1_val', label: 'Zahl 1',  typ: 'text' },
        { id: 'num1_lbl', label: 'Text 1',  typ: 'text' },
        { id: 'num2_val', label: 'Zahl 2',  typ: 'text' },
        { id: 'num2_lbl', label: 'Text 2',  typ: 'text' },
        { id: 'num3_val', label: 'Zahl 3',  typ: 'text' },
        { id: 'num3_lbl', label: 'Text 3',  typ: 'text' },
        { id: 'num4_val', label: 'Zahl 4',  typ: 'text' },
        { id: 'num4_lbl', label: 'Text 4',  typ: 'text' },
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
        { id: 'visit_eyebrow',    label: 'Kleiner Text oben',      typ: 'text' },
        { id: 'visit_h2',         label: 'Überschrift',            typ: 'text' },
        { id: 'visit_von_day',    label: 'Öffnung – Tag',          typ: 'text' },
        { id: 'visit_von_month',  label: 'Öffnung – Monat',        typ: 'text' },
        { id: 'visit_von_year',   label: 'Öffnung – Jahr',         typ: 'text' },
        { id: 'visit_bis_day',    label: 'Ende – Tag',             typ: 'text' },
        { id: 'visit_bis_month',  label: 'Ende – Monat',           typ: 'text' },
        { id: 'visit_bis_year',   label: 'Ende – Jahr',            typ: 'text' },
        { id: 'visit_hours',      label: 'Öffnungszeiten',         typ: 'text' },
        { id: 'visit_hours_note', label: 'Hinweis zu den Zeiten',  typ: 'text' },
        { id: 'visit_tip_text',   label: 'Tipp – Text',            typ: 'textarea' },
        { id: 'visit_zug_text',   label: 'Bummelzug – Text',       typ: 'textarea' },
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
      key: 'causes', emoji: '🌍', label: 'Wirkung / Zahlen',
      selector: '.causes',
      felder: [
        { id: 'causes_kicker',   label: 'Kicker-Text oben',       typ: 'text' },
        { id: 'causes_h2',       label: 'Überschrift',             typ: 'text' },
        { id: 'causes_text',     label: 'Beschreibungstext',       typ: 'textarea' },
        { id: 'causes_imp1_num', label: 'Impact 1 – Zahl',         typ: 'text' },
        { id: 'causes_imp1_lbl', label: 'Impact 1 – Bezeichnung',  typ: 'text' },
        { id: 'causes_imp1_text',label: 'Impact 1 – Text',         typ: 'textarea' },
        { id: 'causes_imp2_num', label: 'Impact 2 – Zahl',         typ: 'text' },
        { id: 'causes_imp2_lbl', label: 'Impact 2 – Bezeichnung',  typ: 'text' },
        { id: 'causes_imp2_text',label: 'Impact 2 – Text',         typ: 'textarea' },
        { id: 'causes_imp3_num', label: 'Impact 3 – Zahl',         typ: 'text' },
        { id: 'causes_imp3_lbl', label: 'Impact 3 – Bezeichnung',  typ: 'text' },
        { id: 'causes_imp3_text',label: 'Impact 3 – Text',         typ: 'textarea' },
        { id: 'causes_list',     label: 'Organisationen (HTML)',    typ: 'textarea' },
      ]
    },
    {
      key: 'projekte', emoji: '🤝', label: 'Spendenaktionen',
      selector: '.projects',
      felder: [
        { id: 'proj1_img',  label: 'Projekt 1 – Bild',     typ: 'image' },
        { id: 'proj1_tag',  label: 'Projekt 1 – Zeitraum', typ: 'text' },
        { id: 'proj1_h3',   label: 'Projekt 1 – Titel',    typ: 'text' },
        { id: 'proj1_text', label: 'Projekt 1 – Text',     typ: 'textarea' },
        { id: 'proj2_img',  label: 'Projekt 2 – Bild',     typ: 'image' },
        { id: 'proj2_tag',  label: 'Projekt 2 – Zeitraum', typ: 'text' },
        { id: 'proj2_h3',   label: 'Projekt 2 – Titel',    typ: 'text' },
        { id: 'proj2_text', label: 'Projekt 2 – Text',     typ: 'textarea' },
        { id: 'proj3_img',  label: 'Projekt 3 – Bild',     typ: 'image' },
        { id: 'proj3_tag',  label: 'Projekt 3 – Zeitraum', typ: 'text' },
        { id: 'proj3_h3',   label: 'Projekt 3 – Titel',    typ: 'text' },
        { id: 'proj3_text', label: 'Projekt 3 – Text',     typ: 'textarea' },
        { id: 'proj4_img',  label: 'Projekt 4 – Bild',     typ: 'image' },
        { id: 'proj4_tag',  label: 'Projekt 4 – Zeitraum', typ: 'text' },
        { id: 'proj4_h3',   label: 'Projekt 4 – Titel',    typ: 'text' },
        { id: 'proj4_text', label: 'Projekt 4 – Text',     typ: 'textarea' },
      ]
    },
    {
      key: 'geschichte', emoji: '📖', label: 'Geschichte / Familie',
      selector: '.story',
      felder: [
        { id: 'story_h2',    label: 'Überschrift',   typ: 'text' },
        { id: 'story_p1',    label: 'Absatz 1',      typ: 'textarea' },
        { id: 'story_p2',    label: 'Absatz 2',      typ: 'textarea' },
        { id: 'story_p3',    label: 'Absatz 3',      typ: 'textarea' },
        { id: 'story_img',   label: 'Portraitfoto',  typ: 'image' },
        { id: 'story_quote', label: 'Zitat',         typ: 'textarea' },
      ]
    },
    {
      key: 'sponsoren', emoji: '🏆', label: 'Sponsoren',
      selector: '.sponsors',
      felder: [
        { id: 'sponsors_eyebrow', label: 'Kleiner Text oben',   typ: 'text' },
        { id: 'sponsors_h2',      label: 'Überschrift',          typ: 'text' },
        { id: 'sponsors_text',    label: 'Beschreibungstext',    typ: 'textarea' },
        { id: 'sp01_img', label: 'Logo 01 – Suncredia',          typ: 'image' },
        { id: 'sp01_url', label: 'Link 01 – Suncredia',          typ: 'text' },
        { id: 'sp02_img', label: 'Logo 02 – Solarvie',           typ: 'image' },
        { id: 'sp02_url', label: 'Link 02 – Solarvie',           typ: 'text' },
        { id: 'sp03_img', label: 'Logo 03 – Burgenland',         typ: 'image' },
        { id: 'sp03_url', label: 'Link 03 – Burgenland',         typ: 'text' },
        { id: 'sp04_img', label: 'Logo 04 – Grün Weiss',         typ: 'image' },
        { id: 'sp04_url', label: 'Link 04 – Grün Weiss',         typ: 'text' },
        { id: 'sp05_img', label: 'Logo 05 – Spar',               typ: 'image' },
        { id: 'sp05_url', label: 'Link 05 – Spar',               typ: 'text' },
        { id: 'sp06_img', label: 'Logo 06 – Dieselkino',         typ: 'image' },
        { id: 'sp06_url', label: 'Link 06 – Dieselkino',         typ: 'text' },
        { id: 'sp07_img', label: 'Logo 07 – Märchenwald',        typ: 'image' },
        { id: 'sp07_url', label: 'Link 07 – Märchenwald',        typ: 'text' },
        { id: 'sp08_img', label: 'Logo 08 – Leo Hillinger',      typ: 'image' },
        { id: 'sp08_url', label: 'Link 08 – Leo Hillinger',      typ: 'text' },
        { id: 'sp09_img', label: 'Logo 09 – Avita',              typ: 'image' },
        { id: 'sp09_url', label: 'Link 09 – Avita',              typ: 'text' },
        { id: 'sp10_img', label: 'Logo 10 – Saubermacher',       typ: 'image' },
        { id: 'sp10_url', label: 'Link 10 – Saubermacher',       typ: 'text' },
        { id: 'sp11_img', label: 'Logo 11 – Loranth',            typ: 'image' },
        { id: 'sp11_url', label: 'Link 11 – Loranth',            typ: 'text' },
        { id: 'sp12_img', label: 'Logo 12 – EEG Premstätten',    typ: 'image' },
        { id: 'sp12_url', label: 'Link 12 – EEG',                typ: 'text' },
        { id: 'sp13_img', label: 'Logo 13 – Dsire Tea',          typ: 'image' },
        { id: 'sp13_url', label: 'Link 13 – Dsire Tea',          typ: 'text' },
        { id: 'sp14_img', label: 'Logo 14 – UDB',                typ: 'image' },
        { id: 'sp14_url', label: 'Link 14 – UDB',                typ: 'text' },
        { id: 'sp15_img', label: 'Logo 15 – MK Illumination',    typ: 'image' },
        { id: 'sp15_url', label: 'Link 15 – MK Illumination',    typ: 'text' },
        { id: 'sp16_img', label: 'Logo 16 – Stiegl',             typ: 'image' },
        { id: 'sp16_url', label: 'Link 16 – Stiegl',             typ: 'text' },
        { id: 'sp17_img', label: 'Logo 17 – Lagerhaus',          typ: 'image' },
        { id: 'sp17_url', label: 'Link 17 – Lagerhaus',          typ: 'text' },
        { id: 'sp18_img', label: 'Logo 18',                      typ: 'image' },
        { id: 'sp18_url', label: 'Link 18',                      typ: 'text' },
        { id: 'sp19_img', label: 'Logo 19 – Entertainment',      typ: 'image' },
        { id: 'sp19_url', label: 'Link 19 – Entertainment',      typ: 'text' },
        { id: 'sp20_img', label: 'Logo 20 – ICS',                typ: 'image' },
        { id: 'sp20_url', label: 'Link 20 – ICS',                typ: 'text' },
        { id: 'sp21_img', label: 'Logo 21',                      typ: 'image' },
        { id: 'sp21_url', label: 'Link 21',                      typ: 'text' },
        { id: 'sp22_img', label: 'Logo 22',                      typ: 'image' },
        { id: 'sp22_url', label: 'Link 22',                      typ: 'text' },
        { id: 'sp23_img', label: 'Logo 23 – Haas',               typ: 'image' },
        { id: 'sp23_url', label: 'Link 23 – Haas',               typ: 'text' },
        { id: 'sp24_img', label: 'Logo 24',                      typ: 'image' },
        { id: 'sp24_url', label: 'Link 24',                      typ: 'text' },
        { id: 'sp25_img', label: 'Logo 25 – Transgourmet',       typ: 'image' },
        { id: 'sp25_url', label: 'Link 25 – Transgourmet',       typ: 'text' },
        { id: 'sp26_img', label: 'Logo 26 – Frankstahl',         typ: 'image' },
        { id: 'sp26_url', label: 'Link 26 – Frankstahl',         typ: 'text' },
        { id: 'sp27_img', label: 'Logo 27 – Murtalinfo',         typ: 'image' },
        { id: 'sp27_url', label: 'Link 27 – Murtalinfo',         typ: 'text' },
        { id: 'sp28_img', label: 'Logo 28 – Bäckerei Bayer',     typ: 'image' },
        { id: 'sp28_url', label: 'Link 28 – Bäckerei Bayer',     typ: 'text' },
        { id: 'sp29_img', label: 'Logo 29 – Stipits',            typ: 'image' },
        { id: 'sp29_url', label: 'Link 29 – Stipits',            typ: 'text' },
        { id: 'sp30_img', label: 'Logo 30 – Ritter Sport',       typ: 'image' },
        { id: 'sp30_url', label: 'Link 30 – Ritter Sport',       typ: 'text' },
      ]
    },
    {
      key: 'galerie', emoji: '📷', label: 'Galerie – Fotos',
      selector: '.gallery',
      felder: [
        { id: 'gallery_eyebrow', label: 'Kleiner Text oben', typ: 'text' },
        { id: 'gallery_h2',      label: 'Überschrift',       typ: 'text' },
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
        { id: 'closing_eyebrow', label: 'Kleiner Text',                typ: 'text' },
        { id: 'closing_h2_1',    label: 'Überschrift Zeile 1',         typ: 'text' },
        { id: 'closing_h2_2',    label: 'Überschrift Zeile 2 (kursiv)', typ: 'text' },
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
    } else if (el.tagName === 'A') {
      el.href = value;
    } else {
      // innerHTML bewahrt <em>, <span style> etc.
      el.innerHTML = value;
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

  function scheduleSave(fieldId, getValue) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveField(fieldId, getValue()), 900);
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
        <button id="cms-save-all">💾 Alle Änderungen speichern</button>
      </div>
    `;
    document.body.appendChild(panel);
    document.getElementById('cms-panel-close').addEventListener('click', closePanel);
    document.getElementById('cms-save-all').addEventListener('click', saveAllVisible);
  }

  // ── Farbwähler-Toolbar für Textfelder ─────────────────
  function buildColorToolbar(editor) {
    const bar = document.createElement('div');
    bar.className = 'cms-color-toolbar';
    bar.innerHTML = '<span class="cms-color-label">Farbe für markierten Text:</span>';

    FARBEN.forEach(f => {
      const btn = document.createElement('button');
      btn.className = 'cms-color-swatch';
      btn.title = f.name;
      btn.style.background = f.value;
      if (f.value === '#ffffff') btn.style.border = '1px solid #ccc';
      btn.addEventListener('mousedown', e => {
        e.preventDefault(); // Fokus im editor behalten
        const sel = window.getSelection();
        if (sel && sel.rangeCount && !sel.isCollapsed) {
          document.execCommand('foreColor', false, f.value);
        } else {
          // Kein Text markiert → ganzes Feld einfärben
          document.execCommand('selectAll', false, null);
          document.execCommand('foreColor', false, f.value);
          // Selektion wieder aufheben
          sel && sel.removeAllRanges();
        }
        const newVal = editor.innerHTML;
        applyToDOM(editor.dataset.fieldId, newVal);
        scheduleSave(editor.dataset.fieldId, () => editor.innerHTML);
        setPanelStatus('✓ Farbe angewendet', 'saved');
      });
      bar.appendChild(btn);
    });

    // Farbe entfernen
    const reset = document.createElement('button');
    reset.className = 'cms-color-swatch cms-color-reset';
    reset.title = 'Farbe entfernen';
    reset.textContent = '✕';
    reset.addEventListener('mousedown', e => {
      e.preventDefault();
      const sel = window.getSelection();
      if (sel && sel.rangeCount && !sel.isCollapsed) {
        document.execCommand('removeFormat', false);
      } else {
        document.execCommand('selectAll', false, null);
        document.execCommand('removeFormat', false);
        sel && sel.removeAllRanges();
      }
      applyToDOM(editor.dataset.fieldId, editor.innerHTML);
      scheduleSave(editor.dataset.fieldId, () => editor.innerHTML);
    });
    bar.appendChild(reset);

    return bar;
  }

  // ── Panel öffnen ──────────────────────────────────────
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
        const currentSrc = domEl ? (domEl.tagName === 'IMG' ? domEl.src : '') : '';
        const preview = document.createElement('div');
        preview.className = 'cms-image-field';
        preview.innerHTML = `
          <img class="cms-image-preview" src="${currentSrc}" alt="">
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

      } else {
        // Contenteditable-Editor mit Farbwähler für text + textarea + url-Felder
        const isMultiLine = feld.typ === 'textarea';
        const currentHTML = domEl
          ? (domEl.tagName === 'A' ? domEl.href : domEl.innerHTML)
          : '';

        const editor = document.createElement('div');
        editor.className = 'cms-rich-editor' + (isMultiLine ? ' multi-line' : '');
        editor.contentEditable = 'true';
        editor.dataset.fieldId = feld.id;
        editor.innerHTML = currentHTML;

        // Farbwähler nur für echte Textfelder, nicht für Links/URLs
        if (feld.typ !== 'text' || !feld.id.endsWith('_url')) {
          const colorBar = buildColorToolbar(editor);
          wrap.appendChild(colorBar);
        }

        editor.addEventListener('input', () => {
          applyToDOM(feld.id, editor.innerHTML);
          scheduleSave(feld.id, () => editor.innerHTML);
          setPanelStatus('Speichert…', 'saving');
        });

        // Enter-Taste in einzeiligen Feldern verhindern
        if (!isMultiLine) {
          editor.addEventListener('keydown', e => {
            if (e.key === 'Enter') e.preventDefault();
          });
        }

        wrap.appendChild(editor);
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
      const editor = wrap && wrap.querySelector('[contenteditable]');
      if (editor) await saveField(feld.id, editor.innerHTML);
    }
    btn.disabled = false;
    btn.textContent = '✓ Alle gespeichert';
    setTimeout(() => { btn.textContent = '💾 Alle Änderungen speichern'; }, 2500);
    setPanelStatus('✓ Alle Felder gespeichert', 'saved');
  }

  function wrapSections() {
    SCHEMA.forEach(sec => {
      const el = document.querySelector(sec.selector);
      if (!el) return;
      el.classList.add('cms-section-wrap');
      const btn = document.createElement('button');
      btn.className = 'cms-edit-btn';
      btn.setAttribute('style', 'z-index: 99999 !important; position: absolute; top: 12px; right: 12px; pointer-events: all;');
      btn.innerHTML = `✏️ ${sec.label} bearbeiten`;
      btn.addEventListener('click', e => { e.stopPropagation(); openPanel(sec); });
      el.appendChild(btn);
    });
  }

})();
