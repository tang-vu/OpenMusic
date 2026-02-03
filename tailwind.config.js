/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#6366f1',
          600: '#4f46e5'
        },
        surface: {
          700: '#313244',
          800: '#1e1e2e',
          900: '#11111b'
        },
      },
    },
  },
  plugins: [],
};
