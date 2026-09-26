/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          DEFAULT: '#2563eb',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#0f172a',
          dark: '#1d4ed8',
        },
        slate: {
          850: '#151f32',
          900: '#0f172a',
          950: '#080d1a',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 25px -5px rgba(37, 99, 235, 0.35)',
        'pass': '0 20px 40px -15px rgba(15, 23, 42, 0.15)',
      },
    },
  },
  plugins: [],
};
