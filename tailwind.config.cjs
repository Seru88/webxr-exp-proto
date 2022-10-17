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
        billboard: '#5A56C4',
        booth: '#7D1587',
        brochure: '#7CA7DB',
        candy: '#F26EBA',
        car: '#216D6F',
        college: '#38BBF5',
        golf: '#D51900'
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
