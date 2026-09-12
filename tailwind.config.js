/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: '#00f5ff',
          pink: '#ff00ff',
          green: '#00ff88',
          yellow: '#ffff00',
        },
        dark: {
          900: '#050510',
          800: '#0a0a1a',
          700: '#111128',
          600: '#1a1a35',
        },
      },
      boxShadow: {
        neon: '0 0 20px #00f5ff, 0 0 40px #00f5ff33',
        'neon-pink': '0 0 20px #ff00ff, 0 0 40px #ff00ff33',
        'neon-green': '0 0 20px #00ff88, 0 0 40px #00ff8833',
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 4s linear infinite',
        float: 'float 3s ease-in-out infinite',
        flicker: 'flicker 1.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        flicker: {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': { opacity: '1' },
          '20%, 24%, 55%': { opacity: '0.4' },
        },
      },
      fontFamily: {
        mono: ['"Courier New"', 'Courier', 'monospace'],
        display: ['"Orbitron"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
