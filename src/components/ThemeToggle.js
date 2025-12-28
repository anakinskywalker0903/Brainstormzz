import React from 'react';
import { useTheme } from '../context/ThemeContext.js';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="px-4 py-2 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
      style={{
        backgroundColor: isDark ? '#dc2626' : '#fbbf24',
        color: isDark ? '#ffffff' : '#000000',
        boxShadow: isDark
          ? '0 4px 14px 0 rgba(220, 38, 38, 0.3)'
          : '0 4px 14px 0 rgba(251, 191, 36, 0.3)',
      }}
      aria-label="Toggle theme"
    >
      {isDark ? 'Sith Mode' : 'Jedi Mode'}
    </button>
  );
};

export default ThemeToggle;
