/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
  },
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#2F2E68",
          "secondary": "#202238",
          "accent": "#AAA6C7",
          "neutral": "#D9D9D9",
          "base-100": "#191A2E",
          "info": "#2563eb",
          "success": "#00d169",
          "warning": "#fcd34d",
          "error": "#ef4444",
        },
      },
    ],
  },
  plugins: [require('daisyui')],
}

