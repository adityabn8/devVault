/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        primary: '#2563EB',
        'primary-hover': '#1D4ED8',
        success: '#16A34A',
        warning: '#D97706',
        error: '#DC2626',
      },
    },
  },
  plugins: [],
};
