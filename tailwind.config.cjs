/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        indeterminate: 'indeterminate 1s infinite linear'
      },
      colors: {
        main: 'rgb(61,155,233)',
        secondary: 'rgb(255, 142, 44)',
        booth: '#62214b',
        sugarlife: '#E2677F',
        ford: '#216d6f'
      },
      keyframes: {
        indeterminate: {
          '0%': {
            transform: 'translateX(0)',
            width: '0%'
          },
          '40%': {
            transform: 'translateX(0)',
            width: '40%'
          },
          '100%': {
            transform: 'translateX(100%)',
            width: '100%'
          }
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif']
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
}
