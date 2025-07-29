/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,html}",
    "./src/index.js",
    "./tailwind-classes.html"
  ],
  safelist: [
    // AuthModal purple theme classes
    'text-purple-400',
    'text-purple-300',
    'bg-purple-500/20',
    'bg-purple-600/80',
    'border-purple-500/40',
    'border-purple-400',
    'hover:text-white',
    'hover:bg-purple-600/80',
    'hover:border-purple-400',
    'decoration-purple-400/70',
    'hover:decoration-purple-300'
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
      }
    },
  },
  plugins: [],
}

