/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#6C38FF', light: '#EDE9FF', dark: '#5025CC', 50: '#F5F0FF' },
        success: { DEFAULT: '#10B981', light: '#D1FAE5', dark: '#059669' },
        warning: { DEFAULT: '#F59E0B', light: '#FEF3C7', dark: '#D97706' },
        danger:  { DEFAULT: '#EF4444', light: '#FEE2E2', dark: '#DC2626' },
        info:    { DEFAULT: '#3B82F6', light: '#DBEAFE' },
        dark:    { DEFAULT: '#0F172A', 700: '#334155', 500: '#64748B', 400: '#94A3B8', 200: '#E2E8F0', 100: '#F1F5F9' },
        surface: '#1E293B',
      },
      fontFamily: { poppins: ['Poppins', 'sans-serif'] },
      boxShadow: {
        card:  '0 2px 16px 0 rgba(108,56,255,0.07)',
        glow:  '0 4px 32px 0 rgba(108,56,255,0.22)',
        'glow-sm': '0 2px 16px 0 rgba(108,56,255,0.14)',
      },
      borderRadius: { '2xl': '1rem', '3xl': '1.5rem' },
      animation: {
        'float':      'float 4s ease-in-out infinite',
        'slide-up':   'slideUp 0.4s ease-out',
        'fade-in':    'fadeIn 0.3s ease-in',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-slow':'bounce 2s ease-in-out infinite',
      },
      keyframes: {
        float:   { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
      }
    }
  },
  plugins: []
}
