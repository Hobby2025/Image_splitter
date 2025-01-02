/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.{html,js}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'ridi': ['RIDIBatang', 'serif'],
      },
      colors: {
        primary: {
          50: '#F2ECE9',
          100: '#E8E1DD',
          200: '#D1C7C2',
          300: '#BFBCBA',
          400: '#737272',
          500: '#403F3D',
          600: '#363534',
          700: '#2B2A29',
          800: '#1F1F1E',
          900: '#0D0D0D',
          dark: {
            50: '#2B2A29',
            100: '#242322',
            200: '#1F1F1E',
            300: '#1A1A19',
            400: '#151514',
            500: '#0D0D0D',
            600: '#0A0A0A',
            700: '#080808',
            800: '#050505',
            900: '#020202'
          }
        },
        secondary: {
          50: '#F2ECE9',
          100: '#E8E1DD',
          200: '#D1C7C2',
          300: '#BFBCBA',
          400: '#737272',
          500: '#403F3D',
          600: '#363534',
          700: '#2B2A29',
          800: '#1F1F1E',
          900: '#0D0D0D',
          dark: {
            50: '#BFBCBA',
            100: '#A6A3A1',
            200: '#8D8A88',
            300: '#737272',
            400: '#5A5958',
            500: '#403F3D',
            600: '#363534',
            700: '#2B2A29',
            800: '#1F1F1E',
            900: '#0D0D0D'
          }
        },
      },
    },
  },
  plugins: [],
}

