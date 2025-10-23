import { defineConfig } from 'tailwindcss'

export default defineConfig({
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'medical-blue': '#2563eb',
        'medical-green': '#059669',
        'medical-gray': '#6b7280',
      },
      fontFamily: {
        'arabic': ['IBM Plex Sans Arabic', 'system-ui', 'sans-serif'],
      }
    },
  },
})
