// src/hooks/useAI.js
import { useCallback } from "react";

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;


const ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export function useAI() {
  const generateIdeas = useCallback(async (topic) => {
    if (!topic) return [];

    try {
      const response = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `
You are a backend JSON API.

RULES:
- Output ONLY valid JSON
- No explanations
- No markdown
- No backticks

Return EXACTLY this structure:

{
  "mainHeadings": [
    {
      "title": "Heading name",
      "subIdeas": ["idea 1", "idea 2", "idea 3"]
    }
  ]
}

Topic: "${topic}"
`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 700,
            responseMimeType: "application/json",
          },
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error("Gemini API error:", err);
        return [];
      }

      const data = await response.json();
      console.log("GEMINI RAW RESPONSE:", data);

      const part = data?.candidates?.[0]?.content?.parts?.[0];
      if (!part) return [];

      // Case 1: JSON object
      if (part.json?.mainHeadings) {
        return part.json.mainHeadings;
      }

      // Case 2: JSON as string
      if (part.text) {
        const parsed = JSON.parse(part.text);
        return parsed.mainHeadings || [];
      }

      return [];
    } catch (error) {
      console.error("AI ERROR:", error);
      return [];
    }
  }, []);

  return { generateIdeas };
}
