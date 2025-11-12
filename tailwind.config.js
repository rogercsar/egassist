/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#111111',
          gold: '#B8860B', // DarkGoldenRod
        },
      },
    },
  },
  plugins: [],
}