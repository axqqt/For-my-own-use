import multer from 'multer';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';

const upload = multer({
  storage: multer.diskStorage({
    destination: './public/uploads/thumbnails/',
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    },
  }),
});

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, handled by multer
  },
};

export default async function handler(req = NextApiRequest, res = NextApiResponse) {
  if (req.method === 'POST') {
    try {
      await upload.array('thumbnails', 4)(req, res);

      // Example: Process uploaded thumbnails (placeholder logic)
      const thumbnails = await processThumbnailUploads(req.files);

      // Respond with uploaded thumbnails
      res.status(200).json({ thumbnails });
    } catch (error) {
      console.error('Error uploading thumbnails:', error);
      res.status(500).json({ error: 'Failed to upload thumbnails' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Example function to process uploaded thumbnails (placeholder function)
async function processThumbnailUploads(thumbnailFiles) {
  try {
    // Process thumbnail uploads (placeholder logic)
    // Example: Saving thumbnails (placeholder logic)
    const thumbnails = thumbnailFiles.map(file => ({
      url: `/uploads/thumbnails/${path.basename(file.path)}`, // Example URL, adjust as per your setup
    }));

    return thumbnails;
  } catch (error) {
    throw new Error('Error processing thumbnail uploads');
  }
}
