// pages/index.js
"use client";
import React, { useState } from "react";
import axios from "axios";

export default function Home() {
  const [thumbnails, setThumbnails] = useState([]);
  const [textInput, setTextInput] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [outcomeCount, setOutcomeCount] = useState(1);
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [results, setResults] = useState({
    thumbnails: [],
    scriptMP3: null,
    enhancedScript: null,
    videoUrl: null,
  });

  const handleThumbnailUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    setThumbnails(files);
  };

  const handleTextChange = (e) => {
    setTextInput(e.target.value);
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    setVideoFile(file);
  };

  const handleSubmitThumbnails = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    thumbnails.forEach((file) => formData.append("thumbnails", file));

    try {
      const response = await axios.post("http://localhost:8000/upload/thumbnails", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResults({
        ...results,
        thumbnails: response.data.thumbnails || [],
      });
    } catch (error) {
      console.error("Error uploading thumbnails:", error);
      alert("An error occurred while uploading thumbnails.");
    }
  };

  const handleSubmitText = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    if (textInput.trim() !== "") formData.append("text", textInput);

    try {
      const response = await axios.post("http://localhost:8000/upload/text", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResults({
        ...results,
        scriptMP3: response.data.scriptMP3 || null,
        enhancedScript: response.data.enhancedScript || null,
      });
    } catch (error) {
      console.error("Error uploading text:", error);
      alert("An error occurred while uploading text.");
    }
  };

  const handleSubmitVideo = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    if (videoFile) formData.append("video", videoFile);

    try {
      const response = await axios.post("http://localhost:8000/upload/video", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResults({
        ...results,
        videoUrl: response.data.videoUrl || null,
      });
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("An error occurred while uploading video.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-8 bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Thumbnail Evaluation, Text-to-MP3 Conversion, and Video Upload</h1>
      <div className="max-w-4xl w-full bg-white shadow-md rounded-lg px-8 py-6">
        {/* Thumbnail Upload Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Upload Thumbnails (up to 4)</h2>
          <form onSubmit={handleSubmitThumbnails}>
            <input
              type="file"
              name="thumbnails"
              onChange={handleThumbnailUpload}
              multiple
              accept="image/png, image/jpeg"
              className="mt-2"
            />
            <button
              type="submit"
              className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Submit Thumbnails
            </button>
          </form>
        </div>

        {/* Text Input Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Type or Paste Text</h2>
          <form onSubmit={handleSubmitText}>
            <textarea
              value={textInput}
              onChange={handleTextChange}
              rows={5}
              className="mt-2 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter text for script..."
            />
            <button
              type="submit"
              className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Submit Text
            </button>
          </form>
        </div>

        {/* Video Upload Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Upload Video</h2>
          <form onSubmit={handleSubmitVideo}>
            <input
              type="file"
              name="video"
              onChange={handleVideoUpload}
              accept="video/mp4, video/mpeg, video/quicktime"
              className="mt-2"
            />
            <button
              type="submit"
              className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Submit Video
            </button>
          </form>
        </div>

        {/* Auto-Generate Section */}
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            checked={autoGenerate}
            onChange={(e) => setAutoGenerate(e.target.checked)}
            className="mr-2"
          />
          <span className="text-gray-700">Auto-generate enhanced thumbnails ideal for videos</span>
          {autoGenerate && (
            <input
              type="number"
              value={outcomeCount}
              onChange={(e) => setOutcomeCount(parseInt(e.target.value))}
              min="1"
              max="5"
              className="ml-4 shadow appearance-none border rounded w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="mt-8 max-w-4xl w-full">
        {results.thumbnails.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Thumbnail Evaluation Results</h2>
            {results.thumbnails.map((thumbnail, index) => (
              <div key={index} className="mb-4">
                <img
                  src={`data:image/jpeg;base64,${thumbnail.thumbnail}`}
                  alt={`Thumbnail ${index + 1}`}
                  className="max-w-full h-auto"
                />
                <p className="mt-2">{thumbnail.recommendation}</p>
                {thumbnail.outcomes && (
                  <div className="mt-4">
                    <h3 className="text-xl font-bold">Outcome Images:</h3>
                    <div className="flex flex-wrap mt-2">
                      {thumbnail.outcomes.map((outcome, idx) => (
                        <img
                          key={idx}
                          src={`data:image/jpeg;base64,${outcome}`}
                          alt={`Outcome ${idx + 1}`}
                          className="max-w-full h-auto mr-4 mb-4"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {results.scriptMP3 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold">Text-to-MP3 Conversion Result</h2>
            <audio
              controls
              className="mt-2"
              src={`data:audio/mp3;base64,${results.scriptMP3}`}
              type="audio/mp3"
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
        {results.enhancedScript && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold">Enhanced Text Script</h2>
            <p className="mt-2 whitespace-pre-line">{results.enhancedScript}</p>
          </div>
        )}
        {results.videoUrl && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold">Uploaded Video</h2>
            <video
              controls
              className="mt-2"
              src={results.videoUrl}
              type="video/mp4"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}
      </div>
    </div>
  );
}
