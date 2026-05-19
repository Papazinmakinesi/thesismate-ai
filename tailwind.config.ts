import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7ff',
          100: '#d8eaff',
          200: '#b7d6ff',
          300: '#8bb7ff',
          400: '#5d8eff',
          500: '#416bff',
          600: '#324edd',
          700: '#2d3ea8',
          800: '#29357f',
          900: '#232f68'
        }
      }
    }
  },
  plugins: []
};

export default config;
