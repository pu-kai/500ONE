/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'ball-red': '#dc2626',
        'ball-blue': '#2563eb',
      }
    },
  },
  plugins: [],
}
