/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          950: '#030712',
          900: '#060d1f',
          850: '#0a1329',
          800: '#0f1b3b',
          700: '#1e293b',
          600: '#334155',
          border: 'rgba(56, 189, 248, 0.15)',
          glow: '#00f2fe',
        },
        neon: {
          cyan: '#00f2fe',
          blue: '#4facfe',
          purple: '#7928ca',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
          red: '#ef4444'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 20px -3px rgba(0, 242, 254, 0.3)',
        'neon-red': '0 0 20px -3px rgba(239, 68, 68, 0.35)',
        'neon-amber': '0 0 20px -3px rgba(245, 158, 11, 0.3)',
        'neon-purple': '0 0 20px -3px rgba(121, 40, 202, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite',
        'scanline': 'scanline 6s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.85' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      }
    },
  },
  plugins: [],
}
