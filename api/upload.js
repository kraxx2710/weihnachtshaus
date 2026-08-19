import { put } from '@vercel/blob';

export const config = {
  api: { bodyParser: { sizeLimit: '12mb' } },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  if (req.headers.authorization !== `Bearer ${process.env.CMS_SECRET_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { filename, data } = req.body;
  if (!filename || !data) return res.status(400).json({ error: 'filename und data erforderlich' });

  const buffer = Buffer.from(data, 'base64');
  const blob = await put(`wh/${filename}`, buffer, { access: 'public', addRandomSuffix: true });

  res.json({ url: blob.url });
}
