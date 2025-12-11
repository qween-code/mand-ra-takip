/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          800: '#1e293b',
          900: '#0f172a',
        },
        indigo: {
          600: '#4f46e5',
          700: '#4338ca',
        },
        orange: {
          500: '#f97316',
        },
        emerald: {
          500: '#10b981',
        },
      },
    },
  },
  plugins: [],
}
