/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        gray: {
          850: '#1f2937',
          950: '#0f172a',
        },
        blue: {
          450: '#6366f1',
        },
        green: {
          450: '#22c55e',
        },
        red: {
          450: '#f87171',
        },
        yellow: {
          450: '#fbbf24',
        },
        purple: {
          450: '#a855f7',
        }
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
        'voice-pulse': 'voice-pulse 1s ease-in-out infinite',
        'voice-active-pulse': 'voice-active-pulse 1.2s ease-in-out infinite',
        'symptom-fade-in': 'symptom-fade-in 0.5s ease-out',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'progress-shimmer': 'progress-shimmer 2s linear infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
        'loading-dots': 'loading-dots 1.5s linear infinite',
        'emergency-pulse': 'emergency-pulse 2s ease-in-out infinite',
        'critical-pulse': 'critical-pulse 1.5s ease-in-out infinite',
        'available-blink': 'available-blink 2s ease-in-out infinite',
        'risk-shimmer': 'risk-shimmer 3s linear infinite',
        'shimmer': 'shimmer 2s infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.9' },
        },
        'voice-pulse': {
          '0%, 100%': { 
            borderColor: 'rgba(34, 197, 94, 0.5)',
            boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.7)'
          },
          '50%': { 
            borderColor: 'rgba(34, 197, 94, 0.8)',
            boxShadow: '0 0 0 8px rgba(34, 197, 94, 0)'
          },
        },
        'voice-active-pulse': {
          '0%, 100%': {
            borderColor: 'rgba(34, 197, 94, 0.5)',
            boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.7)'
          },
          '50%': {
            borderColor: 'rgba(34, 197, 94, 0.9)',
            boxShadow: '0 0 0 6px rgba(34, 197, 94, 0)'
          },
        },
        'symptom-fade-in': {
          from: {
            opacity: '0',
            transform: 'translateY(-10px)'
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        'glow-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 5px rgba(34, 197, 94, 0.5)'
          },
          '50%': {
            boxShadow: '0 0 15px rgba(34, 197, 94, 0.8)'
          },
        },
        'progress-shimmer': {
          '0%': {
            backgroundPosition: '200% 0'
          },
          '100%': {
            backgroundPosition: '-200% 0'
          },
        },
        'sparkle': {
          '0%, 100%': {
            opacity: '1',
            transform: 'scale(1)'
          },
          '50%': {
            opacity: '0.8',
            transform: 'scale(1.1)'
          },
        },
        'loading-dots': {
          '0%': { content: '' },
          '25%': { content: '.' },
          '50%': { content: '..' },
          '75%': { content: '...' },
          '100%': { content: '' },
        },
        'emergency-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.7)'
          },
          '50%': {
            boxShadow: '0 0 0 10px rgba(239, 68, 68, 0)'
          },
        },
        'critical-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 0 0 rgba(153, 27, 27, 0.7)'
          },
          '50%': {
            boxShadow: '0 0 0 8px rgba(153, 27, 27, 0)'
          },
        },
        'available-blink': {
          '0%, 50%, 100%': {
            opacity: '1'
          },
          '25%, 75%': {
            opacity: '0.6'
          },
        },
        'risk-shimmer': {
          '0%': {
            left: '-100%'
          },
          '100%': {
            left: '100%'
          },
        },
        'shimmer': {
          '0%': {
            backgroundPosition: '200% 0'
          },
          '100%': {
            backgroundPosition: '-200% 0'
          },
        },
        'fade-in': {
          '0%': {
            opacity: '0'
          },
          '100%': {
            opacity: '1'
          },
        },
        'slide-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        'slide-down': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        'scale-in': {
          '0%': {
            opacity: '0',
            transform: 'scale(0.95)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)'
          },
        },
        'bounce-subtle': {
          '0%, 100%': {
            transform: 'translateY(0)'
          },
          '50%': {
            transform: 'translateY(-4px)'
          },
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.4)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.4)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.4)',
        'glow-yellow': '0 0 20px rgba(245, 158, 11, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(59, 130, 246, 0.2)',
      },
      backgroundImage: {
        'gradient-glass': 'linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        'gradient-dark': 'linear-gradient(145deg, rgba(17, 24, 39, 0.9), rgba(31, 41, 55, 0.8))',
        'gradient-medicine': 'linear-gradient(145deg, rgba(55, 65, 81, 0.8), rgba(31, 41, 55, 0.9))',
        'gradient-condition': 'linear-gradient(145deg, rgba(17, 24, 39, 0.9), rgba(31, 41, 55, 0.8))',
        'gradient-remedy': 'linear-gradient(135deg, rgba(31, 41, 55, 0.8), rgba(55, 65, 81, 0.6))',
        'gradient-severity-low': 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(34, 197, 94, 0.1))',
        'gradient-severity-medium': 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(251, 191, 36, 0.1))',
        'gradient-severity-high': 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(248, 113, 113, 0.1))',
        'gradient-severity-critical': 'linear-gradient(135deg, rgba(153, 27, 27, 0.3), rgba(239, 68, 68, 0.2))',
        'gradient-progress': 'linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6)',
        'gradient-confidence': 'linear-gradient(90deg, #ef4444 0%, #f59e0b 30%, #10b981 100%)',
        'gradient-slider': 'linear-gradient(90deg, #10b981 0%, #f59e0b 50%, #ef4444 100%)',
        'gradient-shimmer': 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
      },
      blur: {
        xs: '2px',
      },
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      fontSize: {
        '2xs': '0.625rem',
        '3xs': '0.5rem',
      },
      lineHeight: {
        '12': '3rem',
        '16': '4rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      minHeight: {
        '128': '32rem',
        '144': '36rem',
      },
      aspectRatio: {
        '4/3': '4 / 3',
        '3/2': '3 / 2',
        '2/3': '2 / 3',
        '9/16': '9 / 16',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
        'border': 'border-width, border-color',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '900': '900ms',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'bounce-out': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}