// pages/api/generate-questions.js

import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `Generate a complete questionnaire form based on the following prompt: ${prompt}`
                }
              ]
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const questions = response.data.choices[0].text.trim().split('\n');
      return res.status(200).json({ questions });
    } catch (error) {
      console.error('Error generating questions:', error);
      return res.status(500).json({ error: 'Failed to generate questions' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
