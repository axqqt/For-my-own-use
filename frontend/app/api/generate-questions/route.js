import { GoogleGenerativeAI } from '@google/generative-ai';
import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

const handleFormUpload = (req) => {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.uploadDir = './uploads';
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
};

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fields } = await handleFormUpload(req);
    const { prompt } = fields;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const genAIModel = await genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await genAIModel.generateContent({ prompt });

    if (!result || !result.response || typeof result.response.text !== 'string') {
      throw new Error('Invalid response from API');
    }

    const response = result.response.text.trim();
    if (!response) {
      throw new Error('Empty response from API');
    }

    const questions = response.split('\n');

    return res.status(200).json({ questions });
  } catch (err) {
    console.error('Error generating questions:', err);
    return res.status(500).json({ error: `Failed to generate questions: ${err.message}` });
  }
};
