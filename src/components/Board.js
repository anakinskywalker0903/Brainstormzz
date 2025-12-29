import React, { useRef, useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext.js";
import IdeaNode from "./IdeaNode.js";

const NODE_WIDTH = 180;
const NODE_HEIGHT = 60;

const Board = ({
  ideas,
  selectedIdeas,
  onIdeasChange,
  onSelectedIdeasChange,
}) => {
  const boardRef = useRef(null);
  const canvasRef = useRef(null);
  const { isDark } = useTheme();

  // Selection box
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionRect, setSelectionRect] = useState(null);

  /* =========================
     DRAW CONNECTIONS
     ========================= */
  useEffect(() => {
    const canvas = canvasRef.current;
    const board = boardRef.current;
    if (!canvas || !board) return;

    canvas.width = board.clientWidth;
    canvas.height = board.clientHeight;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ideas.forEach((idea) => {
      idea.connections?.forEach((id) => {
        const target = ideas.find((i) => i.id === id);
        if (!target) return;

        ctx.beginPath();
        ctx.moveTo(
          idea.x + NODE_WIDTH / 2,
          idea.y + NODE_HEIGHT / 2
        );
        ctx.lineTo(
          target.x + NODE_WIDTH / 2,
          target.y + NODE_HEIGHT / 2
        );
        ctx.strokeStyle = isDark ? "#ff0000" : "#2563eb";
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    });
  }, [ideas, isDark]);

  /* =========================
     SELECTION START
     ========================= */
  const handleMouseDown = (e) => {
    if (e.target !== boardRef.current) return;

    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsSelecting(true);
    setSelectionStart({ x, y });
    setSelectionRect({ x, y, w: 0, h: 0 });
  };

  /* =========================
     UPDATE SELECTION BOX
     ========================= */
  const handleMouseMove = (e) => {
    if (!isSelecting || !selectionStart) return;

    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setSelectionRect({
      x: Math.min(x, selectionStart.x),
      y: Math.min(y, selectionStart.y),
      w: Math.abs(x - selectionStart.x),
      h: Math.abs(y - selectionStart.y),
    });
  };

  /* =========================
     APPLY SELECTION
     ========================= */
  const handleMouseUp = () => {
    if (!isSelecting || !selectionRect) return;

    const selected = ideas
      .filter((idea) => {
        const ix1 = idea.x;
        const iy1 = idea.y;
        const ix2 = idea.x + NODE_WIDTH;
        const iy2 = idea.y + NODE_HEIGHT;

        const sx1 = selectionRect.x;
        const sy1 = selectionRect.y;
        const sx2 = selectionRect.x + selectionRect.w;
        const sy2 = selectionRect.y + selectionRect.h;

        return ix1 < sx2 && ix2 > sx1 && iy1 < sy2 && iy2 > sy1;
      })
      .map((i) => i.id);

    onSelectedIdeasChange(selected);

    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionRect(null);
  };

  /* =========================
     ADD NODE (EMPTY CLICK)
     ========================= */
  const handleClick = (e) => {
    if (isSelecting) return;
    if (e.target !== boardRef.current) return;

    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const maxX = boardRef.current.clientWidth - NODE_WIDTH;
    const maxY = boardRef.current.clientHeight - NODE_HEIGHT;

    onIdeasChange([
      ...ideas,
      {
        id: Date.now(),
        text: "New idea",
        x: Math.min(Math.max(20, x), maxX),
        y: Math.min(Math.max(20, y), maxY),
        connections: [],
      },
    ]);
  };

  /* =========================
     SINGLE NODE SELECT
     ========================= */
  const handleSelectNode = (id) => {
    onSelectedIdeasChange(
      selectedIdeas.includes(id)
        ? selectedIdeas.filter((i) => i !== id)
        : [...selectedIdeas, id]
    );
  };

  return (
    <div className="relative w-full">
      <div
        ref={boardRef}
        data-board
        className="relative rounded-lg overflow-hidden"
        style={{
          height: "70vh",
          background: isDark ? "#000" : "#fff",
          border: `2px solid ${
            isDark
              ? "rgba(255,0,0,0.25)"
              : "rgba(30,58,138,0.3)"
          }`,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
      >
        {/* CONNECTIONS */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
        />

        {/* SELECTION BOX */}
        {selectionRect && (
          <div
            style={{
              position: "absolute",
              left: selectionRect.x,
              top: selectionRect.y,
              width: selectionRect.w,
              height: selectionRect.h,
              background: isDark
                ? "rgba(255,0,0,0.15)"
                : "rgba(59,130,246,0.15)",
              border: `1px dashed ${
                isDark ? "#ff0000" : "#2563eb"
              }`,
              zIndex: 5,
              pointerEvents: "none",
            }}
          />
        )}

        {/* IDEAS */}
        {ideas.map((idea) => (
          <IdeaNode
            key={idea.id}
            idea={idea}
            isSelected={selectedIdeas.includes(idea.id)}
            onSelect={handleSelectNode}
            onUpdate={(updated) =>
              onIdeasChange(
                ideas.map((i) =>
                  i.id === idea.id ? updated : i
                )
              )
            }
            onDelete={() => {
              onIdeasChange(ideas.filter((i) => i.id !== idea.id));
              onSelectedIdeasChange(
                selectedIdeas.filter((id) => id !== idea.id)
              );
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Board;
