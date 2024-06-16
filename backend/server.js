const express = require("express");
const multer = require("multer");
const fs = require("fs");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

const app = express();
const port = 8000;
const upload = multer({ dest: "uploads/" });

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

// Route for handling thumbnail uploads
app.post("/thumbnails", upload.array("thumbnails", 4), async (req, res) => {
  try {
    const thumbnails = req.files;

    // Check if user requested outcome images generation
    const shouldGenerateOutcomes = req.body.autoGenerate === "true";

    let results = [];

    if (shouldGenerateOutcomes) {
      const outcomeCount = parseInt(req.body.outcomeCount, 10) || 1;
      results = await generateOutcomeImages(thumbnails, outcomeCount);
    } else {
      // Simply return the uploaded thumbnails
      results = thumbnails.map((file, index) => ({
        thumbnail: fs.readFileSync(file.path).toString("base64"),
        recommendation: "Uploaded Thumbnail",
      }));
    }

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while processing the thumbnails.");
  } finally {
    // Cleanup uploaded files
    req.files.forEach((file) => fs.unlinkSync(file.path));
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
