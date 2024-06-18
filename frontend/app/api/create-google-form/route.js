import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, questions } = req.body;

  if (!title || !questions || !Array.isArray(questions)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  try {
    const formData = {
      title,
      questions: questions.map((question) => ({
        questionText: question,
        type: 'text', // Assuming all questions are text-based
      })),
    };

    // Simulate creation by returning a dummy form URL
    const formUrl = 'https://docs.google.com/forms/d/e/your_dummy_form_url';
    return res.status(200).json({ formUrl });
  } catch (error) {
    console.error('Error creating Google Form:', error);
    return res.status(500).json({ error: 'Failed to create Google Form' });
  }
}
