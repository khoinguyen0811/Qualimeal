/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          deep: '#A8201A',       /* Red Primary Dark */
          green: '#C82D1F',      /* Red Primary */
          emerald: '#3B943A',    /* Secondary Green */
          gold: '#76C143',       /* Secondary Light Green */
          beige: '#F9FAFB',      /* Neutral BG Light */
          orange: '#E05315',     /* Primary Orange */
          light: '#FFFFFF'       /* Neutral BG White */
        }
      },
      fontFamily: {
        sans: ['"Open Sans"', 'sans-serif'],
        display: ['"Montserrat"', 'sans-serif']
      }
    },
  },
  plugins: [],
}
