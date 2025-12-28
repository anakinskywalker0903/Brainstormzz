/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  // IMPORTANT: Use 'class' strategy for manual theme switching
  darkMode: 'class',

  theme: {
    extend: {
      colors: {
        // Light mode colors
        'light-bg': '#ffffff',
        'light-text': '#1e3a8a',

        // Dark mode colors
        'dark-bg': '#0f172a',
        'dark-text': '#f1f5f9',
      },
    },
  },

  plugins: [],
};
