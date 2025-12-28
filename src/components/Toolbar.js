import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext.js';
import useAI from '../hooks/useAI.js';

const Toolbar = ({ ideas, selectedIdeas, onIdeasChange, onSelectedIdeasChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [summary, setSummary] = useState('');
  const { isDark } = useTheme();
  const { 
    isLoading, 
    error, 
    expandIdeas, 
    refineIdea, 
    summarizeIdeas, 
    translateIdea 
  } = useAI();

  const handleExpandIdeas = async () => {
    if (!inputValue.trim()) {
      alert('Please enter an idea or prompt first!');
      return;
    }

    try {
      const expandedIdeas = await expandIdeas(inputValue);
      
      const newIdeas = expandedIdeas.map((idea, index) => ({
        id: Date.now() + index,
        text: idea,
        x: 150 + (index % 3) * 180,
        y: 120 + Math.floor(index / 3) * 120,
        connections: []
      }));
      
      onIdeasChange(newIdeas);
      onSelectedIdeasChange([]);
      setInputValue('');
    } catch (err) {
      console.error('Failed to expand ideas:', err);
    }
  };

  const handleRefineIdeas = async () => {
    if (selectedIdeas.length === 0) {
      alert('Please select ideas to refine first!');
      return;
    }

    try {
      const selectedIdeaObjects = ideas.filter(idea => 
        selectedIdeas.includes(idea.id)
      );
      
      for (const idea of selectedIdeaObjects) {
        const refinedText = await refineIdea(idea.text);
        
        onIdeasChange(ideas.map(i => 
          i.id === idea.id ? { ...i, text: refinedText } : i
        ));
      }
      
      onSelectedIdeasChange([]);
    } catch (err) {
      console.error('Failed to refine ideas:', err);
    }
  };

  const handleSummarize = async () => {
    if (ideas.length === 0) {
      alert('No ideas to summarize!');
      return;
    }

    try {
      const summaryText = await summarizeIdeas(ideas);
      setSummary(summaryText);
    } catch (err) {
      console.error('Failed to summarize:', err);
    }
  };

  const handleClearBoard = () => {
    onIdeasChange([]);
    onSelectedIdeasChange([]);
    setSummary('');
    setInputValue('');
  };

  const handleTranslate = async () => {
    if (ideas.length === 0) {
      alert('No ideas to translate!');
      return;
    }

    try {
      const languages = ['spanish', 'french', 'hindi'];
      const randomLang = languages[Math.floor(Math.random() * languages.length)];
      
      const ideasToTranslate = ideas.slice(0, 3);
      
      for (const idea of ideasToTranslate) {
        const translation = await translateIdea(idea.text, randomLang);
        
        const translatedIdea = {
          id: Date.now() + Math.random(),
          text: `${idea.text} → ${translation}`,
          x: idea.x + 50,
          y: idea.y + 50,
          connections: [idea.id]
        };
        
        onIdeasChange([...ideas, translatedIdea]);
      }
    } catch (err) {
      console.error('Failed to translate:', err);
    }
  };

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
            placeholder="Enter your idea or prompt..."
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
            disabled={isLoading || !inputValue.trim()}
            className="px-4 py-2 text-white rounded-lg hover:opacity-90 focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: isDark ? '#dc2626' : '#f59e0b',
              fontSize: isDark ? '15px' : '14px'
            }}
          >
            {isLoading ? '⏳ Processing...' : '🧠 Expand Ideas'}
          </button>
          
          <button
            onClick={handleRefineIdeas}
            disabled={isLoading || selectedIdeas.length === 0}
            className="px-4 py-2 text-white rounded-lg hover:opacity-90 focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: isDark ? '#7c3aed' : '#ec4899',
              fontSize: isDark ? '15px' : '14px'
            }}
          >
            {isLoading ? '⏳ Processing...' : '✨ Refine'}
          </button>
          
          <button
            onClick={handleSummarize}
            disabled={isLoading || ideas.length === 0}
            className="px-4 py-2 text-white rounded-lg hover:opacity-90 focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: isDark ? '#059669' : '#10b981',
              fontSize: isDark ? '15px' : '14px'
            }}
          >
            {isLoading ? '⏳ Processing...' : '📝 Summarize'}
          </button>
          
          <button
            onClick={handleTranslate}
            disabled={isLoading || ideas.length === 0}
            className="px-4 py-2 text-white rounded-lg hover:opacity-90 focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: isDark ? '#d97706' : '#f97316',
              fontSize: isDark ? '15px' : '14px'
            }}
          >
            {isLoading ? '⏳ Processing...' : '🌍 Translate'}
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

      {error && (
        <div
          className="mt-3 p-3 border rounded-lg transition-all duration-300"
          style={{
            backgroundColor: isDark ? '#7f1d1d' : '#fee2e2',
            borderColor: isDark ? '#dc2626' : '#fca5a5',
            color: isDark ? '#fca5a5' : '#991b1b',
            fontSize: isDark ? '15px' : '14px'
          }}
        >
          <div className="flex items-center">
            <div className="mr-2">⚠️</div>
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {summary && (
        <div
          className="mt-3 p-4 border rounded-lg transition-all duration-300"
          style={{
            backgroundColor: isDark ? '#064e3b' : '#dcfce7',
            borderColor: isDark ? '#059669' : '#86efac',
            color: isDark ? '#86efac' : '#166534',
            fontSize: isDark ? '15px' : '14px'
          }}
        >
          <div className="flex items-start">
            <div className="mr-2 mt-1">📝</div>
            <div>
              <h4 className="font-medium mb-2">AI Summary</h4>
              <pre className="text-sm whitespace-pre-wrap">{summary}</pre>
            </div>
          </div>
        </div>
      )}

      <div
        className="mt-3 flex justify-between items-center text-sm transition-all duration-300"
        style={{
          color: isDark ? '#999' : '#1e3a8a',
          fontSize: isDark ? '15px' : '14px'
        }}
      >
        <div>
          {ideas.length} ideas • {selectedIdeas.length} selected
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: isLoading ? '#ffcc00' : isDark ? '#10b981' : '#059669'
            }}
          ></div>
          <span>{isLoading ? 'AI Processing...' : 'AI Ready'}</span>
        </div>
      </div>
    </div>
  );
};

export default Toolbar; 