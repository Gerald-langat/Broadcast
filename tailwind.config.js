const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
    flowbite.content(),
  ],
 
  plugins: [
    require("tailwindcss-animate"),
    flowbite.plugin(),
    require("tailwind-scrollbar"),
    require("tailwind-scrollbar-hide"),
  ],
  
  theme: {
    extend: {},
  },

  variants: {
    extend: {
      scrollbar: ['rounded'], // Extend variants if needed
    },
  },
};
