const { lumiaTailwindPreset } = require('@lumia-ui/theme/tailwind');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [lumiaTailwindPreset],
  content: [
    './.storybook/**/*.{js,ts,jsx,tsx}',
    './packages/**/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
};
