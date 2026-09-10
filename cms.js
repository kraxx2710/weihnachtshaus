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
        { id: 'visit_tip_h3',     label: 'Tipp – Überschrift',     typ: 'text' },
        { id: 'visit_tip_text',   label: 'Tipp – Text',            typ: 'textarea' },
      ]
    },
    {
      key: 'anreise', emoji: '🚂', label: 'Bequem anreisen',
      selector: '.arrive',
      felder: [
        { id: 'anreise_eyebrow',    label: 'Kleiner Text oben',           typ: 'text' },
        { id: 'anreise_h2',         label: 'Überschrift',                 typ: 'text' },
        { id: 'anreise1_img',       label: 'Pferdekutsche – Bild',        typ: 'image' },
        { id: 'visit_kutsche_h3',   label: 'Pferdekutsche – Überschrift', typ: 'text' },
        { id: 'visit_kutsche_text', label: 'Pferdekutsche – Text',        typ: 'textarea' },
        { id: 'anreise2_img',       label: 'Bummelzug – Bild',            typ: 'image' },
        { id: 'visit_zug_h3',       label: 'Bummelzug – Überschrift',     typ: 'text' },
        { id: 'visit_zug_text',     label: 'Bummelzug – Text',            typ: 'textarea' },
      ]
    },
    {
      key: 'geniesser', emoji: '🌰', label: 'Für Genießer',
      selector: '.enjoy',
      felder: [
        { id: 'geniesser_eyebrow', label: 'Kleiner Text oben',          typ: 'text' },
        { id: 'geniesser_h2',      label: 'Überschrift',                typ: 'text' },
        { id: 'geniesser1_img',    label: 'Therme Avita – Bild',        typ: 'image' },
        { id: 'geniesser1_h3',     label: 'Therme Avita – Überschrift', typ: 'text' },
        { id: 'geniesser1_text',   label: 'Therme Avita – Text',        typ: 'textarea' },
        { id: 'geniesser2_img',    label: 'Maroni-Brater – Bild',       typ: 'image' },
        { id: 'geniesser2_h3',     label: 'Maroni-Brater – Überschrift',typ: 'text' },
        { id: 'geniesser2_text',   label: 'Maroni-Brater – Text',       typ: 'textarea' },
      ]
    },
    {
      key: 'specialdays', emoji: '🎭', label: 'Special-Days',
      selector: '.specialdays',
      felder: [
        { id: 'specialdays_eyebrow', label: 'Kleiner Text oben', typ: 'text' },
        { id: 'specialdays_h2',      label: 'Überschrift',       typ: 'text' },
        { id: 'specialdays_text1',   label: 'Absatz 1',          typ: 'textarea' },
        { id: 'specialdays_text2',   label: 'Absatz 2',          typ: 'textarea' },
        { id: 'specialdays_img',     label: 'Bild',              typ: 'image' },
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
        { id: 'causes_img',      label: 'Emotionales Bild',        typ: 'image' },
        { id: 'causes_caption',  label: 'Bild – Zitatzeile',       typ: 'text' },
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
        { id: 'tl1_year', label: 'Zeitleiste 1 – Jahr/Label',  typ: 'text' },
        { id: 'tl1_h3',   label: 'Zeitleiste 1 – Titel',        typ: 'text' },
        { id: 'tl1_text', label: 'Zeitleiste 1 – Text',         typ: 'textarea' },
        { id: 'tl2_year', label: 'Zeitleiste 2 – Jahr/Label',  typ: 'text' },
        { id: 'tl2_h3',   label: 'Zeitleiste 2 – Titel',        typ: 'text' },
        { id: 'tl2_text', label: 'Zeitleiste 2 – Text',         typ: 'textarea' },
        { id: 'tl3_year', label: 'Zeitleiste 3 – Jahr/Label',  typ: 'text' },
        { id: 'tl3_h3',   label: 'Zeitleiste 3 – Titel',        typ: 'text' },
        { id: 'tl3_text', label: 'Zeitleiste 3 – Text',         typ: 'textarea' },
        { id: 'tl4_year', label: 'Zeitleiste 4 – Jahr/Label',  typ: 'text' },
        { id: 'tl4_h3',   label: 'Zeitleiste 4 – Titel',        typ: 'text' },
        { id: 'tl4_text', label: 'Zeitleiste 4 – Text',         typ: 'textarea' },
        { id: 'tl5_year', label: 'Zeitleiste 5 – Jahr/Label',  typ: 'text' },
        { id: 'tl5_h3',   label: 'Zeitleiste 5 – Titel',        typ: 'text' },
        { id: 'tl5_text', label: 'Zeitleiste 5 – Text',         typ: 'textarea' },
        { id: 'tl6_year', label: 'Zeitleiste 6 – Jahr/Label',  typ: 'text' },
        { id: 'tl6_h3',   label: 'Zeitleiste 6 – Titel',        typ: 'text' },
        { id: 'tl6_text', label: 'Zeitleiste 6 – Text',         typ: 'textarea' },
        { id: 'tl7_year', label: 'Zeitleiste 7 – Jahr/Label',  typ: 'text' },
        { id: 'tl7_h3',   label: 'Zeitleiste 7 – Titel',        typ: 'text' },
        { id: 'tl7_text', label: 'Zeitleiste 7 – Text',         typ: 'textarea' },
        { id: 'tl8_year', label: 'Zeitleiste 8 – Jahr/Label',  typ: 'text' },
        { id: 'tl8_h3',   label: 'Zeitleiste 8 – Titel',        typ: 'text' },
        { id: 'tl8_text', label: 'Zeitleiste 8 – Text',         typ: 'textarea' },
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
        { id: 'sp18_img', label: 'Logo 18 – Krüger Group',                      typ: 'image' },
        { id: 'sp18_url', label: 'Link 18 – Krüger Group',                      typ: 'text' },
        { id: 'sp19_img', label: 'Logo 19 – Entertainment',      typ: 'image' },
        { id: 'sp19_url', label: 'Link 19 – Entertainment',      typ: 'text' },
        { id: 'sp20_img', label: 'Logo 20 – ICS',                typ: 'image' },
        { id: 'sp20_url', label: 'Link 20 – ICS',                typ: 'text' },
        { id: 'sp21_img', label: 'Logo 21 – Bad Tatzmannsdorf',                      typ: 'image' },
        { id: 'sp21_url', label: 'Link 21 – Bad Tatzmannsdorf',                      typ: 'text' },
        { id: 'sp22_img', label: 'Logo 22 – Carello',                      typ: 'image' },
        { id: 'sp22_url', label: 'Link 22 – Carello',                      typ: 'text' },
        { id: 'sp23_img', label: 'Logo 23 – Haas',               typ: 'image' },
        { id: 'sp23_url', label: 'Link 23 – Haas',               typ: 'text' },
        { id: 'sp24_img', label: 'Logo 24 – Pehofer',                      typ: 'image' },
        { id: 'sp24_url', label: 'Link 24 – Pehofer',                      typ: 'text' },
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
        { id: 'closing_bg',      label: 'Hintergrundbild',              typ: 'image' },
        { id: 'closing_eyebrow', label: 'Kleiner Text',                typ: 'text' },
        { id: 'closing_h2_1',    label: 'Überschrift Zeile 1',         typ: 'text' },
        { id: 'closing_h2_2',    label: 'Überschrift Zeile 2 (kursiv)', typ: 'text' },
        { id: 'footer_ki_note',  label: 'Footer – KI-Hinweis',          typ: 'textarea' },
      ]
    },
  ];

  // ── API-Helfer ────────────────────────────────────────
  function apiToken() { return localStorage.getItem(TOKEN_KEY); }

  async function apiFetch(path, opts = {}) {
    // WICHTIG: "...opts" muss NACH "headers" gespreitet werden, sonst
    // ueberschreibt ein in opts.headers gesetztes Feld (z.B. Authorization)
    // das komplette headers-Objekt und Content-Type geht verloren.
    // Genau das hat bisher JEDE Speicherung (Text + Bild-Upload) mit
    // HTTP 400 fehlschlagen lassen, weil der Server den JSON-Body
    // ohne Content-Type nicht mehr parsen konnte.
    const res = await fetch(path, {
      ...opts,
      headers: { 'Content-Type': 'application/json', ...opts.headers },
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`API ${path} → ${res.status} ${detail}`);
    }
    return res.json();
  }

  // ── Inhalte laden (für alle Besucher) ────────────────
  async function loadContent() {
    const inhalte = apiFetch('/api/content')
      .then(rows => rows.forEach(r => applyToDOM(r.id, r.wert)))
      .catch(e => console.warn('CMS: Inhalte konnten nicht geladen werden.', e.message));
    await Promise.all([inhalte, loadMedia()]);
  }

  // ── Medienverwaltung: Daten (Ordner mit Bildern/PDFs/Links) ──
  // Quelle ist /api/media. Die Startseite zeigt alle sichtbaren Bilder
  // der Ordner vom Typ "galerie" als zusaetzliche Reihen der Galerie.
  let mediaAlbums = [];
  const pageTextCache = {}; // Seitentexte presse_*/bibliothek_* aus /api/content

  async function loadMedia() {
    try {
      const data = await apiFetch('/api/media');
      mediaAlbums = Array.isArray(data.albums) ? data.albums : [];
    } catch (e) {
      console.warn('CMS: Medien konnten nicht geladen werden.', e.message);
      mediaAlbums = [];
    }
    renderGalleryExtra();
  }

  function renderGalleryExtra() {
    const container = document.getElementById('gallery-extra');
    if (!container) return;
    container.innerHTML = '';
    mediaAlbums
      .filter(a => a.kind === 'galerie')
      .flatMap(a => a.items)
      .filter(it => it.type === 'image' && !it.hidden && it.url)
      .forEach(it => {
        const btn = document.createElement('button');
        btn.className = 'gallery-item';
        btn.type = 'button';
        btn.dataset.full = it.url;
        const img = document.createElement('img');
        img.loading = 'lazy';
        img.decoding = 'async';
        img.alt = it.title || 'Weiteres Foto vom Weihnachtshaus';
        // Nicht ladbare Bilder verschwinden still aus dem Raster statt
        // als Fehlersymbol zu erscheinen; der Eintrag bleibt erhalten.
        img.onerror = () => btn.remove();
        img.src = it.thumb || it.url;
        btn.appendChild(img);
        container.appendChild(btn);
      });
  }

  function applyToDOM(fieldId, value) {
    // Altes Feld: die Bilder liegen inzwischen in der Medienverwaltung.
    if (fieldId === 'gallery_extra') return;
    // Texte der Unterseiten (Presse/Bibliothek) haben auf der Startseite
    // kein Element – nur fuer die Medienverwaltung merken.
    if (/^(presse|bibliothek)_(title|text)$/.test(fieldId)) { pageTextCache[fieldId] = value || ''; return; }
    if (!value) return;
    const el = document.querySelector(`[data-cms="${fieldId}"]`);
    if (!el) return;
    if (el.tagName === 'IMG') {
      // Original-Bild aus dem Projekt als Rueckfallebene merken:
      // laedt das gespeicherte Bild nicht (z.B. Speicher gesperrt),
      // springt das Element automatisch auf das Original zurueck.
      if (!el.dataset.fallback) el.dataset.fallback = el.getAttribute('src') || '';
      const btn = el.closest('[data-full]');
      el.onerror = () => {
        el.onerror = null;
        if (el.dataset.fallback && el.src !== el.dataset.fallback) {
          el.src = el.dataset.fallback;
          if (btn) btn.dataset.full = el.dataset.fallback;
        }
      };
      el.src = value;
      if (btn) btn.dataset.full = value;
    } else if (el.tagName === 'A') {
      el.href = value;
    } else {
      // innerHTML bewahrt <em>, <span style> etc.
      el.innerHTML = value;
    }
  }

  // ── Feld speichern ────────────────────────────────────
  // WICHTIG: Jedes Feld bekommt seinen EIGENEN Debounce-Timer.
  // Ein frueherer globaler Timer hat beim Wechsel zwischen Feldern
  // die Speicherung des vorherigen Feldes stillschweigend abgebrochen –
  // die "Gespeichert"-Meldung gehoerte dann zum falschen Feld.
  const saveTimers = new Map(); // fieldId -> { timer, getValue }

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
      return true;
    } catch (e) {
      console.error('CMS save error:', fieldId, e);
      setToolbarStatus('⚠ Fehler beim Speichern', 'error');
      return false;
    }
  }

  function scheduleSave(fieldId, getValue) {
    const existing = saveTimers.get(fieldId);
    if (existing) clearTimeout(existing.timer);
    const timer = setTimeout(() => {
      saveTimers.delete(fieldId);
      saveField(fieldId, getValue());
    }, 900);
    saveTimers.set(fieldId, { timer, getValue });
  }

  // Erzwingt SOFORTIGES Speichern aller Felder mit noch ausstehendem
  // Timer (z.B. bevor das Panel geschlossen wird), statt die
  // Aenderung beim Abbrechen des Timers stillschweigend zu verwerfen.
  async function flushPendingSaves() {
    const pending = [...saveTimers.entries()];
    saveTimers.clear();
    for (const [fieldId, { timer, getValue }] of pending) {
      clearTimeout(timer);
      await saveField(fieldId, getValue());
    }
  }

  // ── Bild hochladen ────────────────────────────────────
  // Bild vor dem Hochladen im Browser verkleinern. Grund: Vercel
  // begrenzt den Body jeder Serverless-Funktion HART auf 4,5 MB
  // (nicht konfigurierbar) - ein normales Handyfoto (3-8 MB) wuerde
  // nach Base64-Kodierung dieses Limit zuverlaessig ueberschreiten.
  // Fuer eine Webseite reicht eine deutlich kleinere Aufloesung
  // vollkommen aus und laedt fuer alle Besucher schneller.
  function drawToCanvas(img, maxDim) {
    let { width, height } = img;
    if (width > maxDim || height > maxDim) {
      if (width >= height) {
        height = Math.round(height * (maxDim / width));
        width = maxDim;
      } else {
        width = Math.round(width * (maxDim / height));
        height = maxDim;
      }
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(img, 0, 0, width, height);
    return canvas;
  }

  function canvasToBlob(canvas, mime, quality) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Verkleinerung fehlgeschlagen'))), mime, quality);
    });
  }

  // Verkleinert ein Bild schrittweise, bis es sicher unter Vercels
  // 4,5-MB-Funktionslimit passt (mit Puffer fuer die Base64-Kodierung,
  // die die Groesse um ca. 33% erhoeht). PNGs mit Transparenz bleiben
  // nach Moeglichkeit PNG, werden aber notfalls (z.B. bei sehr grossen
  // oder schlecht komprimierbaren Bildern) auf JPEG umgestellt, da PNG
  // sich ueber die Qualitaetsstufe nicht verkleinern laesst.
  const MAX_UPLOAD_BYTES = 3 * 1024 * 1024; // Puffer unter dem 4,5-MB-Limit

  async function resizeImageFile(file) {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      const objectUrl = URL.createObjectURL(file);
      el.onload = () => { URL.revokeObjectURL(objectUrl); resolve(el); };
      el.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Bild konnte nicht gelesen werden')); };
      el.src = objectUrl;
    });

    const isPng = file.type === 'image/png';
    const attempts = isPng
      ? [
          { maxDim: 2200, mime: 'image/png', quality: undefined },
          { maxDim: 1600, mime: 'image/png', quality: undefined },
          { maxDim: 2200, mime: 'image/jpeg', quality: 0.82 }, // Transparenz faellt weg, letzter Ausweg
          { maxDim: 1400, mime: 'image/jpeg', quality: 0.7 },
        ]
      : [
          { maxDim: 2200, mime: 'image/jpeg', quality: 0.86 },
          { maxDim: 1800, mime: 'image/jpeg', quality: 0.78 },
          { maxDim: 1400, mime: 'image/jpeg', quality: 0.65 },
          { maxDim: 1000, mime: 'image/jpeg', quality: 0.55 },
        ];

    let lastBlob = null;
    for (const step of attempts) {
      const canvas = drawToCanvas(img, step.maxDim);
      const blob = await canvasToBlob(canvas, step.mime, step.quality);
      lastBlob = { blob, mime: step.mime };
      if (blob.size <= MAX_UPLOAD_BYTES) {
        return { blob, ext: step.mime === 'image/png' ? 'png' : 'jpg' };
      }
    }
    // Alle Stufen ausgeschoepft: kleinstes Ergebnis trotzdem verwenden
    // und den Server ueber einen klaren Fehler entscheiden lassen,
    // statt eine garantiert zu grosse Datei erst gar nicht zu senden.
    return { blob: lastBlob.blob, ext: lastBlob.mime === 'image/png' ? 'png' : 'jpg' };
  }

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async function uploadBlob(blob, ext) {
    const base64 = await blobToBase64(blob);
    const { url } = await apiFetch('/api/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiToken()}` },
      body: JSON.stringify({ filename: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`, data: base64 }),
    });
    return url;
  }

  function isHeic(file) {
    return /heic|heif/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
  }

  async function uploadImage(file) {
    if (isHeic(file)) throw new Error('HEIC-Fotos (iPhone) bitte zuerst als JPEG exportieren.');
    // SVGs sind bereits winzig und lassen sich nicht rastern -> unveraendert senden.
    let blob = file, ext = file.name.split('.').pop().toLowerCase();
    if (file.type !== 'image/svg+xml') {
      const resized = await resizeImageFile(file);
      blob = resized.blob;
      ext = resized.ext;
    }
    return uploadBlob(blob, ext);
  }

  // Kleine Vorschau (max. 600 px) fuer Raster-Ansichten: Besucher laden
  // so nur einen Bruchteil der Datenmenge, das Original bleibt fuer die
  // Grossansicht und den Download erhalten.
  async function makeThumb(file) {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      const objectUrl = URL.createObjectURL(file);
      el.onload = () => { URL.revokeObjectURL(objectUrl); resolve(el); };
      el.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Bild konnte nicht gelesen werden')); };
      el.src = objectUrl;
    });
    const canvas = drawToCanvas(img, 600);
    return canvasToBlob(canvas, 'image/jpeg', 0.8);
  }

  // Bild inkl. Vorschau hochladen -> { url, thumb, name }
  async function uploadImageWithThumb(file) {
    const url = await uploadImage(file);
    let thumb = url;
    if (file.type !== 'image/svg+xml') {
      try { thumb = await uploadBlob(await makeThumb(file), 'jpg'); } catch { thumb = url; }
    }
    return { url, thumb, name: file.name };
  }

  async function uploadPdf(file) {
    if (file.size > MAX_UPLOAD_BYTES) throw new Error(`PDF zu gross (max. ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB)`);
    return uploadBlob(file, 'pdf');
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
    link.href = 'cms.css?v=4';
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

    // Warnung statt stillem Datenverlust, falls die Seite mit
    // noch nicht gespeicherten Aenderungen geschlossen wird.
    window.addEventListener('beforeunload', (e) => {
      if (saveTimers.size > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
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
      <button id="cms-media-btn" type="button">🗂 Medien &amp; Ordner</button>
      <button id="cms-logout">Abmelden</button>
    `;
    document.body.prepend(bar);
    document.getElementById('cms-media-btn').addEventListener('click', openMediaManager);
    document.getElementById('cms-logout').addEventListener('click', async () => {
      await flushPendingSaves();
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
  async function openPanel(sec) {
    await flushPendingSaves(); // vorheriges Panel evtl. noch offen -> nichts verlieren
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

    // Galerie: dynamische Liste zusätzlicher Bilder + "+"-Button
    if (sec.key === 'galerie') {
      buildGalleryExtraEditor(body);
    }

    panel.classList.add('open');
  }

  // ── Galerie-Bereich: Verweis auf die Medienverwaltung ─
  function buildGalleryExtraEditor(body) {
    const wrap = document.createElement('div');
    wrap.className = 'cms-field-group';
    const n = mediaAlbums.filter(a => a.kind === 'galerie').flatMap(a => a.items).filter(i => !i.hidden).length;
    wrap.innerHTML = `
      <label>Weitere Bilder (zusätzliche Reihen)</label>
      <p style="font-size:13px;line-height:1.6;color:#ffffffaa;margin:0 0 12px">
        Derzeit ${n} zusätzliche Bilder sichtbar. Hinzufügen, Ausblenden, Löschen und Sortieren
        erledigst du in der Medienverwaltung – dort auch für Presse und Bibliothek.</p>
    `;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cms-gallery-add-btn';
    btn.textContent = '🗂 Medienverwaltung öffnen';
    btn.addEventListener('click', () => openMediaManager('galerie'));
    wrap.appendChild(btn);
    body.appendChild(wrap);
    const divider = document.createElement('div');
    divider.className = 'cms-divider';
    body.appendChild(divider);
  }

  // ══════════════════════════════════════════════════════
  //  MEDIENVERWALTUNG
  //  Ordner ("Alben") in drei Bereichen: Galerie (Startseite),
  //  Presse (presse.html) und Bibliothek (bibliothek.html).
  // ══════════════════════════════════════════════════════
  const MEDIA_KINDS = [
    { key: 'galerie',    label: 'Galerie – Startseite',   hint: 'Bilder erscheinen unten in der Galerie der Startseite.' },
    { key: 'presse',     label: 'Presse & Downloads',     hint: 'Bilder in Originalgröße zum Download für Journalisten (presse.html).' },
    { key: 'bibliothek', label: 'Medienbibliothek',       hint: 'Zeitungsartikel (Bilder/PDF), TV-Beiträge und Videos (bibliothek.html).' },
  ];
  const PAGE_TEXT_FIELDS = [
    { id: 'presse_title',     label: 'Presse – Überschrift' },
    { id: 'presse_text',      label: 'Presse – Einleitungstext', multi: true },
    { id: 'bibliothek_title', label: 'Bibliothek – Überschrift' },
    { id: 'bibliothek_text',  label: 'Bibliothek – Einleitungstext', multi: true },
  ];

  let mediaCurrent = null;            // aktuell geöffneter Ordner (Objekt aus mediaAlbums)
  const mediaSelected = new Set();    // markierte Element-IDs
  let mediaBusy = false;

  function esc(v) {
    return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function newId() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-3); }
  function slug(t) {
    return t.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'ordner';
  }

  function setMediaStatus(text, cls) {
    const el = document.getElementById('cms-media-status');
    if (!el) return;
    el.textContent = text || '';
    el.className = cls || '';
  }

  async function mediaPost(payload) {
    return apiFetch('/api/media', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiToken()}` },
      body: JSON.stringify(payload),
    });
  }

  // Speichert einen Ordner auf dem Server; Rueckgabe true/false.
  async function saveAlbum(album, meldung) {
    setMediaStatus('Speichert …', 'saving');
    try {
      const { album: saved } = await mediaPost({ op: 'saveAlbum', album });
      // Server-bereinigte Version uebernehmen, damit Anzeige und
      // Datenbank garantiert identisch sind.
      const i = mediaAlbums.findIndex(a => a.id === saved.id);
      if (i === -1) mediaAlbums.push(saved); else mediaAlbums[i] = saved;
      if (mediaCurrent && mediaCurrent.id === saved.id) mediaCurrent = saved;
      renderGalleryExtra();
      setMediaStatus(meldung || '✓ Gespeichert', 'saved');
      return true;
    } catch (e) {
      console.error(e);
      setMediaStatus('⚠ Speichern fehlgeschlagen – bitte erneut versuchen', 'error');
      return false;
    }
  }

  function injectMediaManager() {
    if (document.getElementById('cms-media')) return;
    const el = document.createElement('div');
    el.id = 'cms-media';
    el.innerHTML = `
      <header>
        <h2>🗂 Medien &amp; Ordner</h2>
        <div class="cms-media-links">
          <a href="presse.html" target="_blank" rel="noopener">Presse-Seite ↗</a>
          <a href="bibliothek.html" target="_blank" rel="noopener">Bibliothek ↗</a>
        </div>
        <button id="cms-media-close" type="button" title="Schließen">✕</button>
      </header>
      <div id="cms-media-body">
        <aside id="cms-media-aside"></aside>
        <section id="cms-media-main">
          <div id="cms-media-tools"></div>
          <div id="cms-media-status"></div>
          <div id="cms-media-grid"></div>
        </section>
      </div>
    `;
    document.body.appendChild(el);
    document.getElementById('cms-media-close').addEventListener('click', closeMediaManager);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && el.classList.contains('open') && !document.getElementById('cms-mform')?.classList.contains('open')) closeMediaManager();
    });

    const form = document.createElement('div');
    form.id = 'cms-mform';
    form.innerHTML = `
      <form>
        <h3 id="cms-mform-title">Eintrag bearbeiten</h3>
        <label>Titel</label><input name="title" maxlength="160" autocomplete="off">
        <label>Quelle / Medium (z.B. „Kronen Zeitung", „ORF Burgenland")</label><input name="source" maxlength="120" autocomplete="off">
        <label>Datum</label><input name="date" type="date">
        <label id="cms-mform-linklabel">Link (Artikel-URL oder YouTube-Video)</label><input name="link" type="url" placeholder="https://…">
        <div class="row">
          <button type="button" class="cms-mbtn" data-act="cancel">Abbrechen</button>
          <button type="submit" class="cms-mbtn primary">Übernehmen</button>
        </div>
      </form>
    `;
    document.body.appendChild(form);
    form.querySelector('[data-act="cancel"]').addEventListener('click', () => form.classList.remove('open'));
    form.addEventListener('click', e => { if (e.target === form) form.classList.remove('open'); });
  }

  // Dialog fuer Titel/Quelle/Datum/Link. Liefert Objekt oder null.
  function mediaForm(titel, werte, mitLink) {
    const box = document.getElementById('cms-mform');
    const f = box.querySelector('form');
    box.querySelector('#cms-mform-title').textContent = titel;
    f.title.value = werte.title || '';
    f.source.value = werte.source || '';
    f.date.value = werte.date || '';
    f.link.value = werte.link || '';
    const linkVisible = !!mitLink;
    f.link.hidden = !linkVisible;
    box.querySelector('#cms-mform-linklabel').hidden = !linkVisible;
    f.link.required = linkVisible;
    box.classList.add('open');
    setTimeout(() => f.title.focus(), 30);
    return new Promise(resolve => {
      const done = (val) => { box.classList.remove('open'); f.onsubmit = null; cancel.onclick = null; resolve(val); };
      const cancel = f.querySelector('[data-act="cancel"]');
      cancel.onclick = () => done(null);
      f.onsubmit = (e) => {
        e.preventDefault();
        done({ title: f.title.value.trim(), source: f.source.value.trim(), date: f.date.value, link: f.link.value.trim() });
      };
    });
  }

  async function openMediaManager(kind) {
    injectMediaManager();
    await flushPendingSaves();
    document.getElementById('cms-panel')?.classList.remove('open');
    setMediaStatus('Lade …', 'saving');
    await loadMedia();
    const wunsch = typeof kind === 'string' ? kind : null;
    if (!mediaCurrent || !mediaAlbums.some(a => a.id === mediaCurrent.id)) {
      mediaCurrent = mediaAlbums.find(a => !wunsch || a.kind === wunsch) || mediaAlbums[0] || null;
    } else if (wunsch && mediaCurrent.kind !== wunsch) {
      mediaCurrent = mediaAlbums.find(a => a.kind === wunsch) || mediaCurrent;
    }
    mediaSelected.clear();
    document.getElementById('cms-media').classList.add('open');
    document.body.style.overflow = 'hidden';
    renderMediaAside();
    renderMediaMain();
    setMediaStatus('');
  }

  function closeMediaManager() {
    if (mediaBusy && !confirm('Ein Upload läuft noch. Trotzdem schließen?')) return;
    document.getElementById('cms-media')?.classList.remove('open');
    document.body.style.overflow = '';
    renderGalleryExtra();
  }

  // ── Linke Spalte: Ordnerliste + Seitentexte ───────────
  function renderMediaAside() {
    const aside = document.getElementById('cms-media-aside');
    aside.innerHTML = '';
    MEDIA_KINDS.forEach(k => {
      const g = document.createElement('div');
      g.className = 'cms-media-group';
      g.innerHTML = `<h3 title="${esc(k.hint)}">${esc(k.label)}</h3>`;
      mediaAlbums.filter(a => a.kind === k.key).forEach(a => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'cms-media-album' + (mediaCurrent && mediaCurrent.id === a.id ? ' active' : '');
        const sichtbar = a.items.filter(i => !i.hidden).length;
        b.innerHTML = `📁 <span>${esc(a.title)}</span><small>${sichtbar}${a.items.length !== sichtbar ? ` (+${a.items.length - sichtbar} versteckt)` : ''}</small>`;
        b.addEventListener('click', () => { mediaCurrent = a; mediaSelected.clear(); renderMediaAside(); renderMediaMain(); });
        g.appendChild(b);
      });
      const neu = document.createElement('button');
      neu.type = 'button';
      neu.className = 'cms-media-newfolder';
      neu.textContent = '+ Neuer Ordner';
      neu.addEventListener('click', async () => {
        const title = prompt('Name des neuen Ordners:');
        if (!title || !title.trim()) return;
        let id = slug(title);
        while (mediaAlbums.some(a => a.id === id)) id = (id + '-2').slice(0, 40);
        const album = { id, kind: k.key, title: title.trim(), text: '', items: [] };
        if (await saveAlbum(album, '✓ Ordner angelegt')) {
          mediaCurrent = mediaAlbums.find(a => a.id === id);
          mediaSelected.clear();
          renderMediaAside(); renderMediaMain();
        }
      });
      g.appendChild(neu);
      aside.appendChild(g);
    });

    // Seitentexte der Unterseiten
    const t = document.createElement('div');
    t.id = 'cms-media-texts';
    t.innerHTML = '<h3 style="font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#e6b554;margin:0 0 4px">Seitentexte</h3>';
    PAGE_TEXT_FIELDS.forEach(f => {
      const lbl = document.createElement('label');
      lbl.textContent = f.label;
      const inp = document.createElement(f.multi ? 'textarea' : 'input');
      if (f.multi) inp.rows = 4;
      inp.placeholder = 'Standardtext der Seite wird verwendet';
      inp.value = pageTextCache[f.id] || '';
      inp.addEventListener('change', async () => {
        pageTextCache[f.id] = inp.value;
        const ok = await saveField(f.id, inp.value);
        setMediaStatus(ok ? '✓ Text gespeichert' : '⚠ Text konnte nicht gespeichert werden', ok ? 'saved' : 'error');
      });
      t.appendChild(lbl); t.appendChild(inp);
    });
    aside.appendChild(t);
  }

  // ── Rechte Seite: Werkzeuge + Raster ──────────────────
  function renderMediaMain() {
    const tools = document.getElementById('cms-media-tools');
    const grid = document.getElementById('cms-media-grid');
    const a = mediaCurrent;
    if (!a) {
      tools.innerHTML = '<span class="cms-media-title">Kein Ordner vorhanden</span>';
      grid.innerHTML = '<div class="cms-media-empty">Lege links einen Ordner an.</div>';
      return;
    }
    const kind = MEDIA_KINDS.find(k => k.key === a.kind) || MEDIA_KINDS[0];
    const sel = mediaSelected.size;
    const andere = mediaAlbums.filter(x => x.id !== a.id);

    tools.innerHTML = `
      <span class="cms-media-title">${esc(a.title)}</span>
      <button class="cms-mbtn" data-act="rename" title="Ordner umbenennen / Beschreibung">✎ Ordner</button>
      <button class="cms-mbtn danger" data-act="delfolder" title="Ordner samt Inhalt löschen">🗑 Ordner</button>
      <span class="spacer"></span>
      <label class="cms-mbtn primary" for="cms-media-upload">＋ Bilder${a.kind === 'bibliothek' ? ' / PDF' : ''} hochladen</label>
      <input id="cms-media-upload" type="file" multiple accept="${a.kind === 'bibliothek' ? 'image/*,.pdf,application/pdf' : 'image/*'}" style="display:none">
      ${a.kind === 'bibliothek' ? '<button class="cms-mbtn" data-act="addlink">🔗 Link / Video</button>' : ''}
      <button class="cms-mbtn" data-act="selall">${sel && sel === a.items.length ? 'Auswahl aufheben' : 'Alle auswählen'}</button>
      <button class="cms-mbtn" data-act="hide" ${sel ? '' : 'disabled'}>👁 Aus-/Einblenden (${sel})</button>
      <label class="cms-mbtn" ${sel && andere.length ? '' : 'style="opacity:.4"'}>➜ Verschieben nach
        <select data-act="move" ${sel && andere.length ? '' : 'disabled'}>
          <option value="">…</option>
          ${andere.map(x => `<option value="${esc(x.id)}">${esc(x.title)} (${esc((MEDIA_KINDS.find(k => k.key === x.kind) || {}).label || x.kind)})</option>`).join('')}
        </select>
      </label>
      <button class="cms-mbtn danger" data-act="del" ${sel ? '' : 'disabled'}>🗑 Löschen (${sel})</button>
    `;
    tools.querySelector('.cms-media-title').title = kind.hint;

    tools.querySelector('[data-act="rename"]').onclick = async () => {
      const title = prompt('Ordnername:', a.title);
      if (title === null) return;
      const text = prompt('Kurzbeschreibung (optional, erscheint unter der Überschrift):', a.text || '');
      if (text === null) return;
      await saveAlbum({ ...a, title: title.trim() || a.title, text: text.trim() }, '✓ Ordner aktualisiert');
      renderMediaAside(); renderMediaMain();
    };
    tools.querySelector('[data-act="delfolder"]').onclick = async () => {
      if (!confirm(`Ordner „${a.title}" mit ${a.items.length} Einträgen endgültig löschen?`)) return;
      setMediaStatus('Lösche Ordner …', 'saving');
      try {
        await mediaPost({ op: 'deleteAlbum', id: a.id });
        mediaAlbums = mediaAlbums.filter(x => x.id !== a.id);
        mediaCurrent = mediaAlbums.find(x => x.kind === a.kind) || mediaAlbums[0] || null;
        mediaSelected.clear();
        renderGalleryExtra(); renderMediaAside(); renderMediaMain();
        setMediaStatus('✓ Ordner gelöscht', 'saved');
      } catch { setMediaStatus('⚠ Ordner konnte nicht gelöscht werden', 'error'); }
    };
    tools.querySelector('#cms-media-upload').onchange = function () { mediaUpload(Array.from(this.files || [])); this.value = ''; };
    const addlink = tools.querySelector('[data-act="addlink"]');
    if (addlink) addlink.onclick = async () => {
      const v = await mediaForm('Link oder Video hinzufügen', {}, true);
      if (!v || !v.link) return;
      a.items.push({ id: newId(), type: 'link', url: '', thumb: '', link: v.link, title: v.title, source: v.source, date: v.date, hidden: false });
      await saveAlbum(a, '✓ Link hinzugefügt');
      renderMediaAside(); renderMediaMain();
    };
    tools.querySelector('[data-act="selall"]').onclick = () => {
      if (mediaSelected.size === a.items.length) mediaSelected.clear();
      else a.items.forEach(i => mediaSelected.add(i.id));
      renderMediaMain();
    };
    tools.querySelector('[data-act="hide"]').onclick = async () => {
      const ziel = a.items.filter(i => mediaSelected.has(i.id));
      const alleVersteckt = ziel.every(i => i.hidden);
      ziel.forEach(i => { i.hidden = !alleVersteckt; });
      await saveAlbum(a, alleVersteckt ? '✓ Wieder eingeblendet' : '✓ Ausgeblendet (bleibt gespeichert)');
      renderMediaAside(); renderMediaMain();
    };
    tools.querySelector('[data-act="move"]').onchange = async function () {
      const zielId = this.value;
      const ziel = mediaAlbums.find(x => x.id === zielId);
      if (!ziel) return;
      const bewegt = a.items.filter(i => mediaSelected.has(i.id));
      a.items = a.items.filter(i => !mediaSelected.has(i.id));
      ziel.items.push(...bewegt);
      const ok1 = await saveAlbum(ziel);
      const ok2 = ok1 && await saveAlbum(a, `✓ ${bewegt.length} Einträge nach „${ziel.title}" verschoben`);
      if (!ok2) await loadMedia();
      mediaSelected.clear();
      renderMediaAside(); renderMediaMain();
    };
    tools.querySelector('[data-act="del"]').onclick = async () => {
      const n = mediaSelected.size;
      if (!confirm(`${n} Einträge endgültig löschen? (Tipp: „Ausblenden" behält die Dateien.)`)) return;
      const weg = a.items.filter(i => mediaSelected.has(i.id));
      a.items = a.items.filter(i => !mediaSelected.has(i.id));
      const ok = await saveAlbum(a, `✓ ${n} Einträge gelöscht`);
      if (ok) {
        const urls = weg.flatMap(i => [i.url, i.thumb]).filter(Boolean);
        mediaPost({ op: 'deleteBlobs', urls }).catch(() => {});
      } else {
        await loadMedia();
      }
      mediaSelected.clear();
      renderMediaAside(); renderMediaMain();
    };

    renderMediaGrid();
  }

  function renderMediaGrid() {
    const grid = document.getElementById('cms-media-grid');
    const a = mediaCurrent;
    grid.innerHTML = '';
    if (!a.items.length) {
      grid.innerHTML = `<div class="cms-media-empty">Dieser Ordner ist noch leer.<br>Über „＋ hochladen" kannst du mehrere Dateien auf einmal auswählen.</div>`;
      return;
    }
    a.items.forEach((it, idx) => {
      const cell = document.createElement('div');
      cell.className = 'cms-mitem' + (mediaSelected.has(it.id) ? ' selected' : '') + (it.hidden ? ' hidden' : '');
      cell.draggable = true;
      cell.dataset.idx = idx;
      const meta = [it.source, it.date].filter(Boolean).join(' · ');
      const inhalt = it.type === 'image'
        ? `<img src="${esc(it.thumb || it.url)}" alt="" loading="lazy" decoding="async">`
        : `<div class="cms-mdoc"><b>${it.type === 'pdf' ? 'PDF' : 'LINK'}</b><span>${esc(it.title || it.name || it.link)}</span>${meta ? `<span style="color:#ffffff88">${esc(meta)}</span>` : ''}</div>`;
      cell.innerHTML = `
        <input type="checkbox" ${mediaSelected.has(it.id) ? 'checked' : ''} title="Auswählen">
        ${it.hidden ? '<span class="cms-mbadge">versteckt</span>' : (it.type === 'image' && it.title ? `<span class="cms-mbadge" style="max-width:70%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(it.title)}</span>` : '')}
        ${inhalt}
        <div class="cms-mactions">
          <button type="button" data-act="edit" title="Titel, Quelle, Datum">✎</button>
          <button type="button" data-act="hide" title="${it.hidden ? 'Einblenden' : 'Ausblenden'}">${it.hidden ? '👁' : '🙈'}</button>
          <button type="button" data-act="left" title="Nach vorne">◀</button>
          <button type="button" data-act="right" title="Nach hinten">▶</button>
          <button type="button" data-act="open" title="Original öffnen">↗</button>
        </div>
      `;
      // Bild-Fehler sichtbar machen statt leerer Kachel
      const img = cell.querySelector('img');
      if (img) img.onerror = () => { img.replaceWith(Object.assign(document.createElement('div'), { className: 'cms-mdoc', innerHTML: '<b>⚠</b><span>Bild nicht ladbar</span>' })); };

      cell.querySelector('input').addEventListener('change', e => {
        if (e.target.checked) mediaSelected.add(it.id); else mediaSelected.delete(it.id);
        renderMediaMain();
      });
      cell.addEventListener('click', e => {
        if (e.target.closest('button') || e.target.matches('input')) return;
        if (mediaSelected.has(it.id)) mediaSelected.delete(it.id); else mediaSelected.add(it.id);
        renderMediaMain();
      });
      cell.querySelector('[data-act="edit"]').onclick = async () => {
        const v = await mediaForm(it.type === 'link' ? 'Link bearbeiten' : 'Beschreibung bearbeiten', it, it.type === 'link');
        if (!v) return;
        Object.assign(it, { title: v.title, source: v.source, date: v.date }, it.type === 'link' ? { link: v.link || it.link } : {});
        await saveAlbum(a, '✓ Beschreibung gespeichert');
        renderMediaGrid();
      };
      cell.querySelector('[data-act="hide"]').onclick = async () => {
        it.hidden = !it.hidden;
        await saveAlbum(a, it.hidden ? '✓ Ausgeblendet' : '✓ Eingeblendet');
        renderMediaAside(); renderMediaGrid();
      };
      cell.querySelector('[data-act="left"]').onclick = () => moveItem(idx, idx - 1);
      cell.querySelector('[data-act="right"]').onclick = () => moveItem(idx, idx + 1);
      cell.querySelector('[data-act="open"]').onclick = () => window.open(it.type === 'link' ? it.link : it.url, '_blank', 'noopener');

      // Drag & Drop zum Sortieren
      cell.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', String(idx)); cell.style.opacity = '.5'; });
      cell.addEventListener('dragend', () => { cell.style.opacity = ''; });
      cell.addEventListener('dragover', e => { e.preventDefault(); cell.style.outline = '2px dashed #e6b554'; });
      cell.addEventListener('dragleave', () => { cell.style.outline = ''; });
      cell.addEventListener('drop', e => {
        e.preventDefault(); cell.style.outline = '';
        const from = parseInt(e.dataTransfer.getData('text/plain'), 10);
        if (!Number.isNaN(from) && from !== idx) moveItem(from, idx);
      });
      grid.appendChild(cell);
    });
  }

  async function moveItem(from, to) {
    const a = mediaCurrent;
    if (to < 0 || to >= a.items.length || from === to) return;
    const [it] = a.items.splice(from, 1);
    a.items.splice(to, 0, it);
    renderMediaGrid();
    await saveAlbum(a, '✓ Reihenfolge gespeichert');
  }

  // Mehrere Dateien nacheinander hochladen. Jede Datei wird einzeln
  // behandelt und SOFORT gespeichert – ein Fehler bei Bild 37 kostet
  // nicht die 36 davor, und ein Browser-Absturz auch nicht.
  async function mediaUpload(files) {
    const a = mediaCurrent;
    if (!a || !files.length) return;
    mediaBusy = true;
    let ok = 0; const fehler = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setMediaStatus(`Lade ${i + 1} von ${files.length} hoch: ${file.name} …`, 'saving');
      try {
        let item;
        if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) {
          if (a.kind !== 'bibliothek') throw new Error('PDF nur in der Bibliothek möglich');
          const url = await uploadPdf(file);
          item = { id: newId(), type: 'pdf', url, thumb: '', link: '', name: file.name, title: file.name.replace(/\.pdf$/i, ''), source: '', date: '', hidden: false };
        } else if (file.type.startsWith('image/') || isHeic(file)) {
          const r = await uploadImageWithThumb(file);
          item = { id: newId(), type: 'image', url: r.url, thumb: r.thumb, link: '', name: file.name, title: '', source: '', date: '', hidden: false };
        } else {
          throw new Error('Dateityp nicht unterstützt');
        }
        a.items.push(item);
        const saved = await saveAlbum(a);
        if (!saved) throw new Error('Speichern fehlgeschlagen');
        ok++;
        renderMediaGrid();
        const g = document.getElementById('cms-media-grid'); g.scrollTop = g.scrollHeight;
      } catch (e) {
        fehler.push(`${file.name}: ${e.message}`);
        // Falls das Speichern scheiterte, den Eintrag lokal nicht behalten
        if (a.items.length && a.items[a.items.length - 1].name === file.name && /Speichern/.test(e.message)) a.items.pop();
      }
    }
    mediaBusy = false;
    renderMediaAside(); renderMediaMain();
    if (fehler.length) {
      setMediaStatus(`✓ ${ok} hochgeladen · ⚠ ${fehler.length} fehlgeschlagen`, 'error');
      alert('Nicht hochgeladen:\n\n' + fehler.join('\n'));
    } else {
      setMediaStatus(`✓ ${ok} Datei(en) hochgeladen und gespeichert`, 'saved');
    }
  }

  async function closePanel() {
    await flushPendingSaves();
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
    await flushPendingSaves(); // keine doppelten/veralteten Auto-Saves nebenher
    const btn = document.getElementById('cms-save-all');
    btn.disabled = true;
    btn.textContent = 'Speichert …';
    let fehler = 0;
    for (const feld of sec.felder) {
      if (feld.typ === 'image') continue;
      const wrap = body.querySelector(`[data-field-id="${feld.id}"]`);
      const editor = wrap && wrap.querySelector('[contenteditable]');
      if (editor) {
        const ok = await saveField(feld.id, editor.innerHTML);
        if (!ok) fehler++;
      }
    }
    btn.disabled = false;
    if (fehler > 0) {
      btn.textContent = `⚠ ${fehler} Feld(er) fehlgeschlagen`;
      setPanelStatus(`⚠ ${fehler} Feld(er) konnten nicht gespeichert werden – bitte erneut versuchen`, 'error');
    } else {
      btn.textContent = '✓ Alle gespeichert';
      setPanelStatus('✓ Alle Felder gespeichert', 'saved');
    }
    setTimeout(() => { btn.textContent = '💾 Alle Änderungen speichern'; }, 3500);
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
      btn.addEventListener('click', async e => { e.stopPropagation(); await openPanel(sec); });
      el.appendChild(btn);
    });
  }

})();
