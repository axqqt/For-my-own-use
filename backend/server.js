// server.js

const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const ytdl = require("ytdl-core");
const formidable = require("formidable");
const { TextToSpeechClient } = require("@google-cloud/text-to-speech");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 8000;

// Google Generative AI setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

// Google Text-to-Speech setup
let ttsClient;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    ttsClient = new TextToSpeechClient({ credentials });
  } catch (error) {
    console.error("Error parsing Google application credentials:", error);
    ttsClient = new TextToSpeechClient();
  }
} else {
  console.error("Google application credentials not found in environment variables.");
  ttsClient = new TextToSpeechClient();
}

// Helper function to generate thumbnails and recommendations
const generateThumbnailsWithRecommendations = async (thumbnails, outcomeCount) => {
  const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const results = [];
  for (const file of thumbnails) {
    const imageData = fs.readFileSync(file.path).toString("base64");
    const prompt = `Evaluate this YouTube thumbnail and explain why it is good or bad. Here is the image data: ${imageData}`;

    const outcomeImages = [];
    for (let i = 0; i < outcomeCount; i++) {
      const result = await model.generateContent({
        prompt,
        maxOutputTokens: 1024, // Adjust as needed
      });
      outcomeImages.push(result.candidates[0].output);
    }

    results.push({
      thumbnail: imageData,
      recommendation: outcomeCount > 1 ? `${outcomeCount} Outcome Images generated` : "1 Outcome Image generated",
      outcomes: outcomeImages,
    });
  }

  return results;
};

// Helper function to convert text script to MP3
const convertTextToMP3 = async (scriptContent) => {
  const request = {
    input: { text: scriptContent },
    voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
    audioConfig: { audioEncoding: "MP3" },
  };

  const [response] = await ttsClient.synthesizeSpeech(request);
  const outputPath = `./uploads/output-${Date.now()}.mp3`;

  fs.writeFileSync(outputPath, response.audioContent, "binary");

  return outputPath;
};

// Helper function to download YouTube video as MP3
const downloadYouTubeToMP3 = async (videoUrl) => {
  const videoInfo = await ytdl.getInfo(videoUrl);
  const audioFormat = ytdl.filterFormats(videoInfo.formats, "audioonly")[0];

  if (!audioFormat) {
    throw new Error("No audio format found for the provided YouTube video.");
  }

  const audioPath = `./uploads/audio-${Date.now()}.mp3`;

  await new Promise((resolve, reject) => {
    ytdl(videoUrl, { filter: "audioonly" })
      .pipe(fs.createWriteStream(audioPath))
      .on("finish", resolve)
      .on("error", reject);
  });

  return audioPath;
};

// Middleware for handling multipart/form-data uploads
const handleFormUpload = (req, res, next) => {
  const form = new formidable.IncomingForm();
  form.uploadDir = "./uploads"; // Set the upload directory
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing form:", err);
      res.status(500).send("An error occurred while parsing the form.");
      return;
    }

    req.body = { fields, files }; // Attach parsed fields and files to req.body
    next(); // Move to the next middleware
  });
};

// API route handler for /api/questions
app.post("/api/questions", handleFormUpload, async (req, res) => {
  try {
    const { prompt } = req.body.fields;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const genAIModel = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await genAIModel.generateContent(prompt);

    if (!result || !result.response || typeof result.response.text !== "string") {
      throw new Error("Invalid response from API");
    }

    const response = result.response.text.trim();
    console.log(response)

    if (!response) {
      throw new Error("Empty response from API");
    }

    const questions = response.split("\n");

    return res.status(200).json({ questions });
  } catch (err) {
    console.error("Error generating questions:", err);
    return res.status(500).json({ error: `Failed to generate questions: ${err.message}` });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Internal server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
