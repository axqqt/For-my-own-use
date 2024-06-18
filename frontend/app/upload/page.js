"use client"
import { useState } from "react";
import axios from "axios";
import Image from "next/image";

const Home = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoPrivacy, setVideoPrivacy] = useState("public");
  const [scheduledDate, setScheduledDate] = useState("");
  const [thumbnailFiles, setThumbnailFiles] = useState([]);
  const [thumbnails, setThumbnails] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [error, setError] = useState("");

  const handleVideoFileChange = (event) => {
    setVideoFile(event.target.files[0]);
  };

  const handleThumbnailFileChange = (event) => {
    setThumbnailFiles(event.target.files);
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("videoFile", videoFile);
    formData.append("videoTitle", videoTitle);
    formData.append("videoDescription", videoDescription);
    formData.append("videoPrivacy", videoPrivacy);
    if (scheduledDate) {
      formData.append("scheduledDate", scheduledDate);
    }
    for (let i = 0; i < thumbnailFiles.length; i++) {
      formData.append("thumbnails", thumbnailFiles[i]);
    }

    try {
      const response = await axios.post("/api/upload-video", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setUploadStatus("Video uploaded successfully!");
      setThumbnails(response.data.thumbnails); // Assuming the backend returns saved thumbnails
      setError("");
    } catch (error) {
      setError("Failed to upload video. Please try again.");
      console.error("Error uploading video:", error);
    }
  };

  const handleScheduleUpload = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("videoFile", videoFile);
    formData.append("videoTitle", videoTitle);
    formData.append("videoDescription", videoDescription);
    formData.append("videoPrivacy", videoPrivacy);
    formData.append("scheduledDate", scheduledDate);
    for (let i = 0; i < thumbnailFiles.length; i++) {
      formData.append("thumbnails", thumbnailFiles[i]);
    }

    try {
      const response = await axios.post("/api/schedule-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setUploadStatus(`Video scheduled for upload on ${scheduledDate}`);
      setThumbnails(response.data.thumbnails); // Assuming the backend returns saved thumbnails
      setError("");
    } catch (error) {
      setError("Failed to schedule upload. Please try again.");
      console.error("Error scheduling upload:", error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="max-w-5xl w-full flex items-center justify-between font-mono text-sm lg:flex">
        {/* Upload Form */}
        <div className="flex flex-col lg:w-1/2 lg:mr-10">
          <h2 className="text-lg font-semibold mb-4">Upload Video</h2>
          <form onSubmit={handleUpload} encType="multipart/form-data">
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoFileChange}
              required
              className="mb-4"
            />
            <input
              type="text"
              placeholder="Video Title"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              required
              className="border rounded px-3 py-2 mb-4"
            />
            <textarea
              placeholder="Video Description"
              value={videoDescription}
              onChange={(e) => setVideoDescription(e.target.value)}
              className="border rounded px-3 py-2 mb-4"
            ></textarea>
            <select
              value={videoPrivacy}
              onChange={(e) => setVideoPrivacy(e.target.value)}
              className="border rounded px-3 py-2 mb-4"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="unlisted">Unlisted</option>
            </select>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleThumbnailFileChange}
              className="mb-4"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Upload Now
            </button>
          </form>
        </div>
        {/* Schedule Form */}
        <div className="flex flex-col lg:w-1/2">
          <h2 className="text-lg font-semibold mb-4">Schedule Video</h2>
          <form onSubmit={handleScheduleUpload} encType="multipart/form-data">
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoFileChange}
              required
              className="mb-4"
            />
            <input
              type="text"
              placeholder="Video Title"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              required
              className="border rounded px-3 py-2 mb-4"
            />
            <textarea
              placeholder="Video Description"
              value={videoDescription}
              onChange={(e) => setVideoDescription(e.target.value)}
              className="border rounded px-3 py-2 mb-4"
            ></textarea>
            <select
              value={videoPrivacy}
              onChange={(e) => setVideoPrivacy(e.target.value)}
              className="border rounded px-3 py-2 mb-4"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="unlisted">Unlisted</option>
            </select>
            <input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required
              className="border rounded px-3 py-2 mb-4"
            />
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleThumbnailFileChange}
              className="mb-4"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Schedule Upload
            </button>
          </form>
        </div>
      </div>
      {/* Thumbnails Section */}
      <div className="mt-8 max-w-5xl w-full">
        <h2 className="text-lg font-semibold mb-4">Uploaded Thumbnails</h2>
        <div className="flex flex-wrap gap-4">
          {thumbnails.map((thumbnail, index) => (
            <div key={index} className="relative w-32 h-32">
              <Image
                src={thumbnail.url}
                alt={`Thumbnail ${index + 1}`}
                layout="fill"
                objectFit="cover"
                className="rounded"
              />
            </div>
          ))}
        </div>
      </div>
      {/* Upload Status and Error */}
      {uploadStatus && <p className="mt-4 text-green-500">{uploadStatus}</p>}
      {error && <p className="mt-4 text-red-500">{error}</p>}
    </main>
  );
};

export default Home;
