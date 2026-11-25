/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Requested Exact Brand Palette
        ivory: {
          DEFAULT: '#FAF7F0',
          light: '#FFFFFF',
          warm: '#F4EFE6',
          dark: '#EAE3D2',
        },
        lavender: {
          DEFAULT: '#C8B6F6',
          light: '#E8E0FB',
          soft: '#F2ECFE',
          dark: '#A992E8',
        },
        dusty: {
          DEFAULT: '#8270B5',
          light: '#9F8FC9',
          dark: '#67559B',
          deep: '#4E3E7A',
        },
        butter: {
          DEFAULT: '#F5DE91',
          light: '#FAF0C7',
          soft: '#FDF7E2',
          dark: '#E4C969',
        },
        sage: {
          DEFAULT: '#B9CBB3',
          light: '#DCE8D7',
          soft: '#EDF4EB',
          dark: '#93AB8C',
        },
        charcoal: {
          DEFAULT: '#34313B',
          light: '#4E4957',
          muted: '#6F6A7A',
          subtle: '#9A95A6',
          border: 'rgba(52, 49, 59, 0.12)',
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },
      boxShadow: {
        'pop': '4px 4px 0px #34313B',
        'pop-sm': '2.5px 2.5px 0px #34313B',
        'pop-lg': '6px 6px 0px #34313B',
        'pop-purple': '4px 4px 0px #8270B5',
        'pop-butter': '4px 4px 0px #E4C969',
        'pop-lavender': '4px 4px 0px #C8B6F6',
        'soft': '0 12px 36px -12px rgba(52, 49, 59, 0.08)',
        'card': '0 8px 24px -6px rgba(52, 49, 59, 0.06)',
        'glow-lavender': '0 0 24px 6px rgba(130, 112, 181, 0.22)',
        'glow-butter': '0 0 20px 4px rgba(245, 222, 145, 0.35)',
      },
      rotate: {
        'neg-1': '-1deg',
        'neg-2': '-2deg',
        '1': '1deg',
        '2': '2deg',
      },
    },
  },
  plugins: [],
}
