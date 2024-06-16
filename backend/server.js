const express = require("express");
const multer = require("multer");
const fs = require("fs");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { TextToSpeechClient } = require("@google-cloud/text-to-speech");

const app = express();
const port = 8000;
const upload = multer({ dest: "uploads/" });

// Google Generative AI setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

// Google Text-to-Speech setup
const ttsClient = new TextToSpeechClient({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS),
});

// Multer middleware for file uploads
const uploadMiddleware = upload.fields([
  { name: "thumbnails", maxCount: 4 },
  { name: "scripts", maxCount: 1 },
]);

// Helper function to generate outcome images
const generateOutcomeImages = async (thumbnails, outcomeCount) => {
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
      recommendation:
        outcomeCount > 1
          ? `${outcomeCount} Outcome Images generated`
          : "1 Outcome Image generated",
      outcomes: outcomeImages,
    });
  }

  return results;
};

// Helper function to convert text script to MP3
const convertTextToMP3 = async (scriptPath) => {
  const scriptContent = fs.readFileSync(scriptPath, "utf-8");

  const request = {
    input: { text: scriptContent },
    voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
    audioConfig: { audioEncoding: "MP3" },
  };

  const [response] = await ttsClient.synthesizeSpeech(request);
  const outputFile = `output.mp3`;
  const outputPath = `uploads/${outputFile}`;

  fs.writeFileSync(outputPath, response.audioContent, "binary");

  return outputPath;
};

// Route for handling uploads
app.post("/upload", uploadMiddleware, async (req, res) => {
  try {
    let results = {};

    // Process thumbnails
    if (req.files["thumbnails"]) {
      const thumbnails = req.files["thumbnails"];

      // Check if user requested outcome images generation
      const shouldGenerateOutcomes = req.body.autoGenerate === "true";

      if (shouldGenerateOutcomes) {
        const outcomeCount = parseInt(req.body.outcomeCount, 10) || 1;
        results.thumbnails = await generateOutcomeImages(thumbnails, outcomeCount);
      } else {
        // Simply return the uploaded thumbnails
        results.thumbnails = thumbnails.map((file) => ({
          thumbnail: fs.readFileSync(file.path).toString("base64"),
          recommendation: "Uploaded Thumbnail",
        }));
      }
    }

    // Process script file
    if (req.files["scripts"] && req.files["scripts"].length > 0) {
      const scriptPath = req.files["scripts"][0].path;
      const mp3Path = await convertTextToMP3(scriptPath);
      results.scriptMP3 = fs.readFileSync(mp3Path).toString("base64");

      // Delete the generated MP3 file after reading
      fs.unlinkSync(mp3Path);
    }

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while processing the upload.");
  } finally {
    // Cleanup uploaded files
    req.files && Object.values(req.files).forEach((fileArray) => {
      fileArray.forEach((file) => fs.unlinkSync(file.path));
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
