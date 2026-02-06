import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const IdeaNode = ({ idea, isSelected, onUpdate, onDelete }) => {
  const { isDark } = useTheme();
  // Auto-enter edit mode if specifically requested (for new ideas)
  const [isEditing, setIsEditing] = useState(idea.autoEdit || false);
  const [text, setText] = useState(idea?.text || '');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  if (!idea) return null;

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onUpdate({ ...idea, text });
  };

  const handleMouseDown = (e) => {
    if (isEditing) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - idea.x,
      y: e.clientY - idea.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    // Use window dimensions as fallback, or large values to allow free movement
    // ideally this should come from props, but for now we unblock the 500px limit
    const boardWidth = window.innerWidth;
    const boardHeight = window.innerHeight;
    const ideaWidth = 180;
    const ideaHeight = 50;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // Constrain position largely but allow more freedom
    const constrainedX = Math.max(0, newX);
    const constrainedY = Math.max(0, newY);

    onUpdate({ ...idea, x: constrainedX, y: constrainedY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Theme-aware colors with darker text
  const accentColor = isDark ? '#ff0000' : '#1e3a8a';
  const textColor = isDark ? '#cc0000' : '#1e3a8a'; // Darker red for Sith, dark blue for Jedi
  const bgGradient = isDark
    ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
    : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'; // Lighter background for Jedi
  const shadowColor = isDark ? 'rgba(255, 0, 0, 0.3)' : 'rgba(30, 58, 138, 0.2)';
  const inputTextColor = isDark ? '#cc0000' : '#1e3a8a'; // Darker text colors
  const textShadow = 'none'; // Remove text shadow for better readability

  return (
    <div
      className="absolute cursor-move"
      style={{
        left: idea.x,
        top: idea.y,
        zIndex: 10,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="rounded-lg shadow-lg transition-all duration-300"
        style={{
          width: '180px',
          padding: '12px',
          background: bgGradient,
          border: isSelected
            ? `2px solid ${accentColor}`
            : `1px solid ${isDark ? 'rgba(255, 0, 0, 0.4)' : 'rgba(255, 200, 0, 0.4)'}`,
          boxShadow: isSelected
            ? `0 0 20px ${shadowColor}`
            : '0 4px 6px rgba(0, 0, 0, 0.3)',
        }}
      >
        {isEditing ? (
          <input
            type="text"
            value={text}
            onChange={handleTextChange}
            onBlur={handleBlur}
            autoFocus
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: inputTextColor,
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: '14px',
              fontWeight: '600',
              textShadow: textShadow,
            }}
          />
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            style={{
              color: textColor,
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: '14px',
              fontWeight: '600',
              textShadow: textShadow,
              cursor: 'text',
              wordWrap: 'break-word',
            }}
          >
            {text}
          </div>
        )}

        <button
          onClick={onDelete}
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            background: isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)',
            border: `1px solid ${isDark ? 'rgba(255, 0, 0, 0.4)' : 'rgba(255, 200, 0, 0.4)'}`,
            borderRadius: '4px',
            color: textColor,
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = accentColor;
            e.target.style.color = isDark ? '#000' : '#333';
            e.target.style.boxShadow = `0 0 10px ${isDark ? 'rgba(255, 0, 0, 0.8)' : 'rgba(255, 200, 0, 0.8)'}`;
          }}
          onMouseLeave={(e) => {
            e.target.style.background = isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)';
            e.target.style.color = textColor;
            e.target.style.boxShadow = 'none';
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default IdeaNode;