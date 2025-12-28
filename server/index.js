// -------------------- IMPORTS --------------------
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

// -------------------- FIX __dirname (ES MODULES) --------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------- LOAD ENV (IMPORTANT FIX) --------------------
dotenv.config({
  path: path.join(__dirname, ".env"), // 👈 FORCE server/.env
});

// -------------------- DEBUG (KEEP FOR NOW) --------------------
console.log("ENV FILE PATH:", path.join(__dirname, ".env"));
console.log("OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY);

// -------------------- FAIL FAST IF KEY MISSING --------------------
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY not found. Check server/.env");
  process.exit(1);
}

// -------------------- OPENAI CLIENT --------------------
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log("OpenAI Key Loaded: YES ✅");

// -------------------- EXPRESS SETUP --------------------
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// -------------------- TEST ROUTE --------------------
app.get("/", (req, res) => {
  res.json({ status: "Brainstormzz API running 🚀" });
});

// -------------------- AI ROUTE --------------------
app.post("/api/brainstorm", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a creative brainstorming assistant.",
        },
        {
          role: "user",
          content: `Generate 7 structured brainstorming ideas about: ${prompt}`,
        },
      ],
    });

    res.json({
      ideas: response.choices[0].message.content,
    });
  } catch (error) {
    console.error("AI Error:", error.message);
    res.status(500).json({ error: "AI generation failed" });
  }
});

// -------------------- START SERVER --------------------
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
