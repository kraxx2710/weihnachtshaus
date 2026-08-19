import { kv } from '@vercel/kv';

function isAuthorized(req) {
  return req.headers.authorization === `Bearer ${process.env.CMS_SECRET_TOKEN}`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'GET') {
    const data = await kv.hgetall('wh_content') || {};
    const rows = Object.entries(data).map(([id, wert]) => ({ id, wert }));
    return res.json(rows);
  }

  if (req.method === 'POST') {
    if (!isAuthorized(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { id, wert } = req.body;
    if (!id) return res.status(400).json({ error: 'id fehlt' });
    await kv.hset('wh_content', { [id]: wert ?? '' });
    return res.json({ ok: true });
  }

  res.status(405).end();
}
