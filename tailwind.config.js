import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', ...defaultTheme.fontFamily.sans],
                display: ['"Instrument Serif"', ...defaultTheme.fontFamily.serif],
                mono: ['"JetBrains Mono"', ...defaultTheme.fontFamily.mono],
            },
            colors: {
                ink: {
                    950: '#0B0A08',
                    900: '#12100C',
                    800: '#1A1712',
                    700: '#241F18',
                    600: '#322A20',
                },
                cream: {
                    50: '#FDFBF7',
                    100: '#F6F1E8',
                    200: '#E8DFCF',
                    300: '#D3C6AE',
                    400: '#B3A288',
                },
                copper: {
                    300: '#E3A87A',
                    400: '#D68A54',
                    500: '#C2703A',
                    600: '#A65A2B',
                    700: '#83461F',
                },
            },
            borderRadius: {
                squircle: '2rem',
            },
            transitionTimingFunction: {
                silk: 'cubic-bezier(0.32, 0.72, 0, 1)',
                spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            },
            boxShadow: {
                ambient: '0 24px 70px -30px rgba(0, 0, 0, 0.65)',
                inset_hi: 'inset 0 1px 1px rgba(255, 255, 255, 0.14)',
            },
            keyframes: {
                'fade-up': {
                    from: { opacity: '0', transform: 'translateY(2.5rem)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                'float-slow': {
                    '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
                    '50%': { transform: 'translate3d(0, -1.25rem, 0)' },
                },
            },
        },
    },

    plugins: [forms],
};
