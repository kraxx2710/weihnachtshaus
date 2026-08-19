// Direkter Upstash REST API – kein @vercel/kv nötig
const KV_URL   = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

async function hgetall(key) {
  if (!KV_URL || !KV_TOKEN) return {};
  const res = await fetch(`${KV_URL}/hgetall/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
  });
  const { result } = await res.json();
  if (!result || !Array.isArray(result)) return {};
  const obj = {};
  for (let i = 0; i < result.length; i += 2) {
    obj[result[i]] = result[i + 1];
  }
  return obj;
}

async function hset(key, field, value) {
  const res = await fetch(`${KV_URL}/hset/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([field, String(value ?? '')]),
  });
  return res.json();
}

function isAuthorized(req) {
  return req.headers.authorization === `Bearer ${process.env.CMS_SECRET_TOKEN}`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'GET') {
    try {
      const data = await hgetall('wh_content');
      const rows = Object.entries(data).map(([id, wert]) => ({ id, wert }));
      return res.json(rows);
    } catch (e) {
      console.error('KV read error:', e);
      return res.json([]);
    }
  }

  if (req.method === 'POST') {
    if (!isAuthorized(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { id, wert } = req.body;
    if (!id) return res.status(400).json({ error: 'id fehlt' });
    try {
      await hset('wh_content', id, wert);
      return res.json({ ok: true });
    } catch (e) {
      console.error('KV write error:', e);
      return res.status(500).json({ error: 'Speichern fehlgeschlagen' });
    }
  }

  res.status(405).end();
}
