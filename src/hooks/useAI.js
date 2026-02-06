// src/hooks/useAI.js
import { useCallback, useState } from "react";

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;


const ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export function useAI() {
  const [loading, setLoading] = useState(false);

  const generateIdeas = useCallback(async (topic) => {
    if (!topic) return [];
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, []);

  /* Existing generateIdeas code above... preserving it via the 'TargetContent' context matching logic usually, but here I'm adding new functions before the return */

  const summarizeIdeas = useCallback(async (ideas) => {
    if (!ideas || ideas.length === 0) return '';

    try {
      const ideasText = ideas.map(i => `- ${i.text}`).join('\n');

      const response = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{
              text: `
                Summarize these brainstorming ideas into a concise, cohesive paragraph.
                
                Ideas:
                ${ideasText}
              `
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      });

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return text || 'Could not generate summary.';
    } catch (error) {
      console.error('Summarize Error:', error);
      throw error;
    }
  }, []);

  const refineIdeas = useCallback(async (ideasToRefine) => {
    if (!ideasToRefine || ideasToRefine.length === 0) return [];

    try {
      const response = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{
              text: `
                You are a backend JSON API.
                Refine these ideas to be more impactful, professional, and clear.
                Keep the same IDs.
                
                Input: ${JSON.stringify(ideasToRefine.map(i => ({ id: i.id, text: i.text })))}
                
                Return JSON structure:
                {
                  "refined": [
                    { "id": 123, "text": "Refined text here" }
                  ]
                }
              `
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json",
          },
        }),
      });

      const data = await response.json();
      const part = data?.candidates?.[0]?.content?.parts?.[0];

      let result = [];
      if (part.json?.refined) {
        result = part.json.refined;
      } else if (part.text) {
        const parsed = JSON.parse(part.text);
        result = parsed.refined || [];
      }
      return result;
    } catch (error) {
      console.error('Refine Error:', error);
      throw error;
    }
  }, []);

  return { generateIdeas, summarizeIdeas, refineIdeas, loading };
}
