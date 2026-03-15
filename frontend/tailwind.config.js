/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        mhw: {
          dark:   'rgb(var(--mhw-dark) / <alpha-value>)',
          panel:  'rgb(var(--mhw-panel) / <alpha-value>)',
          card:   'rgb(var(--mhw-card) / <alpha-value>)',
          accent: '#e94560',
          gold:   '#f5a623',
          green:  '#4ade80',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

