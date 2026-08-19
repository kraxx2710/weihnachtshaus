export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { password } = req.body;

  if (!password || password !== process.env.CMS_PASSWORD) {
    return res.status(401).json({ error: 'Falsches Passwort' });
  }

  res.json({ token: process.env.CMS_SECRET_TOKEN });
}
