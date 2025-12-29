// -------------------- IMPORTS --------------------// -------------------- IMPORTS --------------------
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

// -------------------- FIX __dirname (ES MODULES) --------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------- LOAD ENV --------------------
dotenv.config({
  path: path.join(__dirname, ".env"), // force server/.env
});

// -------------------- DEBUG --------------------
console.log("ENV FILE PATH:", path.join(__dirname, ".env"));
console.log("OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY);

// -------------------- FAIL FAST --------------------
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY missing in server/.env");
  process.exit(1);
}

// -------------------- OPENAI CLIENT --------------------
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log("OpenAI Key Loaded: YES ✅");

// -------------------- EXPRESS APP --------------------
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// -------------------- HEALTH CHECK --------------------
app.get("/", (req, res) => {
  res.json({ status: "Brainstormzz API running 🚀" });
});

// -------------------- AI ENDPOINT --------------------
app.post("/api/brainstorm", async (req, res) => {
  try {
    const { mode, prompt, text, ideas, language } = req.body;

    let userPrompt = "";

    // ---------- EXPAND ----------
    if (mode === "expand") {
      if (!prompt) {
        return res.status(400).json({ error: "Prompt required" });
      }

      userPrompt = `
Generate exactly 7 brainstorming ideas.

Rules:
- Each idea max 8 words
- No explanations
- No markdown
- No emojis
- Return ONLY numbered list

Topic: ${prompt}
      `;
    }

    // ---------- REFINE ----------
    else if (mode === "refine") {
      if (!text) {
        return res.status(400).json({ error: "Text required" });
      }

      userPrompt = `
Refine this idea into ONE concise improved sentence:
"${text}"
      `;
    }

    // ---------- SUMMARIZE ----------
    else if (mode === "summarize") {
      if (!ideas) {
        return res.status(400).json({ error: "Ideas required" });
      }

      userPrompt = `
Summarize the following brainstorming ideas into
a short actionable plan.

Rules:
- Max 6 bullet points
- One sentence per bullet
- No markdown
- No emojis

Ideas:
${ideas}
      `;
    }

    // ---------- TRANSLATE ----------
    else if (mode === "translate") {
      if (!text || !language) {
        return res.status(400).json({ error: "Text & language required" });
      }

      userPrompt = `
Translate this idea into ${language}:
"${text}"
      `;
    }

    // ---------- INVALID ----------
    else {
      return res.status(400).json({ error: "Invalid mode" });
    }

    // ---------- OPENAI CALL ----------
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful brainstorming assistant." },
        { role: "user", content: userPrompt },
      ],
    });

    res.json({
      result: response.choices[0].message.content,
    });

  } catch (error) {
    console.error("❌ AI Error:", error.message);
    res.status(500).json({ error: "AI backend failed" });
  }
});

// -------------------- START SERVER --------------------
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
