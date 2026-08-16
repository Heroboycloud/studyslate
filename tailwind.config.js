/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chalkboard: {
          base: '#08211B',
          dark: '#0C2B24',
          mid: '#113830',
          light: '#16453A',
          lighter: '#1D5546',
        },
        chalk: {
          white: '#F1EEE1',
          fog: '#A7BBAE',
          yellow: '#F2CE68',
          poppy: '#EE8A73',
          glacier: '#8ECFE3',
          mint: '#9FDCB4',
        },
        paper: {
          base: '#F7F3E7',
          ink: '#233129',
        },
      },
      fontFamily: {
        display: ['Bricolage Grotesque', 'sans-serif'],
        body: ['Atkinson Hyperlegible', 'sans-serif'],
        hand: ['Caveat', 'cursive'],
        mono: ['Space Mono', 'monospace'],
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
      animation: {
        'draw': 'draw 1.5s ease-out forwards',
        'blink': 'blink 1s step-end infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        draw: {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
