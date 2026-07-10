/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
      },
      colors: {
        'pop-bg': '#0F1012',
        'pop-surface': '#17181C',
        'pop-border': '#2A2D33',
        'pop-primary': '#F97316',
        'pop-hover': '#EA580C',
        'pop-text': '#F5F5F5',
        'pop-secondary': '#9CA3AF',
        'pop-muted': '#6B7280',
        'pop-success': '#22C55E',
        goat: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdbb74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407'
        }
      },
      boxShadow: {
        goat: '0 10px 40px -10px rgba(249, 115, 22, 0.45)'
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'pop-in': {
          '0%': { transform: 'scale(0.92)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'toast-in': {
          '0%': { transform: 'translateX(120%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        }
      },
      animation: {
        'slide-up': 'slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fade-in 0.25s ease-out',
        'pop-in': 'pop-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'toast-in': 'toast-in 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
      }
    }
  },
  plugins: []
};
