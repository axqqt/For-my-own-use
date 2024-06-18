"use client"
import React, { useState } from 'react';
import axios from 'axios';
import { auth, provider } from '../firebase'; // Path to your firebase.js

const QuestionnaireForm = () => {
  const [prompt, setPrompt] = useState('');
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [user, setUser] = useState(null);

  // Firebase Google Sign-in
  const handleSignIn = async () => {
    try {
      const result = await auth.signInWithPopup(provider);
      setUser(result.user);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  // Firebase Sign-out
  const handleSignOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('/api/generate-questions', { prompt });
      setQuestions(response.data.questions);
      setError('');

      const formUrl = await createGoogleForm(response.data.questions);
      setFormUrl(formUrl);
    } catch (error) {
      setError('Failed to generate questionnaire. Please try again.');
      console.error('Error generating questionnaire:', error);
    }
  };

  // Create Google Form using API
  const createGoogleForm = async (questions) => {
    try {
      const formData = {
        title: 'Generated Questionnaire',
        questions: questions.map((question) => ({
          questionText: question,
          type: 'text', // Example: assuming all questions are text-based
        })),
      };

      const response = await axios.post('/api/create-google-form', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data.formUrl;
    } catch (error) {
      console.error('Error creating Google Form:', error);
      throw new Error('Failed to create Google Form');
    }
  };

  return (
    <div>
      <h1>Generate Questionnaire</h1>

      {/* Display user info or sign-in button */}
      {user ? (
        <div>
          <p>Signed in as: {user.displayName}</p>
          <button onClick={handleSignOut}>Sign out</button>
        </div>
      ) : (
        <button onClick={handleSignIn}>Sign in with Google</button>
      )}

      <form onSubmit={handleSubmit}>
        <label htmlFor="prompt">Enter a prompt:</label><br />
        <input
          type="text"
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          required
        /><br /><br />
        <button type="submit">Generate Questionnaire</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {questions.length > 0 && (
        <div>
          <h2>Generated Questionnaire</h2>
          <ul>
            {questions.map((question, index) => (
              <li key={index}>{question}</li>
            ))}
          </ul>

          {formUrl && (
            <div>
              <h2>Google Form</h2>
              <p>Generated Google Form: <a href={formUrl} target="_blank" rel="noopener noreferrer">{formUrl}</a></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionnaireForm;
