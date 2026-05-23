import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Quiz / Sales Page (dark theme)
        night: {
          900: '#0F1B2D',
          800: '#162436',
          700: '#1C2E42',
          600: '#23384E',
        },
        accent: {
          DEFAULT: '#D4A853',
          hover: '#E5BC6A',
          light: '#F0D48A',
        },
        // PWA (light theme)
        pwa: {
          bg: '#F8F6F2',
          card: '#FFFFFF',
          accent: '#1E3A5F',
          highlight: '#9B8EC4',
          text: '#1F2937',
          'text-secondary': '#6B7280',
          success: '#10B981',
          border: '#E5E7EB',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
