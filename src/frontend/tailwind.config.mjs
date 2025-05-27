/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'astro-blue': '#0C4A6E',
        'astro-light': '#38BDF8',
        'astro-dark': '#0F172A',
        'astro-gray': '#64748B'
      }
    },
  },
  plugins: [],
}