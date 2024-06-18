// server.js

const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(bodyParser.json());
app.use(cors({ origin: "*" }));

// API route handler
router.post("/", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);

    if (!result || !result.response || typeof result.response.text !== "string") {
      throw new Error("Invalid response from API");
    }

    const response = result.response.text.trim();

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

// Mount the router at /api/questions
app.use("/api/questions", router);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
