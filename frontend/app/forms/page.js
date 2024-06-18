"use client";
import React, { useState } from 'react';
import axios from 'axios';

const QuestionnaireForm = () => {
  const [prompt, setPrompt] = useState('');
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // Step 1: Generate questions based on the prompt
      const responseQuestions = await axios.post('/api/generate-questions', { prompt });
      setQuestions(responseQuestions.data.questions);
      setError('');

      // Step 2: Create Google Form using the generated questions
      const formUrl = await createGoogleForm(responseQuestions.data.questions);
      setFormUrl(formUrl);
    } catch (error) {
      setError('Failed to generate questionnaire. Please try again.');
      console.error('Error generating questionnaire:', error);
    }
  };

  const createGoogleForm = async (questions) => {
    try {
      const response = await axios.post('/api/create-google-form', {
        title: 'Generated Questionnaire',
        questions,
      });

      return response.data.formUrl;
    } catch (error) {
      console.error('Error creating Google Form:', error);
      throw new Error('Failed to create Google Form');
    }
  };

  const handleGeneratePdf = async () => {
    try {
      // Step 3: Generate PDF from the generated questions
      const response = await axios.post('/api/generate-pdf', { questions });
      setPdfUrl(response.data.pdfUrl);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-100">
      <div className="form-container shadow-md">
        <h1 className="form-title">Generate Questionnaire</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="prompt" className="form-label block">Enter a prompt:</label>
            <input
              type="text"
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
              className="form-input"
            />
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="form-button"
            >
              Generate Questionnaire
            </button>
          </div>
        </form>

        {error && <p className="error-message">{error}</p>}

        {questions.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mt-6">Generated Questionnaire</h2>
            <ul className="question-list">
              {questions.map((question, index) => (
                <li key={index} className="mb-2">{question}</li>
              ))}
            </ul>

            <div className="flex justify-center mt-4">
              <button
                onClick={handleGeneratePdf}
                className="form-button"
              >
                Generate PDF
              </button>
            </div>

            {formUrl && (
              <div className="mt-4">
                <h2 className="text-xl font-bold">Google Form</h2>
                <p>Generated Google Form: <a href={formUrl} target="_blank" rel="noopener noreferrer" className="google-form-link">{formUrl}</a></p>
              </div>
            )}

            {pdfUrl && (
              <div className="mt-4">
                <h2 className="text-xl font-bold">Generated PDF</h2>
                <p>Download PDF: <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="pdf-link">{pdfUrl}</a></p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionnaireForm;
