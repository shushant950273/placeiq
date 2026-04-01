/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary:      '#1E3A5F',
        secondary:    '#2E75B6',
        accent:       '#3B82F6',
        'accent-light': '#EFF6FF',
        success:      '#10B981',
        warning:      '#F59E0B',
        danger:       '#EF4444',
        surface:      '#FFFFFF',
        'border-color': '#E2E8F0',
        'text-primary': '#0F172A',
        'text-muted':   '#64748B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        card:   '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        hover:  '0 10px 40px rgba(30,58,95,0.12)',
        btn:    '0 2px 8px rgba(59,130,246,0.30)',
        'btn-hover': '0 4px 16px rgba(59,130,246,0.40)',
        xl:     '0 20px 50px rgba(0,0,0,0.10)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #1E3A5F 0%, #2E75B6 100%)',
        'gradient-accent':  'linear-gradient(135deg, #2E75B6 0%, #3B82F6 100%)',
        'gradient-hero':    'linear-gradient(135deg, #0F2044 0%, #1E3A5F 40%, #2E75B6 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 },           to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
