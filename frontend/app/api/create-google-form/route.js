"use server"
import { google } from 'googleapis';
import { NextResponse, NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Function to authenticate and get access token
async function getAccessToken() {
  const keyFilePath = path.join(process.cwd(), 'path_to_your_service_account_key.json');
  const keyFileContent = await fs.readFile(keyFilePath, 'utf8');
  const credentials = JSON.parse(keyFileContent);

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/forms.body'],
  });

  const authClient = await auth.getClient();
  return authClient;
}

// Function to create Google Form
async function createGoogleForm(title, questions) {
  const authClient = await getAccessToken();

  const forms = google.forms({
    version: 'v1',
    auth: authClient,
  });

  const formDefinition = {
    info: {
      title: title,
    },
    items: questions.map((question) => ({
      title: question,
      questionItem: {
        question: {
          textQuestion: {},
        },
      },
    })),
  };

  const formResponse = await forms.forms.create({
    requestBody: formDefinition,
  });

  return formResponse.data.responderUri;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const { title, questions } = await req.json();

  if (!title || !questions || !Array.isArray(questions)) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    const formUrl = await createGoogleForm(title, questions);
    return NextResponse.json({ formUrl });
  } catch (error) {
    console.error('Error creating Google Form:', error);
    return NextResponse.json({ error: 'Failed to create Google Form' }, { status: 500 });
  }
}
