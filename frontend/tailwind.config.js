/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
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
        // Modern typography
        'serif': ['Georgia', 'Times New Roman', 'serif'],
        'sans': ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'display': ['Poppins', 'Inter', 'sans-serif'],
        'righteous': ['Righteous', 'Inter', 'sans-serif']
      },
      letterSpacing: {
        'zara': '0.025em'
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem'
      },
      keyframes: {
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)'
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)'
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)'
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)'
          }
        },
        gradient: {
          '0%': {
            backgroundPosition: '0% 50%'
          },
          '50%': {
            backgroundPosition: '100% 50%'
          },
          '100%': {
            backgroundPosition: '0% 50%'
          }
        }
      },
      animation: {
        blob: 'blob 7s infinite',
        gradient: 'gradient 15s ease infinite'
      },
      backgroundSize: {
        '200%': '200%'
      },
      transitionDelay: {
        '2000': '2000ms',
        '4000': '4000ms'
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
}
