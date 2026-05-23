import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          DEFAULT: '#7A9B7E',
          soft: '#E8EFE9',
          dark: '#5B8A60',
        },
        cream: {
          DEFAULT: '#FAF7F2',
          warm: '#F4EFE6',
        },
        coral: {
          DEFAULT: '#E07856',
          soft: '#F5C7B6',
        },
        charcoal: '#2D3A2E',
        sand: '#D4C5A9',
        // Neutrales
        'gray-100': '#EFECE7',
        'gray-400': '#9B9890',
        'gray-600': '#5C5852',
        // Estados
        success: '#5B8A60',
        warning: '#D9A441',
        error: '#C25450',
      },
      fontFamily: {
        serif: ['Fraunces', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        '6xl': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        '5xl': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        '4xl': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        '3xl': ['1.875rem', { lineHeight: '1.2' }],
        '2xl': ['1.5rem', { lineHeight: '1.3' }],
        xl: ['1.25rem', { lineHeight: '1.4' }],
        lg: ['1.125rem', { lineHeight: '1.5' }],
        base: ['1rem', { lineHeight: '1.6' }],
        sm: ['0.875rem', { lineHeight: '1.5' }],
        xs: ['0.75rem', { lineHeight: '1.4' }],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        full: '999px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(45, 58, 46, 0.04)',
        md: '0 4px 12px rgba(45, 58, 46, 0.08)',
        lg: '0 8px 24px rgba(45, 58, 46, 0.12)',
        xl: '0 20px 40px rgba(45, 58, 46, 0.16)',
      },
      spacing: {
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '6': '1.5rem',
        '8': '2rem',
        '12': '3rem',
        '16': '4rem',
        '24': '6rem',
      },
      animation: {
        'fade-in': 'fadeIn 400ms ease-out forwards',
        'slide-up': 'slideUp 400ms ease-out forwards',
        'scale-in': 'scaleIn 300ms ease-out forwards',
        'slide-in-right': 'slideInRight 350ms ease-out forwards',
        'slide-out-left': 'slideOutLeft 350ms ease-out forwards',
        'progress-fill': 'progressFill 4s linear forwards',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(40px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideOutLeft: {
          from: { opacity: '1', transform: 'translateX(0)' },
          to: { opacity: '0', transform: 'translateX(-40px)' },
        },
        progressFill: {
          from: { width: '0%' },
          to: { width: '100%' },
        },
      },
      maxWidth: {
        quiz: '640px',
        content: '720px',
        wide: '1200px',
      },
    },
  },
  plugins: [],
} satisfies Config;
