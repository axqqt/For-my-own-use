"use server"
import axios from 'axios';
import { NextResponse, NextRequest } from 'next/server';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const { title, questions } = await NextRequest.body().asJson();

  if (!title || !questions || !Array.isArray(questions)) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    // Example: Construct the Google Form creation request
    const formData = {
      title,
      questions: questions.map((question) => ({
        questionText: question,
        type: 'text', // Example: assuming all questions are text-based
      })),
    };

    // Example: Simulate creation by returning a dummy form URL
    const formUrl = 'https://docs.google.com/forms/d/e/your_dummy_form_url';
    return NextResponse.json({ formUrl });
  } catch (error) {
    console.error('Error creating Google Form:', error);
    return NextResponse.json({ error: 'Failed to create Google Form' }, { status: 500 });
  }
}
