/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        goat: {
          50: '#f2fbf5',
          100: '#e0f7e7',
          200: '#c1eecf',
          300: '#8fe0ac',
          400: '#57cb82',
          500: '#2fb262',
          600: '#20904d',
          700: '#1c7240',
          800: '#1a5b36',
          900: '#164b2e',
          950: '#082a19'
        }
      },
      boxShadow: {
        goat: '0 10px 40px -10px rgba(32, 144, 77, 0.45)'
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
