/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#07080f',
                surface: '#0e1022',
                'surface-2': '#131629',
                border: 'rgba(255, 255, 255, 0.08)',
                primary: {
                    DEFAULT: '#6366f1',
                    hover: '#4f52e2',
                    light: '#818cf8',
                },
                secondary: '#a78bfa',
                accent: '#22d3ee',
                success: '#10b981',
                warning: '#f59e0b',
                danger: '#ef4444',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.4s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'slide-in-left': 'slideInLeft 0.4s ease-out',
                'float': 'float 6s ease-in-out infinite',
                'float-slow': 'float 9s ease-in-out infinite',
                'float-delayed': 'float 7s ease-in-out infinite 2s',
                'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
                'shimmer': 'shimmer 2.5s linear infinite',
                'spin-slow': 'spin 8s linear infinite',
                'bar-fill': 'barFill 1.2s ease-out forwards',
                'count-up': 'countUp 0.6s ease-out',
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
                slideInLeft: {
                    '0%': { opacity: '0', transform: 'translateX(-16px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(99,102,241,0.3)' },
                    '50%': { boxShadow: '0 0 40px rgba(99,102,241,0.7)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                barFill: {
                    '0%': { width: '0%' },
                    '100%': { width: 'var(--bar-width)' },
                },
                countUp: {
                    '0%': { opacity: '0', transform: 'translateY(8px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            },
            boxShadow: {
                'glow-sm': '0 0 12px rgba(99,102,241,0.4)',
                'glow': '0 0 24px rgba(99,102,241,0.5)',
                'glow-lg': '0 0 40px rgba(99,102,241,0.6)',
                'glow-green': '0 0 20px rgba(16,185,129,0.4)',
                'glow-amber': '0 0 20px rgba(245,158,11,0.4)',
            },
        },
    },
    plugins: [],
}
