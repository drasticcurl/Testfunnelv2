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
        // ─── Primarios ───────────────────────────────────────────────
        terracotta: {
          DEFAULT: '#C0553A',
          soft:    '#FFF5F0',
          dark:    '#8B3A24',
          light:   '#D4785C',
        },
        // ─── Fondos ──────────────────────────────────────────────────
        warm: {
          DEFAULT: '#FFFAF7',
          border:  '#F0E8E4',
        },
        // ─── Texto ───────────────────────────────────────────────────
        charcoal: '#1F2433',
        muted: {
          DEFAULT: '#5A6072',
          light:   '#9BA3B8',
        },
        // ─── Estados ─────────────────────────────────────────────────
        alert:   '#E53935',
        success: '#43A047',
        warning: '#F59E0B',
        // ─── Legado (mantener para no romper componentes V1) ─────────
        sage: {
          DEFAULT: '#7A9B7E',
          soft:    '#E8EFE9',
          dark:    '#5B8A60',
        },
        cream: {
          DEFAULT: '#FAF7F2',
          warm:    '#F4EFE6',
        },
        coral: {
          DEFAULT: '#E07856',
          soft:    '#F5C7B6',
        },
        sand:  '#D4C5A9',
      },

      fontFamily: {
        serif: ['DM Serif Display', 'Georgia', 'serif'],
        sans:  ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },

      fontSize: {
        '7xl': ['5rem',   { lineHeight: '1.0',  letterSpacing: '-0.03em' }],
        '6xl': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        '5xl': ['3.5rem', { lineHeight: '1.1',  letterSpacing: '-0.02em' }],
        '4xl': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        '3xl': ['1.875rem', { lineHeight: '1.2' }],
        '2xl': ['1.5rem',   { lineHeight: '1.3' }],
        xl:    ['1.25rem',  { lineHeight: '1.4' }],
        lg:    ['1.125rem', { lineHeight: '1.5' }],
        base:  ['1rem',     { lineHeight: '1.6' }],
        sm:    ['0.875rem', { lineHeight: '1.5' }],
        xs:    ['0.75rem',  { lineHeight: '1.4' }],
      },

      borderRadius: {
        sm:   '8px',
        md:   '12px',
        lg:   '16px',
        xl:   '24px',
        '2xl':'32px',
        full: '999px',
      },

      boxShadow: {
        sm:  '0 1px 2px rgba(192, 85, 58, 0.04)',
        md:  '0 4px 12px rgba(192, 85, 58, 0.10)',
        lg:  '0 8px 24px rgba(192, 85, 58, 0.14)',
        xl:  '0 20px 40px rgba(192, 85, 58, 0.18)',
        cta: '0 4px 20px rgba(192, 85, 58, 0.35)',
      },

      spacing: {
        '1':  '0.25rem',
        '2':  '0.5rem',
        '3':  '0.75rem',
        '4':  '1rem',
        '6':  '1.5rem',
        '8':  '2rem',
        '12': '3rem',
        '16': '4rem',
        '24': '6rem',
      },

      animation: {
        'fade-in':       'fadeIn 400ms ease-out forwards',
        'slide-up':      'slideUp 400ms ease-out forwards',
        'scale-in':      'scaleIn 300ms ease-out forwards',
        'slide-in-right':'slideInRight 350ms ease-out forwards',
        'slide-out-left':'slideOutLeft 350ms ease-out forwards',
        'progress-fill': 'progressFill 4s linear forwards',
        'bar-fill':      'barFill 1.2s ease-out forwards',
        'count-up':      'countUp 1.2s ease-out forwards',
        'pulse-soft':    'pulseSoft 2s ease-in-out infinite',
        'bounce-cta':    'bounceCta 1.5s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(40px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        slideOutLeft: {
          from: { opacity: '1', transform: 'translateX(0)' },
          to:   { opacity: '0', transform: 'translateX(-40px)' },
        },
        progressFill: {
          from: { width: '0%' },
          to:   { width: '100%' },
        },
        barFill: {
          from: { width: '0%', opacity: '0' },
          to:   { opacity: '1' },
          // width se controla inline vía style, este keyframe solo maneja opacity inicial
        },
        countUp: {
          from: { opacity: '0', transform: 'translateY(12px) scale(0.9)' },
          to:   { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.65' },
        },
        bounceCta: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
      },

      maxWidth: {
        quiz:    '640px',
        content: '720px',
        wide:    '1200px',
        sm:      '384px',
      },

      backgroundImage: {
        'terracotta-gradient': 'linear-gradient(135deg, #C0553A 0%, #D4785C 100%)',
        'warm-gradient':       'linear-gradient(180deg, #FFFAF7 0%, #FFF5F0 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
