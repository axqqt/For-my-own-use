"use client"
import { useState } from 'react';
import { jsPDF } from 'jspdf';
import axios from "axios"
import 'jspdf';

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
      const response = await axios.post('http://localhost:3000/api/questions', {
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const data = await response.json();
      setQuestions(data.questions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Generated Questions", 10, 10);
    const rows = questions.map((question, index) => [index + 1, question]);
    doc.autoTable({
      head: [['#', 'Question']],
      body: rows
    });
    doc.save('questions.pdf');
  };

  return (
    <div className="container">
      <h1>Questionnaire Generator</h1>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter a prompt"
        className="textarea"
      />
      <button onClick={generateQuestions} className="button" disabled={loading}>
        {loading ? 'Generating...' : 'Generate Questions'}
      </button>
      {error && <p className="error">{error}</p>}
      {questions.length > 0 && (
        <div>
          <h2>Generated Questions</h2>
          <ul className="question-list">
            {questions.map((question, index) => (
              <li key={index} className="question-item">
                <textarea
                  value={question}
                  onChange={(e) => {
                    const newQuestions = [...questions];
                    newQuestions[index] = e.target.value;
                    setQuestions(newQuestions);
                  }}
                  className="question-textarea"
                />
              </li>
            ))}
          </ul>
          <button onClick={exportToPDF} className="button">
            Export to PDF
          </button>
        </div>
      )}
      <style jsx>{`
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .textarea {
          width: 100%;
          height: 100px;
          margin-bottom: 20px;
        }
        .button {
          padding: 10px 20px;
          margin: 10px 0;
          background-color: #0070f3;
          color: white;
          border: none;
          cursor: pointer;
        }
        .button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        .error {
          color: red;
        }
        .question-list {
          list-style-type: none;
          padding: 0;
        }
        .question-item {
          margin-bottom: 10px;
        }
        .question-textarea {
          width: 100%;
          height: 50px;
        }
      `}</style>
    </div>
  );
}

export default QuestionnaireGenerator;
