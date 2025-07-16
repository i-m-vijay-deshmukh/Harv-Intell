import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: "*" })); // Allow all origins (adjust if needed)

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

if (!GEMINI_API_KEY) {
    console.error("❌ ERROR: GEMINI_API_KEY is missing! Check your Render environment variables.");
    process.exit(1);
}

app.get("/", (req, res) => {
    res.send("Welcome to the Google Gemini Chatbot API!");
});

// ✅ Chatbot API Route
app.post("/api/message", async (req, res) => {
    try {
        const userMessage = req.body.message;
        if (!userMessage) {
            return res.status(400).json({ error: "Message is required." });
        }

        console.log(`✅ Received message: ${userMessage}`);

        const response = await fetch(GEMINI_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userMessage }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 500
                }
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";

        res.json({ message: botReply });

    } catch (error) {
        console.error("❌ Chatbot API Error:", error);
        res.status(500).json({ error: "Failed to generate response. Try again later." });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));