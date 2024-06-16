/* eslint-disable @next/next/no-img-element */
// pages/index.js
"use client";
import React, { useState } from "react";
import axios from "axios";


export default function Home() {
  const [videoUrl, setVideoUrl] = useState("");
  const [downloadType, setDownloadType] = useState("mp3");
  const [results, setResults] = useState({
    scriptMP3: null,
    scriptMP4: null,
  });

  const handleVideoUrlChange = (e) => {
    setVideoUrl(e.target.value);
  };

  const handleDownloadTypeChange = (e : Event) => {
    setDownloadType(e.target.value);
  };

  const handleDownload = (base64Data : any , fileType : any) => {
    const blob = base64toBlob(base64Data, `audio/${fileType}`); // Create a Blob object from base64 data
    const url = window.URL.createObjectURL(blob); // Create a URL for the Blob object

    // Create a temporary anchor element
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = `video.${fileType}`;
    document.body.appendChild(a);

    // Trigger the click event to download the file
    a.click();

    // Clean up: remove the anchor and revoke the URL object to free up memory
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleSubmit = async (e:Event) => {
    e.preventDefault();

    try {
      const response = await axios.post(`http://localhost:8000/convert/${downloadType}`, {
        videoUrl: videoUrl.trim(),
      });

      setResults({
        ...results,
        [downloadType === "mp3" ? "scriptMP3" : "scriptMP4"]: response.data,
      });

      // Automatically download the file
      handleDownload(response.data, downloadType);
    } catch (error) {
      console.error(`Error converting video to ${downloadType}:`, error);
      alert(`An error occurred while converting video to ${downloadType.toUpperCase()}. Please try again.`);
    }
  };

  // Function to convert base64 to Blob object
  const base64toBlob = (base64Data : any , contentType = "audio/mp3") => {
    const sliceSize = 512;
    const byteCharacters = atob(base64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-semibold mb-8">YouTube to Media Converter</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor="videoUrl" className="font-semibold">
            YouTube Video URL
          </label>
          <input
            type="text"
            id="videoUrl"
            name="videoUrl"
            value={videoUrl}
            onChange={handleVideoUrlChange}
            className="border border-gray-300 rounded p-2"
            required
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label htmlFor="downloadType" className="font-semibold">
            Download Type
          </label>
          <select
            id="downloadType"
            name="downloadType"
            value={downloadType}
            onChange={handleDownloadTypeChange}
            className="border border-gray-300 rounded p-2"
          >
            <option value="mp3">MP3</option>
            <option value="mp4">MP4</option>
          </select>
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mt-4">
          Convert to {downloadType.toUpperCase()}
        </button>
      </form>
      {results.scriptMP3 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold">Download MP3 Result</h2>
          <audio controls className="mt-2">
            <source src={`data:audio/mp3;base64,${results.scriptMP3}`} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
      {results.scriptMP4 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold">Download MP4 Result</h2>
          <video controls className="mt-2">
            <source src={`data:video/mp4;base64,${results.scriptMP4}`} type="video/mp4" />
            Your browser does not support the video element.
          </video>
        </div>
      )}
    </div>
  );
}
