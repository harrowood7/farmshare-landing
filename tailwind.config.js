/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#006f35',
          orange: '#ff7b00',
          cream: '#f6f2ee',
          yellow: {
            light: '#ffff00',
            DEFAULT: '#ffab40'
          }
        }
      },
      fontFamily: {
        'roca': ['roca-two-heavy', 'sans-serif'],
        'sans': ['Poppins', 'sans-serif']
      }
    },
  },
  plugins: [],
};