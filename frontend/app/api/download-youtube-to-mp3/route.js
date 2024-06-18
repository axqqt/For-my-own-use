import ytdl from 'ytdl-core';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { videoUrl } = req.body;

  if (!videoUrl) {
    return res.status(400).json({ error: 'Video URL is required' });
  }

  try {
    const videoInfo = await ytdl.getInfo(videoUrl);
    const audioFormat = ytdl.filterFormats(videoInfo.formats, 'audioonly')[0];

    if (!audioFormat) {
      throw new Error('No audio format found for the provided YouTube video.');
    }

    const audioPath = `./uploads/audio-${uuidv4()}.mp3`;

    await new Promise((resolve, reject) => {
      ytdl(videoUrl, { filter: 'audioonly' })
        .pipe(fs.createWriteStream(audioPath))
        .on('finish', resolve)
        .on('error', reject);
    });

    return res.status(200).json({ path: audioPath });
  } catch (error) {
    console.error('Error downloading YouTube video as MP3:', error);
    return res.status(500).json({ error: 'Failed to download YouTube video as MP3' });
  }
};
