"use client"
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
        thumbnails.forEach((thumbnail) => {
          formData.append('thumbnails', thumbnail);
        });
      }
      if (text.trim() !== '') {
        formData.append('text', text.trim());
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

  const handleAutoGenerateChange = () => {
    setAutoGenerate(!autoGenerate);
  };

  const handleOutcomeCountChange = (e) => {
    const count = parseInt(e.target.value);
    setOutcomeCount(isNaN(count) ? 1 : count);
  };

  return (
    <div className="container">
      <form onSubmit={handleFormSubmit}>
        <div className="form-group">
          <label htmlFor="thumbnails">Upload Thumbnails:</label>
          <input type="file" id="thumbnails" name="thumbnails" multiple onChange={handleFileChange} />
        </div>
        <div className="form-group">
          <label htmlFor="text">Text Script:</label>
          <textarea id="text" name="text" value={text} onChange={handleTextChange} />
        </div>
        <div className="form-group">
          <label htmlFor="video">Upload Video:</label>
          <input type="file" id="video" name="videos" onChange={handleVideoChange} />
        </div>
        <div className="form-group">
          <label htmlFor="autoGenerate">Auto Generate Outcomes:</label>
          <input type="checkbox" id="autoGenerate" name="autoGenerate" checked={autoGenerate} onChange={handleAutoGenerateChange} />
        </div>
        {autoGenerate && (
          <div className="form-group">
            <label htmlFor="outcomeCount">Number of Outcomes:</label>
            <input type="number" id="outcomeCount" name="outcomeCount" value={outcomeCount} onChange={handleOutcomeCountChange} />
          </div>
        )}
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>

      {error && <p className="error-msg">Error: {error}</p>}
      {results && (
        <div className="results">
          <h2>Results:</h2>
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Home;
