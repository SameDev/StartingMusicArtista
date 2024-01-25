/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './vueform.config.ts',
    './node_modules/@vueform/vueform/themes/tailwind/**/*.vue',
    './node_modules/@vueform/vueform/themes/tailwind/**/*.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        'nunit': ['"Nunito Sans"', 'sans-serif'],
        'roboto': ['"Roboto"', 'arial-sans']
      },
    },
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
          "secondary-100": "#1c1e31"
        },
      },
    ],
  },
  plugins: [
    require('daisyui'),
    require('@vueform/vueform/tailwind')
  ],
  
}

