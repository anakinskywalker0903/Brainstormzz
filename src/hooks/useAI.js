import { useState, useCallback } from 'react';

const API_BASE = "http://localhost:3001";

const useAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastResponse, setLastResponse] = useState(null);

  // Detect Chrome Gemini Nano
  const isChromeAIAvailable = () =>
    typeof window !== 'undefined' && !!window.ai?.createTextSession;

  // 🔹 Helper: OpenAI backend call
  const callBackend = async (endpoint, body) => {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error("AI backend failed");
    return res.json();
  };

  // --- 1️⃣ Expand Ideas ---
  const expandIdeas = useCallback(async (prompt) => {
    setIsLoading(true);
    setError(null);

    try {
      // ✅ Chrome Gemini Nano
      if (isChromeAIAvailable()) {
        const session = await window.ai.createTextSession();
        const result = await session.prompt(
          `Generate 7 creative brainstorming ideas about: ${prompt}`
        );

        const ideas = result.split('\n').filter(Boolean);
        setLastResponse({ type: 'expand', data: ideas });
        return ideas;
      }

      // 🌐 OpenAI fallback
      const data = await callBackend("expand", { prompt });
      const ideas = data.result.split('\n').filter(Boolean);

      setLastResponse({ type: 'expand', data: ideas });
      return ideas;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- 2️⃣ Refine Idea ---
  const refineIdea = useCallback(async (text) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isChromeAIAvailable()) {
        const session = await window.ai.createTextSession();
        const result = await session.prompt(
          `Refine this idea for clarity and creativity: ${text}`
        );

        setLastResponse({ type: 'refine', data: result });
        return result;
      }

      const data = await callBackend("refine", { text });
      setLastResponse({ type: 'refine', data: data.result });
      return data.result;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- 3️⃣ Summarize Ideas ---
  const summarizeIdeas = useCallback(async (ideas) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isChromeAIAvailable()) {
        const session = await window.ai.createTextSession();
        const result = await session.prompt(
          `Summarize these brainstorming ideas into a concise plan:\n${ideas.join('\n')}`
        );

        setLastResponse({ type: 'summarize', data: result });
        return result;
      }

      const data = await callBackend("summarize", { ideas });
      setLastResponse({ type: 'summarize', data: data.result });
      return data.result;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- Capability Check ---
  const checkChromeAI = useCallback(() => ({
    available: isChromeAIAvailable(),
    mode: isChromeAIAvailable() ? "On-device Gemini Nano" : "OpenAI Cloud",
  }), []);

  return {
    isLoading,
    error,
    lastResponse,
    expandIdeas,
    refineIdea,
    summarizeIdeas,
    checkChromeAI
  };
};

export default useAI;
