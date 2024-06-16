const express = require("express");
const multer = require("multer");
const fs = require("fs");
require("dotenv").config();
const { GoogleGenerativeAI, Chatbot } = require("@google/generative-ai");
const { TextToSpeechClient } = require("@google-cloud/text-to-speech");
const ytdl = require("ytdl-core");

const app = express();
const port = process.env.PORT || 8000;
const upload = multer({ dest: "uploads/" });

// Google Generative AI setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

// Google Text-to-Speech setup
let ttsClient;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    ttsClient = new TextToSpeechClient({ credentials });
  } catch (error) {
    console.error('Error parsing Google application credentials:', error);
    ttsClient = new TextToSpeechClient();
  }
} else {
  console.error('Google application credentials not found in environment variables.');
  ttsClient = new TextToSpeechClient();
}

// Initialize Chatbot instance
let chatbot;
if (process.env.GEMINI_KEY) {
  chatbot = new Chatbot({ apiKey: process.env.GEMINI_KEY });
} else {
  console.error('Google Chatbot API key not found in environment variables.');
}

// Multer middleware for file uploads
const uploadMiddleware = upload.fields([
  { name: "thumbnails", maxCount: 4 },
  { name: "scripts", maxCount: 1 },
  { name: "videos", maxCount: 1 },
]);

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
  const outputPath = `uploads/output.mp3`;

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

  const audioPath = `uploads/audio-${Date.now()}.mp3`;

  await new Promise((resolve, reject) => {
    ytdl(videoUrl, { filter: "audioonly" })
      .pipe(fs.createWriteStream(audioPath))
      .on("finish", resolve)
      .on("error", reject);
  });

  return audioPath;
};

// Route for handling uploads
app.post("/upload", uploadMiddleware, async (req, res) => {
  try {
    let results = {};

    // Process thumbnails
    if (req.files["thumbnails"]) {
      const thumbnails = req.files["thumbnails"];
      const shouldGenerateOutcomes = req.body.autoGenerate === "true";

      if (shouldGenerateOutcomes) {
        const outcomeCount = parseInt(req.body.outcomeCount, 10) || 1;
        results.thumbnails = await generateThumbnailsWithRecommendations(thumbnails, outcomeCount);
      } else {
        results.thumbnails = thumbnails.map((file) => ({
          thumbnail: fs.readFileSync(file.path).toString("base64"),
          recommendation: "Uploaded Thumbnail",
        }));
      }
    }

    // Process text script
    if (req.body.text) {
      const mp3Path = await convertTextToMP3(req.body.text);
      results.scriptMP3 = fs.readFileSync(mp3Path).toString("base64");
      fs.unlinkSync(mp3Path);
    }

    // Process uploaded video (YouTube to MP3 or MP4)
    if (req.files["videos"] && req.files["videos"].length > 0) {
      const videoFile = req.files["videos"][0];
      const videoPath = videoFile.path;
      const videoUrl = req.body.videoUrl;

      if (videoUrl) {
        // Download YouTube video as MP3
        if (req.body.downloadType === "mp3") {
          const audioPath = await downloadYouTubeToMP3(videoUrl);
          results.videoUrl = audioPath.replace("uploads/", "/api/stream/");
        }
        // Download YouTube video as MP4
        else if (req.body.downloadType === "mp4") {
          const mp4Path = await downloadYouTubeToMP4(videoUrl);
          results.videoUrl = mp4Path.replace("uploads/", "/api/stream/");
        }
      } else {
        results.videoUrl = videoPath.replace("uploads/", "/api/stream/");
      }
    }

    res.json(results);
  } catch (error) {
    console.error("Error processing upload:", error);
    res.status(500).send("An error occurred while processing the upload.");
  } finally {
    // Cleanup uploaded files
    req.files && Object.values(req.files).forEach((fileArray) => {
      fileArray.forEach((file) => fs.unlinkSync(file.path));
    });
  }
});

// Route to stream uploaded video
app.get("/stream/:file", (req, res) => {
  const filePath = `uploads/${req.params.file}`;
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(206, headers);
    file.pipe(res);
  } else {
    const headers = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
