/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#E65100',
          orangeHover: '#BF360C',
          orangeLight: '#FFF3E0',
          blue: '#1976D2',
          blueHover: '#1565C0',
          blueLight: '#E3F2FD',
          slate: '#2D3748',
          bg: '#F5F5F7'
        }
      }
    },
  },
  plugins: [],
}
