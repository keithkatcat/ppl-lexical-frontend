/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Light palette built around #abc3d7 and #cdd7dc
        mist: {
          50: '#f4f7f9', 100: '#e8eff4', 150: '#dbe5ec', 200: '#cdd7dc', 300: '#abc3d7',
          400: '#86a5bf', 500: '#5f86a8', 600: '#456b8c', 700: '#34536e', 800: '#243a4e', 900: '#17232f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        display: ['"Segoe UI"', '"Segoe UI Variable"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
