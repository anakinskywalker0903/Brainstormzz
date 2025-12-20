// src/components/Toolbar.js - TEMPORARY VERSION FOR TESTING ONLY
// This version uses your hardcoded key in useAI.js (no secrets)
// Paste this over your current Toolbar.js

import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAI } from '../hooks/useAI';

const Toolbar = ({ ideas, selectedIdeas, onIdeasChange, onSelectedIdeasChange }) => {
  const { generateIdeas, loading } = useAI();
  const [inputValue, setInputValue] = useState('');
  const [summary, setSummary] = useState('');
  const { isDark } = useTheme();

  const handleExpandIdeas = async () => {
    if (!inputValue.trim()) {
      alert('Please enter a topic or prompt first!');
      return;
    }

    try {
      console.log('Starting generation for topic:', inputValue);
      const mainHeadings = await generateIdeas(inputValue);

      if (!mainHeadings || mainHeadings.length === 0) {
        console.log('No headings returned');
        alert('No ideas generated. Check console (F12) for errors.');
        return;
      }

      console.log('Success! Generated headings:', mainHeadings);

      const newIdeas = mainHeadings.map((heading, index) => ({
        id: Date.now() + index,
        text: heading.title || 'Idea ' + (index + 1),
        x: 150 + (index % 4) * 220,
        y: 120 + Math.floor(index / 4) * 180,
        connections: [],
        subIdeas: Array.isArray(heading.subIdeas) ? heading.subIdeas : [],
      }));

      onIdeasChange([...ideas, ...newIdeas]);
      onSelectedIdeasChange([]);
      setInputValue('');
    } catch (err) {
      console.error('Generation failed:', err);
      alert('Error: ' + err.message);
    }
  };

  const handleClearBoard = () => {
    onIdeasChange([]);
    onSelectedIdeasChange([]);
    setSummary('');
    setInputValue('');
  };

  // Other buttons as placeholders
  const handleRefine = () => alert('Refine coming soon!');
  const handleSummarize = () => alert('Summarize coming soon!');
  const handleTranslate = () => alert('Translate coming soon!');

  return (
    <div
      className="rounded-lg shadow-sm border p-4 transition-all duration-300"
      style={{
        backgroundColor: isDark ? '#000000' : '#ffffff',
        borderColor: isDark ? '#333' : '#e5e7eb',
        color: isDark ? '#fff' : '#1e3a8a'
      }}
    >
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-64">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter your topic or prompt..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-300"
            style={{
              borderColor: isDark ? '#333' : '#d1d5db',
              backgroundColor: isDark ? '#0f0f0f' : '#ffffff',
              color: isDark ? '#fff' : '#1e3a8a',
              fontSize: isDark ? '16px' : '14px'
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleExpandIdeas()}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleExpandIdeas}
            disabled={loading || !inputValue.trim()}
            className="px-4 py-2 text-white rounded-lg hover:opacity-90 focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: isDark ? '#dc2626' : '#f59e0b',
              fontSize: isDark ? '15px' : '14px'
            }}
          >
            {loading ? '⏳ Generating...' : '🧠 Expand Ideas'}
          </button>

          <button
            onClick={handleRefine}
            disabled={loading || selectedIdeas.length === 0}
            className="px-4 py-2 text-white rounded-lg hover:opacity-90 focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: isDark ? '#7c3aed' : '#ec4899',
              fontSize: isDark ? '15px' : '14px'
            }}
          >
            ✨ Refine
          </button>

          <button
            onClick={handleSummarize}
            disabled={loading || ideas.length === 0}
            className="px-4 py-2 text-white rounded-lg hover:opacity-90 focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: isDark ? '#059669' : '#10b981',
              fontSize: isDark ? '15px' : '14px'
            }}
          >
            📝 Summarize
          </button>

          <button
            onClick={handleTranslate}
            disabled={loading || ideas.length === 0}
            className="px-4 py-2 text-white rounded-lg hover:opacity-90 focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: isDark ? '#d97706' : '#f97316',
              fontSize: isDark ? '15px' : '14px'
            }}
          >
            🌍 Translate
          </button>

          <button
            onClick={handleClearBoard}
            className="px-4 py-2 text-white rounded-lg hover:opacity-90 focus:ring-2 focus:ring-offset-2 transition-all"
            style={{
              backgroundColor: isDark ? '#4b5563' : '#6b7280',
              fontSize: isDark ? '15px' : '14px'
            }}
          >
            🗑️ Clear Board
          </button>
        </div>
      </div>

      {summary && (
        <div className="mt-3 p-4 border rounded-lg transition-all duration-300" style={{ backgroundColor: isDark ? '#064e3b' : '#dcfce7' }}>
          <h4 className="font-medium mb-2">Summary</h4>
          <pre className="text-sm whitespace-pre-wrap">{summary}</pre>
        </div>
      )}

      <div className="mt-3 flex justify-between items-center text-sm">
        <div>
          {ideas.length} ideas • {selectedIdeas.length} selected
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: loading ? '#ffcc00' : '#10b981' }}></div>
          <span>{loading ? 'Generating...' : 'AI Ready'}</span>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;