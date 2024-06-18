"use server"
// pages/api/generate-questions.js

import axios from 'axios';
import { NextResponse, NextRequest } from 'next/server';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const { prompt } = await NextRequest.body().asJson();

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
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
    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
  }
}
