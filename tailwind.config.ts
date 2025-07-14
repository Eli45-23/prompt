
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'dark-start': '#0f0c29',
        'dark-end':   '#302b63',
      },
      backgroundImage: {
        'dark-gradient': 'linear-gradient(to bottom right, #0f0c29, #302b63)',
        'neon-gradient': 'linear-gradient(to right, #34d399, #20c997)', // green-400 to teal-400
      },
    },
  },
  plugins: [],
};
export default config;
