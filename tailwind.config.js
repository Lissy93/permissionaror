/** @type {import('tailwindcss').Config} */
module.exports = {
  // content: ["./src/**/*.{marko,js}"],
  purge: {
    content: ["./src/**/*.marko"],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
