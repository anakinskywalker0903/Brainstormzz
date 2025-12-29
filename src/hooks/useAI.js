import { useState, useCallback } from "react";

const API_URL = "http://localhost:5000/api/brainstorm";

const useAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastResponse, setLastResponse] = useState(null);

  // =========================
  // Chrome Gemini Nano check
  // =========================
  const isChromeAIAvailable = () =>
    typeof window !== "undefined" && !!window.ai?.createTextSession;

  // =========================
  // Unified backend call
  // =========================
  const callBackend = async (payload) => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("AI backend failed");
    }

    return res.json();
  };

  // =========================
// 1️⃣ EXPAND IDEAS
// =========================

const expandIdeas = useCallback(async (prompt) => {
  setIsLoading(true);
  setError(null);

  try {
    // 🔹 Gemini Nano (ONLY local Chrome)
    if (typeof window !== "undefined" && isChromeAIAvailable()) {
      const session = await window.ai.createTextSession();

      const result = await session.prompt(`
Generate exactly 7 brainstorming ideas.

Rules:
- One short phrase per idea
- Max 8 words
- No markdown, no emojis
- Numbered list only

Topic: ${prompt}
      `);

      const ideas = result
        .split("\n")
        .map(l => l.replace(/^\d+[\).\s]*/, "").trim())
        .filter(Boolean)
        .slice(0, 7);

      setLastResponse({ type: "expand", data: ideas });
      return ideas;
    }

    // 🔹 Backend fallback (Vercel-safe)
    const data = await callBackend({
      mode: "expand",
      prompt,
    });

    // 🛑 CRITICAL SAFETY CHECK
    if (!data || !data.result || typeof data.result !== "string") {
      console.error("Invalid backend response:", data);
      return [];
    }

    if (!data?.result || typeof data.result !== "string") {
  throw new Error("Invalid AI response");
}

const ideas = data.result
  .split("\n")
  .map(l => l.replace(/^\d+[\).\s]*/, "").trim())
  .filter(Boolean)
  .slice(0, 7);

    setLastResponse({ type: "expand", data: ideas });
    return ideas;

  } catch (err) {
    console.error(err);
    setError("Failed to expand ideas");
    return [];
  } finally {
    setIsLoading(false);
  }
}, []);

  // =========================
  // 2️⃣ REFINE IDEA
  // =========================
  const refineIdea = useCallback(async (text) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isChromeAIAvailable()) {
        const session = await window.ai.createTextSession();
        const result = await session.prompt(
          `Refine this idea into one concise sentence:\n${text}`
        );

        setLastResponse({ type: "refine", data: result });
        return result;
      }

      const data = await callBackend({
        mode: "refine",
        text,
      });

      setLastResponse({ type: "refine", data: data.result });
      return data.result;

    } catch (err) {
      setError("Failed to refine idea");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // =========================
  // 3️⃣ SUMMARIZE IDEAS
  // =========================
  const summarizeIdeas = useCallback(async (ideas) => {
    setIsLoading(true);
    setError(null);

    try {
      const cleanIdeas = ideas
        .map(i => typeof i === "string" ? i : i.text)
        .filter(Boolean)
        .slice(0, 10);

      const joined = cleanIdeas.join("\n");

      if (isChromeAIAvailable()) {
        const session = await window.ai.createTextSession();
        const result = await session.prompt(
          `Summarize these ideas into a short actionable plan:\n${joined}`
        );

        setLastResponse({ type: "summarize", data: result });
        return result;
      }

      const data = await callBackend({
        mode: "summarize",
        ideas: joined,
      });

      setLastResponse({ type: "summarize", data: data.result });
      return data.result;

    } catch (err) {
      setError("Failed to summarize ideas");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // =========================
  // 4️⃣ TRANSLATE IDEA
  // =========================
  const translateIdea = useCallback(async (text, language) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isChromeAIAvailable()) {
        const session = await window.ai.createTextSession();
        const result = await session.prompt(
          `Translate this idea to ${language}:\n${text}`
        );

        setLastResponse({ type: "translate", data: result });
        return result;
      }

      const data = await callBackend({
        mode: "translate",
        text,
        language,
      });

      setLastResponse({ type: "translate", data: data.result });
      return data.result;

    } catch (err) {
      setError("Failed to translate idea");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    lastResponse,
    expandIdeas,
    refineIdea,
    summarizeIdeas,
    translateIdea,
  };
};

export default useAI;

