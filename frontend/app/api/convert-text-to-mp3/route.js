import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

let ttsClient;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    ttsClient = new TextToSpeechClient({ credentials });
  } catch (error) {
    console.error('Error parsing Google application credentials:', error);
    ttsClient = new TextToSpeechClient();
  }
} else {
  console.error('Google application credentials not found in environment variables.');
  ttsClient = new TextToSpeechClient();
}

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { scriptContent } = req.body;

  if (!scriptContent) {
    return res.status(400).json({ error: 'Script content is required' });
  }

  try {
    const request = {
      input: { text: scriptContent },
      voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
      audioConfig: { audioEncoding: 'MP3' },
    };

    const [response] = await ttsClient.synthesizeSpeech(request);
    const outputPath = `./uploads/output-${uuidv4()}.mp3`;

    fs.writeFileSync(outputPath, response.audioContent, 'binary');

    return res.status(200).json({ path: outputPath });
  } catch (error) {
    console.error('Error converting text to MP3:', error);
    return res.status(500).json({ error: 'Failed to convert text to MP3' });
  }
};
