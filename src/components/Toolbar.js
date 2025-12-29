import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext.js";
import useAI from "../hooks/useAI.js";

const Toolbar = ({
  ideas,
  selectedIdeas,
  onIdeasChange,
  onSelectedIdeasChange,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [summary, setSummary] = useState("");
  const { isDark } = useTheme();

  const {
    isLoading,
    error,
    expandIdeas,
    refineIdea,
    summarizeIdeas,
    translateIdea,
  } = useAI();

/* =======================
   EXPAND IDEAS
   ======================= */
const handleExpandIdeas = async () => {
  if (!inputValue.trim()) {
    alert("Enter a prompt");
    return;
  }

  let expanded = await expandIdeas(inputValue);

  // 🛡️ SAFETY: handle string OR array
  if (typeof expanded === "string") {
    expanded = expanded
      .split("\n")
      .map(line => line.replace(/^\d+[\).\s]+/, "").trim())
      .filter(Boolean);
  }

  if (!Array.isArray(expanded) || expanded.length === 0) {
    alert("AI failed to generate ideas");
    return;
  }

  const padding = 40;
  const nodeWidth = 180;
  const gapX = 40;
  const gapY = 90;
  const boardWidth = 700;

  const maxCols = Math.max(
    1,
    Math.floor((boardWidth - padding * 2) / (nodeWidth + gapX))
  );

  const baseId = Date.now();

  const newIdeas = expanded.map((text, i) => ({
    id: baseId + i,
    text,
    x: padding + (i % maxCols) * (nodeWidth + gapX),
    y: padding + Math.floor(i / maxCols) * gapY,
    connections: [], // 🔗 no auto links
  }));

  onIdeasChange(newIdeas);
  onSelectedIdeasChange([]);
  setInputValue("");
  setSummary("");
};
  /* =======================
     REFINE IDEAS
     ======================= */
  const handleRefineIdeas = async () => {
    if (!selectedIdeas.length) return alert("Select ideas to refine");

    for (const id of selectedIdeas) {
      const idea = ideas.find((i) => i.id === id);
      if (!idea) continue;

      const refined = await refineIdea(idea.text);

      onIdeasChange((prev) =>
        prev.map((i) => (i.id === id ? { ...i, text: refined } : i))
      );
    }

    onSelectedIdeasChange([]);
  };

  /* =======================
     SUMMARIZE
     ======================= */
  const handleSummarize = async () => {
    if (!selectedIdeas.length) return alert("Select ideas to summarize");

    const selected = ideas.filter((i) =>
      selectedIdeas.includes(i.id)
    );

    const result = await summarizeIdeas(selected);
    if (typeof result === "string") setSummary(result);
  };

  /* =======================
     TRANSLATE (NO LINKS)
     ======================= */
  const handleTranslate = async () => {
    if (!selectedIdeas.length) return alert("Select ideas to translate");

    for (const id of selectedIdeas) {
      const idea = ideas.find((i) => i.id === id);
      if (!idea) continue;

      const translated = await translateIdea(idea.text, "Hindi");

      onIdeasChange((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          text: `${idea.text} → ${translated}`,
          x: idea.x + 40,
          y: idea.y + 40,
          connections: [], // 🚫 NO AUTO LINKS
        },
      ]);
    }

    onSelectedIdeasChange([]);
  };

  /* =======================
     🔗 CONNECT SELECTED
     ======================= */
  const handleConnectSelected = () => {
    if (selectedIdeas.length < 2) {
      alert("Select at least 2 ideas to connect");
      return;
    }

    onIdeasChange((prev) =>
      prev.map((idea) => {
        if (!selectedIdeas.includes(idea.id)) return idea;

        const newConnections = selectedIdeas.filter(
          (id) => id !== idea.id && !idea.connections.includes(id)
        );

        return {
          ...idea,
          connections: [...idea.connections, ...newConnections],
        };
      })
    );

    onSelectedIdeasChange([]);
  };

  /* =======================
     CLEAR BOARD
     ======================= */
  const handleClearBoard = () => {
    onIdeasChange([]);
    onSelectedIdeasChange([]);
    setInputValue("");
    setSummary("");
  };

  return (
    <div
      className="rounded-lg border p-4"
      style={{
        background: isDark ? "#000" : "#fff",
        borderColor: isDark ? "#333" : "#ddd",
        color: isDark ? "#fff" : "#1e3a8a",
      }}
    >
      <div className="flex flex-wrap gap-3 items-center">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter your idea or prompt..."
          className="flex-1 px-4 py-2 rounded-lg border"
          style={{
            background: isDark ? "#111" : "#fff",
            color: isDark ? "#fff" : "#1e3a8a",
          }}
          onKeyDown={(e) => e.key === "Enter" && handleExpandIdeas()}
        />

        <button onClick={handleExpandIdeas}>🧠 Expand</button>
        <button onClick={handleRefineIdeas}>✨ Refine</button>
        <button onClick={handleSummarize}>📝 Summarize</button>
        <button onClick={handleTranslate}>🌍 Translate</button>
        <button onClick={handleConnectSelected}>🔗 Connect</button>
        <button onClick={handleClearBoard}>🗑️ Clear</button>
      </div>

      {summary && (
        <div className="mt-4 p-4 rounded-lg border text-sm">
          <strong>📝 AI Summary</strong>
          <div className="mt-2 whitespace-pre-wrap">{summary}</div>
        </div>
      )}

      {error && (
        <div className="mt-2 text-red-400 text-sm">⚠️ {error}</div>
      )}

      <div className="mt-3 flex justify-between text-sm opacity-80">
        <div>{ideas.length} ideas • {selectedIdeas.length} selected</div>
        <div>{isLoading ? "AI Processing…" : "AI Ready"}</div>
      </div>
    </div>
  );
};

export default Toolbar;
