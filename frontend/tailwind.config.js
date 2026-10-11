/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        drr: {
          navy: '#0A192F',
          lightNavy: '#112240',
          blue: '#1E3A8A',
          cyan: '#06B6D4',
          orange: '#F97316',
          white: '#F8FAFC',
          gray: '#94A3B8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
