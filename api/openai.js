import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, mode, targetLanguage } = req.body;

    if (!prompt && mode !== "expand") {
      return res.status(400).json({
        error: "Prompt required for summarize/translate",
      });
    }

    let finalPrompt = prompt;

    if (mode === "expand") {
      finalPrompt = `Generate exactly 7 concise brainstorming ideas about "${prompt}".

Return ONLY a numbered list.
Each idea max 6–8 words.`;
    }

    if (mode === "summarize") {
      finalPrompt = `Summarize the following brainstorming ideas into a short paragraph:

${prompt}`;
    }

    if (mode === "translate") {
      if (!targetLanguage) {
        return res.status(400).json({
          error: "Target language required for translation",
        });
      }

      finalPrompt = `Translate the following text into ${targetLanguage}:

${prompt}`;
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: finalPrompt }],
    });

    res.status(200).json({
      result: completion.choices[0].message.content,
    });

  } catch (err) {
    console.error("OpenAI error:", err);
    res.status(500).json({ error: "AI request failed" });
  }
}