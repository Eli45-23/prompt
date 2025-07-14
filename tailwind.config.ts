
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
        'dark-end': '#302b63',
        'neon-green': '#00ff87',
        'neon-blue': '#00d4ff',
        'neon-purple': '#b347d9',
        'neon-pink': '#ff1b6b',
        'cyber-dark': '#0a0a0a',
        'cyber-gray': '#1a1a1a',
      },
      backgroundImage: {
        'dark-gradient': 'linear-gradient(135deg, #0f0c29 0%, #24243e 50%, #302b63 100%)',
        'neon-gradient': 'linear-gradient(45deg, #00ff87, #00d4ff)',
        'cyber-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'aurora': 'linear-gradient(135deg, #00ff87 0%, #00d4ff 25%, #b347d9 50%, #ff1b6b 75%, #00ff87 100%)',
        'mesh': `
          radial-gradient(at 40% 20%, hsla(28,100%,74%,1) 0px, transparent 50%),
          radial-gradient(at 80% 0%, hsla(189,100%,56%,1) 0px, transparent 50%),
          radial-gradient(at 0% 50%, hsla(355,100%,93%,1) 0px, transparent 50%),
          radial-gradient(at 80% 50%, hsla(340,100%,76%,1) 0px, transparent 50%),
          radial-gradient(at 0% 100%, hsla(22,100%,77%,1) 0px, transparent 50%),
          radial-gradient(at 80% 100%, hsla(242,100%,70%,1) 0px, transparent 50%),
          radial-gradient(at 0% 0%, hsla(343,100%,76%,1) 0px, transparent 50%)
        `,
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-neon': 'pulse-neon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-y': 'gradient-y 15s ease infinite',
        'gradient-xy': 'gradient-xy 15s ease infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px #00ff87' },
          '100%': { boxShadow: '0 0 30px #00d4ff, 0 0 40px #00d4ff' },
        },
        'pulse-neon': {
          '0%, 100%': { 
            opacity: '1',
            boxShadow: '0 0 20px #00ff87, 0 0 40px #00ff87, 0 0 60px #00ff87'
          },
          '50%': { 
            opacity: '0.8',
            boxShadow: '0 0 10px #00ff87, 0 0 20px #00ff87, 0 0 30px #00ff87'
          },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'gradient-x': {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left center' },
          '50%': { 'background-size': '200% 200%', 'background-position': 'right center' },
        },
        'gradient-y': {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'center top' },
          '50%': { 'background-size': '200% 200%', 'background-position': 'center bottom' },
        },
        'gradient-xy': {
          '0%, 100%': { 'background-size': '400% 400%', 'background-position': 'left center' },
          '25%': { 'background-size': '400% 400%', 'background-position': 'center top' },
          '50%': { 'background-size': '400% 400%', 'background-position': 'right center' },
          '75%': { 'background-size': '400% 400%', 'background-position': 'center bottom' },
        },
      },
      fontFamily: {
        'cyber': ['Orbitron', 'monospace'],
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
    },
  },
  plugins: [],
};
export default config;
