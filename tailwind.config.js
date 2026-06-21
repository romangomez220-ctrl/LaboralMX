/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0B2545',
          light: '#123a66',
          dark: '#081a32',
        },
        success: {
          DEFAULT: '#15803d',
          light: '#ecfdf5',
        },
        warning: {
          DEFAULT: '#92400e',
          light: '#fffbeb',
        },
      },
    },
  },
  plugins: [],
}
