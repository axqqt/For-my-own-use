"use server"
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import ytdl from 'ytdl-core';
import formidable from 'formidable';

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

// Helper function to generate thumbnails and recommendations
const generateThumbnailsWithRecommendations = async (thumbnails: formidable.File[], outcomeCount: number) => {
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
const convertTextToMP3 = async (scriptContent: string) => {
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
const downloadYouTubeToMP3 = async (videoUrl: string) => {
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

export const config = {
    api: {
        bodyParser: false, // Disable bodyParser to use formidable for file uploads
    },
};

// Next.js API route handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        return res.status(200).json({ message: 'GET request testing' });

    }

    if (req.method === 'POST') {
        const form = new formidable.IncomingForm();
        form.uploadDir = "./uploads"; // Set the upload directory
        form.keepExtensions = true;

        try {
            form.parse(req, async (err, fields, files) => {
                if (err) {
                    console.error('Error parsing form:', err);
                    res.status(500).send('An error occurred while parsing the form.');
                    return;
                }

                let results = {};

                // Process thumbnails
                if (files["thumbnails"]) {
                    const thumbnails = Array.isArray(files["thumbnails"]) ? files["thumbnails"] : [files["thumbnails"]];
                    const shouldGenerateOutcomes = fields.autoGenerate === "true";

                    if (shouldGenerateOutcomes) {
                        const outcomeCount = parseInt(fields.outcomeCount, 10) || 1;
                        results.thumbnails = await generateThumbnailsWithRecommendations(thumbnails, outcomeCount);
                    } else {
                        results.thumbnails = thumbnails.map((file) => ({
                            thumbnail: fs.readFileSync(file.path).toString("base64"),
                            recommendation: "Uploaded Thumbnail",
                        }));
                    }
                }

                // Process text script
                if (fields.text) {
                    const mp3Path = await convertTextToMP3(fields.text);
                    results.scriptMP3 = fs.readFileSync(mp3Path).toString("base64");
                    fs.unlinkSync(mp3Path);
                }

                // Process uploaded video (YouTube to MP3)
                if (files["videos"]) {
                    const videoFile = Array.isArray(files["videos"]) ? files["videos"][0] : files["videos"];
                    const videoPath = videoFile.path;
                    const videoUrl = fields.videoUrl;

                    if (videoUrl) {
                        const audioPath = await downloadYouTubeToMP3(videoUrl);
                        results.videoUrl = audioPath.replace("uploads/", "/api/stream/");
                    } else {
                        results.videoUrl = videoPath.replace("uploads/", "/api/stream/");
                    }
                }

                res.status(200).json(results);
            });
        } catch (error) {
            console.error("Error processing upload:", error);
            res.status(500).send("An error occurred while processing the upload.");
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
}
