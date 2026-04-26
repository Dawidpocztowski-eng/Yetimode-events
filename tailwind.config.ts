import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#e8f4ff',
          100: '#d1e9ff',
          200: '#a3d3ff',
          300: '#75bdff',
          400: '#22D3EE',
          500: '#146EF5',
          600: '#0f5fd4',
          700: '#0a4fb3',
          800: '#063f92',
          900: '#022f71',
        },
        dark: {
          900: '#0B0F19',
          800: '#101828',
          700: '#1a2535',
          600: '#22304a',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
