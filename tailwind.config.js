/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          hover: '#4338CA',
          light: '#EEF2FF',
          dark: '#3730A3',
        },
        success: {
          DEFAULT: '#10B981',
          light: '#ECFDF5',
          text: '#065F46',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FFFBEB',
          text: '#92400E',
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#FEF2F2',
          text: '#991B1B',
        },
        slate: {
          bg: '#F1F5F9',
          card: '#FFFFFF',
          border: '#E2E8F0',
          main: '#0F172A',
          sub: '#64748B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'card': '20px',
        'btn': '12px',
      },
      boxShadow: {
        'card': '0 4px 16px rgba(15, 23, 42, 0.08)',
        'elevated': '0 24px 60px rgba(15, 23, 42, 0.18)',
        'card-hover': '0 10px 25px -3px rgba(15, 23, 42, 0.12), 0 4px 6px -4px rgba(15, 23, 42, 0.08)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        flashGreen: {
          '0%, 100%': { backgroundColor: 'transparent' },
          '20%, 60%': { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
        }
      },
      animation: {
        'fade-in': 'fadeIn 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'flash-green': 'flashGreen 2s ease-in-out',
      }
    },
  },
  plugins: [],
}
