/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Zara-inspired monochromatic palette
        zara: {
          black: '#000000',
          charcoal: '#1a1a1a',
          darkgray: '#2d2d2d',
          gray: '#666666',
          lightgray: '#a3a3a3',
          silver: '#d4d4d4',
          lightsilver: '#e5e5e5',
          offwhite: '#f8f8f8',
          white: '#ffffff'
        }
      },
      fontFamily: {
        // Zara-style typography
        'serif': ['Georgia', 'Times New Roman', 'serif'],
        'sans': ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif']
      },
      letterSpacing: {
        'zara': '0.025em'
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem'
      }
    },
  },
  plugins: [],
}
