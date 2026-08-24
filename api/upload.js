import { handleUpload } from '@vercel/blob/client';

// Direkter Client-Upload: der Browser laedt das Bild direkt zu Vercel Blob
// hoch, hier wird nur ein kurzlebiges Upload-Token ausgestellt. Dadurch
// umgeht der Upload das harte 4,5-MB-Limit fuer Vercel-Function-Bodies,
// das echte Handyfotos sonst zuverlaessig ueberschreiten wuerden.
export default async function handler(request, response) {
  try {
    const jsonResponse = await handleUpload({
      body: request.body,
      request,
      onBeforeGenerateToken: async () => {
        if (request.headers.authorization !== `Bearer ${process.env.CMS_SECRET_TOKEN}`) {
          throw new Error('Unauthorized');
        }
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {},
    });
    return response.status(200).json(jsonResponse);
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
}
