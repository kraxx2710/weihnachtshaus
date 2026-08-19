export default async function handler(req, res) {
  const out = {
    hasKvUrl: !!process.env.KV_REST_API_URL,
    hasKvToken: !!process.env.KV_REST_API_TOKEN,
    kvUrlPrefix: (process.env.KV_REST_API_URL || '').slice(0, 30),
    hasCmsPassword: !!process.env.CMS_PASSWORD,
    hasCmsToken: !!process.env.CMS_SECRET_TOKEN,
    node: process.version,
  };

  try {
    const r = await fetch(`${process.env.KV_REST_API_URL}/set/diag_test/hello`, {
      headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
    });
    out.writeStatus = r.status;
    out.writeBody = await r.text();
  } catch (e) {
    out.writeError = e.message;
  }

  try {
    const r = await fetch(`${process.env.KV_REST_API_URL}/hset/wh_content`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(['diag_field', 'diag_value']),
    });
    out.hsetStatus = r.status;
    out.hsetBody = await r.text();
  } catch (e) {
    out.hsetError = e.message;
  }

  try {
    const r = await fetch(`${process.env.KV_REST_API_URL}/hgetall/wh_content`, {
      headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
    });
    out.hgetallStatus = r.status;
    out.hgetallBody = await r.text();
  } catch (e) {
    out.hgetallError = e.message;
  }

  res.json(out);
}
