"use client"
import { useState } from "react";
import axios from "axios";


export default function Home() {
  const [scriptFile, setScriptFile] = useState<File | null>(null);
  const [results, setResults] = useState<{
    scriptMP3?: string;
  }>({});

  const handleScriptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScriptFile(file);
    }
  };

  const BASEURL = "http://localhost:8000";

  const convertTextToMP3 = async () => {
    if (!scriptFile) return;

    const formData = new FormData();
    formData.append("script", scriptFile);

    try {
      const response = await axios.post(`${BASEURL}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { scriptMP3 } = response.data;

      setResults({
        scriptMP3,
      });
    } catch (error) {
      console.error("Error uploading script file:", error);
      alert("An error occurred while uploading the script file.");
    }
  };

  return (
    <div style={{ margin: "80px", fontSize: 24 }}>
      <h1>Convert Text Script to MP3</h1>
      <form onSubmit={(e) => { e.preventDefault(); convertTextToMP3(); }}>
        <div>
          <label>
            Upload Text Script:
            <input
              type="file"
              name="script"
              onChange={handleScriptUpload}
              accept=".txt, .doc, .docx"
            />
          </label>
        </div>
        <button type="submit">Convert to MP3</button>
      </form>
      {results.scriptMP3 && (
        <div>
          <h2>Conversion Result</h2>
          <audio controls>
            <source src={`data:audio/mp3;base64,${results.scriptMP3}`} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
}
