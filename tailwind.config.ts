import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        rodem: {
          bg: '#eae6df',
          card: '#faf7f1',
          dark: '#44403c',
          'dark-deep': '#3a3632',
          gold: '#c9a227',
          'gold-light': '#f8f1d8',
          text: '#2c2825',
          'text-sub': '#8a8278',
          'text-light': '#a8a196',
          border: '#e8e3da',
          'border-light': '#f0ece4',
          green: '#5a9a6e',
          'green-light': '#eaf5ee',
          blue: '#4a7fd4',
          'blue-light': '#eaf0fa',
          orange: '#d49a4a',
          'orange-light': '#fcf2e4',
          purple: '#7c5fbf',
          'purple-light': '#f0ebfa',
          red: '#c45050',
          'red-light': '#fce8e8',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Noto Sans KR', 'sans-serif'],
      },
      borderRadius: {
        rodem: '22px',
        'rodem-sm': '14px',
      },
    },
  },
  plugins: [],
}
export default config
