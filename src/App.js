import React, { useState } from 'react';

// ✅ ADD .js EXTENSIONS
import { ThemeProvider, useTheme } from './context/ThemeContext.js';
import ThemeToggle from './components/ThemeToggle.js';
import Board from './components/Board.js';
import Toolbar from './components/Toolbar.js';

import './App.css';

function AppContent() {
  const { isDark } = useTheme();
  const [ideas, setIdeas] = useState([]);
  const [selectedIdeas, setSelectedIdeas] = useState([]);

  console.log('App rendering with isDark:', isDark);

  const bgColor = isDark ? '#000000' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#1e3a8a';
  const headerBg = isDark ? '#000000' : '#ffffff';
  const borderColor = isDark ? '#333333' : '#d1d5db';

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: bgColor,
        color: textColor,
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px',
          borderBottom: `1px solid ${borderColor}`,
          backgroundColor: headerBg,
        }}
      >
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: isDark ? '#ff0000' : '#1e3a8a',
            margin: 0,
          }}
        >
          Brainstormzz
        </h1>
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div
        style={{
          padding: '24px',
          minHeight: 'calc(100vh - 100px)',
        }}
      >
        <Toolbar
          ideas={ideas}
          selectedIdeas={selectedIdeas}
          onIdeasChange={setIdeas}
          onSelectedIdeasChange={setSelectedIdeas}
        />

        <div style={{ marginTop: '24px' }}>
          <Board
            ideas={ideas}
            selectedIdeas={selectedIdeas}
            onIdeasChange={setIdeas}
            onSelectedIdeasChange={setSelectedIdeas}
          />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
