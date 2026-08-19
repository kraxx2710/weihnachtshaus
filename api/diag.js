const KV_URL   = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

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

export default async function handler(req, res) {
  const out = {};
  try {
    out.hset = await redis('HSET', 'wh_content', 'diag_field', 'diag_wert_123');
    const flat = await redis('HGETALL', 'wh_content');
    const obj = {};
    for (let i = 0; i < flat.length; i += 2) obj[flat[i]] = flat[i + 1];
    out.hgetall = obj;
    out.roundtripOk = obj.diag_field === 'diag_wert_123';
    await redis('HDEL', 'wh_content', 'diag_field');
    out.cleanedUp = true;
  } catch (e) {
    out.error = e.message;
  }
  res.json(out);
}
