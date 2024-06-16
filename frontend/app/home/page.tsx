"use client"
import { useState } from "react";
import axios from "axios";
import "./Home.css";

export default function Home() {
  const [thumbnails, setThumbnails] = useState<File[]>([]);
  const [outcomeCount, setOutcomeCount] = useState<number>(1); // Default to generating 1 outcome image per thumbnail
  const [autoGenerate, setAutoGenerate] = useState<boolean>(false); // State to track if auto-generation is selected
  const [results, setResults] = useState<{
    [key: string]: {
      thumbnail: string;
      recommendation: string;
      outcomes?: string[];
      enhancedThumbnail?: string; // New property to hold enhanced thumbnail
    };
  }>({});

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const selectedFiles = Array.from(files).slice(0, 4); // Limit to 4 files
    setThumbnails(selectedFiles);
  };

  const handleOutcomeCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value, 10);
    if (!isNaN(count)) {
      setOutcomeCount(count);
    }
  };

  const handleAutoGenerateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoGenerate(e.target.checked);
  };

  const BASEURL = "http://localhost:8000";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (thumbnails.length === 0) {
      alert("Please upload at least one thumbnail.");
      return;
    }

    const formData = new FormData();
    thumbnails.forEach((file, index) => {
      formData.append(`thumbnails`, file); // Use 'thumbnails' as the field name
    });

    try {
      const response = await axios.post(`${BASEURL}/thumbnails`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: {
          autoGenerate: autoGenerate ? "true" : "false", // Send autoGenerate flag to the server
          outcomeCount: outcomeCount.toString(), // Send outcomeCount to the server
        },
      });

      const { thumbnail1, thumbnail2, recommendation, enhancedThumbnail1, enhancedThumbnail2 } = response.data;

      setResults({
        thumbnail1: {
          thumbnail: thumbnail1,
          recommendation: recommendation,
          enhancedThumbnail: enhancedThumbnail1, // Set enhancedThumbnail if available
        },
        thumbnail2: {
          thumbnail: thumbnail2,
          recommendation: recommendation,
          enhancedThumbnail: enhancedThumbnail2, // Set enhancedThumbnail if available
        },
      });
    } catch (error) {
      console.error("Error uploading thumbnails:", error);
      alert("An error occurred while uploading thumbnails.");
    }
  };

  return (
    <div style={{ margin: "80px", fontSize: 24 }}>
      <h1>Evaluate YouTube Thumbnails</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Upload Thumbnails (up to 4):
            <input
              type="file"
              name="thumbnails"
              onChange={handleThumbnailUpload}
              multiple
              accept="image/png, image/jpeg"
            />
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={autoGenerate}
              onChange={handleAutoGenerateChange}
            />
            Auto-generate enhanced thumbnails ideal for videos
          </label>
        </div>
        {autoGenerate && (
          <div>
            <label>
              Number of enhanced thumbnails per uploaded thumbnail:
              <input
                type="number"
                value={outcomeCount}
                onChange={handleOutcomeCountChange}
                min="1"
                max="5"
              />
            </label>
          </div>
        )}
        <button type="submit">Submit</button>
      </form>
      {Object.keys(results).length > 0 && (
        <div>
          <h2>Evaluation Results</h2>
          {Object.keys(results).map((key) => (
            <div key={key}>
              <h3>Thumbnail {key}</h3>
              <p>{results[key].thumbnail}</p>
              <p>{results[key].recommendation}</p>
              {results[key].outcomes && (
                <div>
                  <h4>Outcome Images</h4>
                  {results[key].outcomes.map((outcome, index) => (
                    <div key={`${key}-outcome-${index}`}>
                      <p>{outcome}</p>
                    </div>
                  ))}
                </div>
              )}
              {results[key].enhancedThumbnail && (
                <div>
                  <h4>Enhanced Thumbnail</h4>
                  <img src={`data:image/jpeg;base64,${results[key].enhancedThumbnail}`} alt={`Enhanced Thumbnail ${key}`} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
