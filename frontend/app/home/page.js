"use client";
import React, { useState } from "react";
import axios from "axios";

const InteractiveForm = () => {
  const [scriptContent, setScriptContent] = useState("");
  const [mp3Url, setMp3Url] = useState("");
  const [mp4Url, setMp4Url] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [thumbnailFiles, setThumbnailFiles] = useState([]);
  const [recommendedThumbnail, setRecommendedThumbnail] = useState("");
  const [aiThumbnails, setAiThumbnails] = useState([]);
  const [conversionType, setConversionType] = useState("mp3"); // State to handle conversion type
  const [error, setError] = useState("");

  const handleConvertTextToMP3 = async () => {
    try {
      const response = await axios.post("/api/convert-text-to-mp3", {
        scriptContent,
      });
      setMp3Url(response.data.path);
      setError("");
    } catch (error) {
      setError("Error converting text to MP3. Please try again.");
      console.error("Error converting text to MP3:", error);
    }
  };

  const handleDownloadYouTube = async () => {
    try {
      const endpoint =
        conversionType === "mp3"
          ? "/api/download-youtube-to-mp3"
          : "/api/download-youtube-to-mp4";
      const response = await axios.post(endpoint, {
        videoUrl,
      });
      if (conversionType === "mp3") {
        setAudioUrl(response.data.path);
      } else {
        setMp4Url(response.data.path);
      }
      setError("");
    } catch (error) {
      setError(
        `Error downloading YouTube video to ${conversionType.toUpperCase()}. Please try again.`
      );
      console.error(
        `Error downloading YouTube video to ${conversionType.toUpperCase()}:`,
        error
      );
    }
  };

  const handleThumbnailUpload = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    // Allow uploading up to 4 thumbnails
    for (let i = 0; i < Math.min(thumbnailFiles.length, 4); i++) {
      formData.append("thumbnails", thumbnailFiles[i]);
    }

    try {
      const response = await axios.post("/api/recommend-thumbnail", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setRecommendedThumbnail(response.data.recommendedThumbnail);
      setAiThumbnails(response.data.aiThumbnails);
      setError("");
    } catch (error) {
      setError("Error uploading or recommending thumbnails. Please try again.");
      console.error("Error uploading or recommending thumbnails:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Interactive Form</h1>

      {/* Convert Text to MP3 Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold">Convert Text to MP3</h2>
        <textarea
          value={scriptContent}
          onChange={(e) => setScriptContent(e.target.value)}
          placeholder="Enter text to convert to MP3"
          className="border rounded px-3 py-2 mb-4 w-full h-24"
        ></textarea>
        <button
          onClick={handleConvertTextToMP3}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Convert to MP3
        </button>
        {mp3Url && (
          <p className="mt-2">
            MP3 file created:{" "}
            <a
              href={mp3Url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500"
            >
              {mp3Url}
            </a>
          </p>
        )}
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {/* Download YouTube Video Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold">Download YouTube Video</h2>
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="Enter YouTube video URL"
          className="border rounded px-3 py-2 mb-4 w-full"
        />
        <div className="mb-4">
          <label htmlFor="conversionType" className="block mb-2">
            Select Conversion Type:
          </label>
          <select
            id="conversionType"
            value={conversionType}
            onChange={(e) => setConversionType(e.target.value)}
            className="border rounded px-3 py-2 mb-4 w-full"
          >
            <option value="mp3">MP3</option>
            <option value="mp4">MP4</option>
          </select>
        </div>
        <button
          onClick={handleDownloadYouTube}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Download {conversionType.toUpperCase()}
        </button>
        {audioUrl && conversionType === "mp3" && (
          <p className="mt-2">
            MP3 file downloaded:{" "}
            <a
              href={audioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500"
            >
              {audioUrl}
            </a>
          </p>
        )}
        {mp4Url && conversionType === "mp4" && (
          <p className="mt-2">
            MP4 file downloaded:{" "}
            <a
              href={mp4Url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500"
            >
              {mp4Url}
            </a>
          </p>
        )}
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {/* Upload Thumbnails Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold">Upload Thumbnails</h2>
        <form onSubmit={handleThumbnailUpload} className="mt-4">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setThumbnailFiles(e.target.files)}
            className="border rounded px-3 py-2 mb-4 w-full"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Upload Thumbnails
          </button>
        </form>
        {recommendedThumbnail && (
          <div className="mt-4">
            <h3 className="text-lg font-medium">Recommended Thumbnail:</h3>
            <img
              src={recommendedThumbnail}
              alt="Recommended Thumbnail"
              className="w-full h-auto mt-2"
            />
          </div>
        )}
        {aiThumbnails.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-medium">AI Generated Thumbnails:</h3>
            <div className="grid grid-cols-2 gap-4">
              {aiThumbnails.map((thumbnail, index) => (
                <img
                  key={index}
                  src={thumbnail}
                  alt={`AI Thumbnail ${index + 1}`}
                  className="w-full h-auto"
                />
              ))}
            </div>
          </div>
        )}
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default InteractiveForm;
