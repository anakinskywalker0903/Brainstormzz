import React, { useRef, useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import IdeaNode from './IdeaNode';

const Board = ({ ideas, selectedIdeas, onIdeasChange, onSelectedIdeasChange }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Validate: Use VERY large boundaries to prevent annoying snapping
    const boardWidth = Math.max(canvas.offsetWidth, 3000);
    const boardHeight = Math.max(canvas.offsetHeight, 3000);
    const ideaWidth = 180;
    const ideaHeight = 50;
    const margin = 0; // ZERO tolerance

    let needsUpdate = false;
    const fixedIdeas = ideas.map(idea => {
      const constrainedX = Math.max(0, Math.min(idea.x, boardWidth - ideaWidth));
      const constrainedY = Math.max(0, Math.min(idea.y, boardHeight - ideaHeight));

      if (idea.x !== constrainedX || idea.y !== constrainedY) {
        needsUpdate = true;
        return { ...idea, x: constrainedX, y: constrainedY };
      }
      return idea;
    });

    if (needsUpdate) {
      onIdeasChange(fixedIdeas);
    }

    // Draw connections
    ideas.forEach(idea => {
      idea.connections.forEach(connectedId => {
        const connectedIdea = ideas.find(i => i.id === connectedId);
        if (connectedIdea) {
          drawConnection(ctx, idea, connectedIdea, isDark);
        }
      });
    });
  }, [ideas, isDark, onIdeasChange]);

  const drawConnection = (ctx, idea1, idea2, isDark) => {
    ctx.beginPath();
    ctx.moveTo(idea1.x + 50, idea1.y + 25); // Center of first node
    ctx.lineTo(idea2.x + 50, idea2.y + 25); // Center of second node

    // Red lines for dark mode, gold for light mode
    ctx.strokeStyle = isDark ? '#ff0000' : '#ffcc00';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = isDark
      ? 'rgba(255, 0, 0, 0.5)'
      : 'rgba(255, 200, 0, 0.5)';
    ctx.stroke();
  };

  // Handle double click - removed to prevent conflict with single click creation
  // logic moved to single click handleCanvasClick

  // Handle double click to create new idea
  const handleCanvasDoubleClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if double click is on an existing idea (ignore if so)
    const clickedIdea = ideas.find(idea =>
      x >= idea.x && x <= idea.x + 180 &&
      y >= idea.y && y <= idea.y + 50
    );

    if (!clickedIdea) {
      // Add new idea on double click
      const boardWidth = Math.max(canvasRef.current ? canvasRef.current.offsetWidth : 1000, 3000);
      const boardHeight = Math.max(canvasRef.current ? canvasRef.current.offsetHeight : 800, 3000);
      const ideaWidth = 180;
      const ideaHeight = 50;

      const constrainedX = Math.max(0, Math.min(x - ideaWidth / 2, boardWidth - ideaWidth));
      const constrainedY = Math.max(0, Math.min(y - ideaHeight / 2, boardHeight - ideaHeight));

      const newIdea = {
        id: Date.now(),
        text: '',
        x: constrainedX,
        y: constrainedY,
        connections: [],
        autoEdit: true,
      };

      onSelectedIdeasChange([]);
      onIdeasChange([...ideas, newIdea]);
    }
  };

  // Handle single click for selection/deselection
  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click is on an existing idea
    const clickedIdea = ideas.find(idea =>
      x >= idea.x && x <= idea.x + 180 &&
      y >= idea.y && y <= idea.y + 50
    );

    if (clickedIdea) {
      // Toggle selection
      const newSelected = selectedIdeas.includes(clickedIdea.id)
        ? selectedIdeas.filter(id => id !== clickedIdea.id)
        : [...selectedIdeas, clickedIdea.id];
      onSelectedIdeasChange(newSelected);
    } else {
      // Deselect all if clicking background
      onSelectedIdeasChange([]);
    }
  };

  return (
    <div className="relative">
      {/* Ideas container - Original design with boundary fixes */}
      <div
        className="relative rounded-lg shadow-xl min-h-96 transition-all duration-300"
        style={{
          height: '500px',
          background: isDark
            ? '#000000'
            : '#ffffff',
          border: `2px solid ${isDark ? 'rgba(255, 0, 0, 0.25)' : 'rgba(30, 58, 138, 0.3)'}`,
          boxShadow: 'none',
          color: isDark ? '#ff0000' : '#1e3a8a',
          fontSize: isDark ? '16px' : '14px',
          overflow: 'hidden'
        }}
        onClick={handleCanvasClick}
        onDoubleClick={handleCanvasDoubleClick}
      >
        {/* Canvas for connections */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
        />
        {/* Grid background - Theme aware */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(to right, ${isDark ? '#ff0000' : '#1e3a8a'} 1px, transparent 1px),
              linear-gradient(to bottom, ${isDark ? '#ff0000' : '#1e3a8a'} 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />

        {/* Idea nodes */}
        {ideas.map(idea => (
          <IdeaNode
            key={idea.id}
            idea={idea}
            isSelected={selectedIdeas.includes(idea.id)}
            onToggleSelect={(e) => {
              // Safe selection toggle that stops propagation
              const newSelected = selectedIdeas.includes(idea.id)
                ? selectedIdeas.filter(id => id !== idea.id)
                : [...selectedIdeas, idea.id];
              onSelectedIdeasChange(newSelected);
            }}
            onUpdate={(updatedIdea) => {
              onIdeasChange(ideas.map(i =>
                i.id === idea.id ? updatedIdea : i
              ));
            }}
            onDelete={() => {
              onIdeasChange(ideas.filter(i => i.id !== idea.id));
              onSelectedIdeasChange(selectedIdeas.filter(id => id !== idea.id));
            }}
          />
        ))}

        {/* Empty state - Theme aware */}
        {ideas.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center" style={{
              fontFamily: 'Rajdhani, sans-serif',
              textShadow: 'none',
              color: isDark ? '#cc0000' : '#1e3a8a'
            }}>
              <div className="text-4xl mb-2">💡</div>
              <p className="text-lg font-medium mb-2" style={{
                color: isDark ? '#cc0000' : '#1e3a8a',
                fontWeight: '700',
                fontSize: '1.25rem'
              }}>Welcome to Brainstormzz!</p>
              <p className="text-sm" style={{
                color: isDark ? '#cc0000' : '#1e3a8a',
                fontSize: '0.95rem'
              }}>Enter a topic above and click "Expand Ideas" to get started</p>
              <p className="text-xs mt-2" style={{
                color: isDark ? 'rgba(204, 0, 0, 0.8)' : 'rgba(30, 58, 138, 0.8)',
                fontSize: '0.85rem'
              }}>Or click anywhere to add individual ideas</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Board;