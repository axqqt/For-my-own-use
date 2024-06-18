"use client"
import { useState } from 'react';
import { jsPDF } from 'jspdf';
import axios from 'axios';

function QuestionnaireGenerator() {
  const [prompt, setPrompt] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateQuestions = async () => {
    setLoading(true);
    setError('');
    setQuestions([]);
    try {
      const response = await axios.post('/api/questions', { prompt }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status !== 200) {
        throw new Error('Failed to generate questions');
      }

      setQuestions(response.data.questions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Generated Questions', 10, 10);
    const rows = questions.map((question, index) => [index + 1, question]);
    doc.autoTable({
      head: [['#', 'Question']],
      body: rows,
    });
    doc.save('questions.pdf');
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Questionnaire Generator</h1>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter a prompt"
        className="textarea textarea-bordered w-full mb-4"
      />
      <button onClick={generateQuestions} className="btn btn-primary w-full mb-4" disabled={loading}>
        {loading ? 'Generating...' : 'Generate Questions'}
      </button>
      {error && <div className="alert alert-error mb-4">{error}</div>}
      {questions.length > 0 && (
        <div className="card bg-base-100 shadow-lg p-4 mb-4">
          <h2 className="text-xl font-bold mb-2">Generated Questions</h2>
          <ul className="space-y-2">
            {questions.map((question, index) => (
              <li key={index}>
                <textarea
                  value={question}
                  onChange={(e) => {
                    const newQuestions = [...questions];
                    newQuestions[index] = e.target.value;
                    setQuestions(newQuestions);
                  }}
                  className="textarea textarea-bordered w-full"
                />
              </li>
            ))}
          </ul>
          <button onClick={exportToPDF} className="btn btn-secondary mt-4">Export to PDF</button>
        </div>
      )}
    </div>
  );
}

export default QuestionnaireGenerator;
