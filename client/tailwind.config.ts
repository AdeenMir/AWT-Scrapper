import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Light mode colors
        background: '#faf8f5',
        surface: '#f5f1ed',
        'surface-hover': '#ede8e1',
        primary: '#c9956d',
        'primary-hover': '#d4a574',
        'primary-active': '#b8876a',
        secondary: '#d4c4b4',
        accent: '#d4a574',
        'text-primary': '#3e3b37',
        'text-secondary': '#6b6863',
      },
      boxShadow: {
        soft: '0 14px 45px rgba(62, 59, 55, 0.08)',
        softDark: '0 16px 55px rgba(0, 0, 0, 0.24)',
        glow: '0 0 20px rgba(201, 149, 113, 0.3)',
        'glow-dark': '0 0 20px rgba(212, 165, 116, 0.3)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
    },
  },
} satisfies Config;
