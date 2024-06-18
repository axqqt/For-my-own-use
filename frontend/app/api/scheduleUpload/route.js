import multer from 'multer';
import path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { promisify } from 'util';
import { NextApiRequest, NextApiResponse } from 'next';

const upload = multer({
  storage: multer.diskStorage({
    destination: './public/uploads/',
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    },
  }),
});

const pipeline = promisify(require('stream').pipeline);

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, handled by multer
  },
};

export default async function handler(req = NextApiRequest, res = NextApiResponse) {
  if (req.method === 'POST') {
    try {
      await upload.single('videoFile')(req, res);
      const { videoTitle, videoDescription, videoPrivacy, scheduledDate } = req.body;
      const { path: filePath, originalname: fileName } = req.file;

      // Example: Schedule video upload (placeholder logic)
      const thumbnails = await scheduleVideoUpload(filePath, fileName, videoTitle, videoDescription, videoPrivacy, scheduledDate);

      // Respond with uploaded thumbnails
      res.status(200).json({ thumbnails });
    } catch (error) {
      console.error('Error scheduling upload:', error);
      res.status(500).json({ error: 'Failed to schedule upload' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Example function to schedule video upload (placeholder function)
async function scheduleVideoUpload(filePath, fileName, videoTitle, videoDescription, videoPrivacy, scheduledDate) {
  try {
    // Schedule video upload logic (placeholder logic)
    // Example: Saving thumbnails (placeholder logic)
    const thumbnails = await saveThumbnails(filePath);

    return thumbnails;
  } catch (error) {
    throw new Error('Error scheduling video upload');
  }
}

// Example function to save thumbnails (placeholder function)
async function saveThumbnails(filePath) {
  try {
    // Simulate saving thumbnails (placeholder logic)
    const thumbnails = [
      { url: `/uploads/${path.basename(filePath)}` }, // Example URL, adjust as per your setup
      // Add more thumbnails as per your requirement
    ];

    return thumbnails;
  } catch (error) {
    throw new Error('Error saving thumbnails');
  }
}
