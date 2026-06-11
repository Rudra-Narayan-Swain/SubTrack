/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#f0f4ff',
                    100: '#dde6ff',
                    200: '#c2d1ff',
                    300: '#9db1ff',
                    400: '#7485ff',
                    500: '#5b5fff',
                    600: '#4a3ef7',
                    700: '#3f2ed8',
                    800: '#3328ae',
                    900: '#2d2890',
                },
                dark: {
                    950: '#07080f',
                    900: '#0d0f1e',
                    800: '#131629',
                    700: '#1a1f38',
                    600: '#232846',
                    500: '#2e3457',
                },
                glass: {
                    border: 'rgba(255,255,255,0.08)',
                    bg: 'rgba(255,255,255,0.04)',
                    bgHover: 'rgba(255,255,255,0.07)',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            backdropBlur: {
                xs: '2px',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' },
                },
                pulse: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '.5' },
                },
            },
            animation: {
                fadeIn: 'fadeIn 0.3s ease-out',
                shimmer: 'shimmer 2s infinite linear',
                pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
        },
    },
    plugins: [],
}
