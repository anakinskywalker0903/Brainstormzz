// src/hooks/useAI.js
import { useCallback, useState } from "react";

// Use OPENAI_API_KEY as requested
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY || process.env.REACT_APP_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
// Note: User said they pasted OpenAI key into REACT_APP_GEMINI_API_KEY, but we should try to grab whichever is available.
// Ideally, we should just use the key they have.

const ENDPOINT = "https://api.openai.com/v1/chat/completions";

export function useAI() {
  const [loading, setLoading] = useState(false);

  const callOpenAI = async (messages, jsonMode = true) => {
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo-1106", // Supports response_format type: json_object
          messages: messages,
          temperature: 0.9,
          response_format: jsonMode ? { type: "json_object" } : undefined
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error("OpenAI API error:", err);
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      return jsonMode ? JSON.parse(content) : content;
    } catch (error) {
      console.error("AI Request Failed:", error);
      throw error;
    }
  };

  const generateIdeas = useCallback(async (topic) => {
    if (!topic) return [];
    setLoading(true);
    try {
      const messages = [
        {
          role: "system",
          content: `You are a visionary creative strategist. Output valid JSON only. 
          Return a format: { "ideas": [ { "title": "Stunning Concept", "description": "Compelling 1-line detail" } ] }`
        },
        {
          role: "user",
          content: `Topic: ${topic}. 
          Generate EXACTLY 6 distinct, world-class, innovative ideas. 
          Each title must be punchy and professional.
          Return a flat list ideas array.`
        }
      ];

      const data = await callOpenAI(messages, true);
      return data.ideas || [];
    } catch (error) {
      console.error("Generate Error:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const summarizeIdeas = useCallback(async (ideas) => {
    if (!ideas || ideas.length === 0) return '';
    setLoading(true); // summarize usually fast but good to show loading
    try {
      const ideasText = ideas.map(i => `- ${i.text}`).join('\n');
      const messages = [
        {
          role: "system",
          content: "You are a helpful assistant. Summarize the following ideas into a concise paragraph."
        },
        {
          role: "user",
          content: ideasText
        }
      ];

      // Note: No JSON mode for summary, just text
      const text = await callOpenAI(messages, false);
      return text;
    } catch (error) {
      console.error('Summarize Error:', error);
      return "Failed to summarize.";
    } finally {
      setLoading(false);
    }
  }, []);

  const refineIdeas = useCallback(async (ideasToRefine) => {
    if (!ideasToRefine || ideasToRefine.length === 0) return [];
    setLoading(true);
    try {
      const messages = [
        {
          role: "system",
          content: `You are a professional editor. Refine the text of these ideas to be more impactful.
          Keep the same IDs. Output JSON: { "refined": [{ "id": 123, "text": "..." }] }`
        },
        {
          role: "user",
          content: JSON.stringify(ideasToRefine.map(i => ({ id: i.id, text: i.text })))
        }
      ];

      const data = await callOpenAI(messages, true);
      return data.refined || [];
    } catch (error) {
      console.error('Refine Error:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { generateIdeas, summarizeIdeas, refineIdeas, loading };
}
