import React, { useState, useRef } from "react";
import { useTheme } from "../context/ThemeContext.js";

const NODE_WIDTH = 180;
const NODE_HEIGHT = 60;
const DRAG_THRESHOLD = 5;

const IdeaNode = ({
  idea,
  isSelected,
  onUpdate,
  onDelete,
  onSelect = () => {}, // ✅ SAFE DEFAULT
}) => {
  const { isDark } = useTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(idea.text);

  const startPos = useRef({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  /* =========================
     MOUSE DOWN
     ========================= */
  const handleMouseDown = (e) => {
    e.stopPropagation();

    startPos.current = { x: e.clientX, y: e.clientY };
    dragOffset.current = {
      x: e.clientX - idea.x,
      y: e.clientY - idea.y,
    };

    isDragging.current = false;

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  /* =========================
     MOUSE MOVE
     ========================= */
  const handleMouseMove = (e) => {
    const dx = Math.abs(e.clientX - startPos.current.x);
    const dy = Math.abs(e.clientY - startPos.current.y);

    if (!isDragging.current && (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD)) {
      isDragging.current = true;
    }

    if (!isDragging.current) return;

    const board = document.querySelector("[data-board]");
    if (!board) return;

    const maxX = board.clientWidth - NODE_WIDTH;
    const maxY = board.clientHeight - NODE_HEIGHT;

    const newX = Math.min(
      Math.max(0, e.clientX - dragOffset.current.x),
      maxX
    );
    const newY = Math.min(
      Math.max(0, e.clientY - dragOffset.current.y),
      maxY
    );

    onUpdate({ ...idea, x: newX, y: newY });
  };

  /* =========================
     MOUSE UP
     ========================= */
  const handleMouseUp = () => {
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);

    // CLICK → SELECT
    if (!isDragging.current && !isEditing) {
      onSelect(idea.id);
    }

    isDragging.current = false;
  };

  /* =========================
     TEXT EDIT
     ========================= */
  const handleBlur = () => {
    setIsEditing(false);
    onUpdate({ ...idea, text });
  };

  return (
    <div
      className="absolute"
      style={{
        left: idea.x,
        top: idea.y,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        cursor: isDragging.current ? "grabbing" : "grab",
        zIndex: 10,
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        className="relative rounded-lg shadow-lg px-3 py-2 h-full"
        style={{
          background: isDark
            ? "linear-gradient(135deg,#0a0a0a,#1a1a1a)"
            : "linear-gradient(135deg,#f8f9fa,#e9ecef)",
          border: isSelected
            ? `2px solid ${isDark ? "#ff0000" : "#2563eb"}`
            : "1px solid rgba(0,0,0,0.25)",
          boxShadow: isSelected
            ? `0 0 14px ${
                isDark
                  ? "rgba(255,0,0,0.45)"
                  : "rgba(37,99,235,0.45)"
              }`
            : "0 4px 6px rgba(0,0,0,0.25)",
        }}
      >
        {isEditing ? (
          <input
            value={text}
            autoFocus
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            className="w-full bg-transparent outline-none text-sm font-semibold"
            style={{ color: isDark ? "#ff4d4d" : "#1e3a8a" }}
          />
        ) : (
          <div
            onDoubleClick={() => setIsEditing(true)}
            className="text-sm font-semibold select-none"
            style={{ color: isDark ? "#ff4d4d" : "#1e3a8a" }}
          >
            {text}
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-1 right-1 text-xs"
          style={{
            background: "transparent",
            border: "none",
            color: isDark ? "#ff4d4d" : "#333",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default IdeaNode;
