/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind SDK 57 must use class mode when the app controls its theme.
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#FF6B6B',
          dark: '#E85A5A',
          light: '#FF8E53',
        },
      },
    },
  },
  plugins: [],
};
