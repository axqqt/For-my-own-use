const axios = require('axios');
const { NextResponse, NextRequest } = require('next/server');

export async function POST(req, res) {
  const { prompt } = req.body;

  if (!prompt) {
    return res.json({ error: 'Prompt is required' });
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Generate a complete questionnaire form based on the following prompt: ${prompt}`,
              },
            ],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const questions = response.data.choices[0].text.trim().split('\n');
    return res.json(questions);
  } catch (error) {
    console.error('Error generating questions:', error.message);
    return res.status(500).json({ error: 'Failed to generate questions' });
  }
}

export function GET(req, res) {
  return res.json({ Alert: 'Get request test' });
}


