// Medienverwaltung: Ordner ("Alben") mit Bildern, PDFs und Links.
// Speicher: Upstash-Hash "wh_media" – Feld "index" (Ordnerliste) und
// je Ordner ein Feld "album:<id>". Bilddateien liegen in Vercel Blob.
import { del } from '@vercel/blob';

const KV_URL   = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const HASH     = 'wh_media';
const KINDS    = new Set(['galerie', 'presse', 'bibliothek']);
const TYPES    = new Set(['image', 'pdf', 'link']);

async function redis(...command) {
  const res = await fetch(KV_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json.result;
}

function parse(raw, fallback) {
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}

function str(v, max) {
  return typeof v === 'string' ? v.slice(0, max) : '';
}

function safeUrl(v) {
  const s = str(v, 600);
  if (!s) return '';
  if (s.startsWith('https://') || s.startsWith('http://') || s.startsWith('assets/')) return s;
  return '';
}

// Bringt einen Ordner in eine garantiert gueltige Form – alles,
// was nicht passt, wird verworfen statt die Anzeige zu gefaehrden.
function sanitizeAlbum(a) {
  if (!a || typeof a !== 'object') throw new Error('Ordner fehlt');
  const id = str(a.id, 40).toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (!id) throw new Error('Ungueltige Ordner-ID');
  const kind = KINDS.has(a.kind) ? a.kind : 'galerie';
  const items = Array.isArray(a.items) ? a.items.slice(0, 600) : [];
  return {
    id,
    kind,
    title: str(a.title, 80) || 'Ohne Titel',
    text:  str(a.text, 600),
    items: items.map(it => {
      const type = TYPES.has(it && it.type) ? it.type : 'image';
      const url = safeUrl(it && it.url);
      const link = safeUrl(it && it.link);
      if (type === 'link' ? !link : !url) return null;
      return {
        id:     str(it.id, 40) || Math.random().toString(36).slice(2, 10),
        type,
        url,
        thumb:  safeUrl(it.thumb) || url,
        link,
        name:   str(it.name, 120),
        title:  str(it.title, 160),
        source: str(it.source, 120),
        date:   str(it.date, 40),
        hidden: !!it.hidden,
      };
    }).filter(Boolean),
  };
}

async function readIndex() {
  return parse(await redis('HGET', HASH, 'index'), []);
}

async function readAlbum(id) {
  return parse(await redis('HGET', HASH, `album:${id}`), null);
}

async function writeAlbum(album) {
  await redis('HSET', HASH, `album:${album.id}`, JSON.stringify(album));
}

async function writeIndex(index) {
  await redis('HSET', HASH, 'index', JSON.stringify(index));
}

// Erstanlage: bestehende Zusatzbilder der Website-Galerie uebernehmen
// und sinnvolle Standard-Ordner anlegen.
async function ensureDefaults() {
  let index = await readIndex();
  if (index.length) return index;

  const legacy = parse(await redis('HGET', 'wh_content', 'gallery_extra'), []);
  const galerie = sanitizeAlbum({
    id: 'galerie', kind: 'galerie', title: 'Galerie – Weitere Bilder',
    items: (Array.isArray(legacy) ? legacy : []).map(u => ({ type: 'image', url: u, thumb: u })),
  });
  const presse = sanitizeAlbum({ id: 'pressefotos', kind: 'presse', title: 'Pressefotos', items: [] });
  const zeitung = sanitizeAlbum({ id: 'zeitungsberichte', kind: 'bibliothek', title: 'Zeitungsberichte', items: [] });
  const tv = sanitizeAlbum({ id: 'tv-video', kind: 'bibliothek', title: 'TV & Video', items: [] });

  for (const a of [galerie, presse, zeitung, tv]) await writeAlbum(a);
  index = [galerie, presse, zeitung, tv].map(a => ({ id: a.id, title: a.title, kind: a.kind }));
  await writeIndex(index);
  return index;
}

function isAuthorized(req) {
  return req.headers.authorization === `Bearer ${process.env.CMS_SECRET_TOKEN}`;
}

function ownBlob(url) {
  return typeof url === 'string' && url.includes('.public.blob.vercel-storage.com/');
}

async function deleteBlobs(urls) {
  const eigene = [...new Set(urls.filter(ownBlob))];
  if (!eigene.length) return 0;
  try { await del(eigene); } catch (e) { console.error('Blob-Loeschung:', e.message); }
  return eigene.length;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    try {
      const index = await ensureDefaults();
      const albums = [];
      for (const entry of index) {
        const a = await readAlbum(entry.id);
        if (a) albums.push(sanitizeAlbum(a));
      }
      return res.json({ albums });
    } catch (e) {
      console.error('media GET:', e);
      return res.json({ albums: [] });
    }
  }

  if (req.method !== 'POST') return res.status(405).end();
  if (!isAuthorized(req)) return res.status(401).json({ error: 'Unauthorized' });

  const body = req.body || {};
  try {
    switch (body.op) {
      case 'saveAlbum': {
        const album = sanitizeAlbum(body.album);
        await writeAlbum(album);
        const index = await ensureDefaults();
        const pos = index.findIndex(e => e.id === album.id);
        const entry = { id: album.id, title: album.title, kind: album.kind };
        if (pos === -1) index.push(entry); else index[pos] = entry;
        await writeIndex(index);
        return res.json({ ok: true, album });
      }
      case 'saveIndex': {
        const index = (Array.isArray(body.albums) ? body.albums : [])
          .map(e => ({ id: str(e.id, 40), title: str(e.title, 80), kind: KINDS.has(e.kind) ? e.kind : 'galerie' }))
          .filter(e => e.id);
        await writeIndex(index);
        return res.json({ ok: true });
      }
      case 'deleteAlbum': {
        const id = str(body.id, 40);
        const album = await readAlbum(id);
        const index = (await ensureDefaults()).filter(e => e.id !== id);
        await writeIndex(index);
        await redis('HDEL', HASH, `album:${id}`);
        let geloescht = 0;
        if (album) {
          // Dateien, die andere Ordner noch verwenden, bleiben erhalten
          const genutzt = new Set();
          for (const e of index) {
            const other = await readAlbum(e.id);
            (other?.items || []).forEach(i => { if (i.url) genutzt.add(i.url); if (i.thumb) genutzt.add(i.thumb); });
          }
          geloescht = await deleteBlobs(album.items.flatMap(i => [i.url, i.thumb]).filter(u => u && !genutzt.has(u)));
        }
        return res.json({ ok: true, blobsGeloescht: geloescht });
      }
      case 'deleteBlobs': {
        const n = await deleteBlobs(Array.isArray(body.urls) ? body.urls : []);
        return res.json({ ok: true, blobsGeloescht: n });
      }
      default:
        return res.status(400).json({ error: 'Unbekannte Operation' });
    }
  } catch (e) {
    console.error('media POST:', e);
    return res.status(400).json({ error: e.message || 'Fehler' });
  }
}
