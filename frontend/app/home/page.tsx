"use client"

// pages/index.jsx

import { useState } from 'react';
import axios from 'axios';

const Home = () => {
  const [thumbnails, setThumbnails] = useState(null);
  const [text, setText] = useState('');
  const [video, setVideo] = useState(null);
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [outcomeCount, setOutcomeCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const baseURL = "http://localhost:8000"; // Adjust to your backend URL

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      if (thumbnails) {
        for (let i = 0; i < thumbnails.length; i++) {
          formData.append('thumbnails', thumbnails[i]);
        }
      }
      if (text) {
        formData.append('text', text);
      }
      if (video) {
        formData.append('videos', video);
      }
      formData.append('autoGenerate', autoGenerate.toString());
      formData.append('outcomeCount', outcomeCount.toString());

      const response = await axios.post(`${baseURL}/api/questions`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResults(response.data);
    } catch (err) {
      console.error('Error uploading data:', err);
      setError('Failed to upload data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setThumbnails(files);
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleVideoChange = (e) => {
    setVideo(e.target.files[0]);
  };

  return (
    <div className="container">
      <h1>Questionnaire Generator</h1>
      <form onSubmit={handleFormSubmit}>
        <div>
          <label htmlFor="thumbnails">Upload Thumbnails:</label>
          <input type="file" id="thumbnails" name="thumbnails" multiple onChange={handleFileChange} />
        </div>
        <div>
          <label htmlFor="text">Text Script:</label>
          <textarea id="text" name="text" value={text} onChange={handleTextChange} />
        </div>
        <div>
          <label htmlFor="video">Upload Video:</label>
          <input type="file" id="video" name="videos" onChange={handleVideoChange} />
        </div>
        <div>
          <label htmlFor="autoGenerate">Auto Generate Outcomes:</label>
          <input type="checkbox" id="autoGenerate" name="autoGenerate" checked={autoGenerate} onChange={() => setAutoGenerate(!autoGenerate)} />
        </div>
        {autoGenerate && (
          <div>
            <label htmlFor="outcomeCount">Number of Outcomes:</label>
            <input type="number" id="outcomeCount" name="outcomeCount" value={outcomeCount} onChange={(e) => setOutcomeCount(parseInt(e.target.value))} />
          </div>
        )}
        <button type="submit" disabled={loading}>Submit</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {results && (
        <div>
          <h2>Results:</h2>
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Home;
