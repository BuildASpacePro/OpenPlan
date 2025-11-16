/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'astro-blue': '#0C4A6E',
        'astro-light': '#38BDF8',
        'astro-dark': '#0F172A',
        'astro-gray': '#64748B',
        // Bloomberg terminal color scheme
        'bloomberg-black': '#000000',
        'bloomberg-bg': '#0a0a0a',
        'bloomberg-orange': '#FF8C00',
        'bloomberg-amber': '#FFA500',
        'bloomberg-blue': '#00A0DC',
        'bloomberg-blue-light': '#4D9DE0',
        'bloomberg-gray': '#1a1a1a',
        'bloomberg-gray-light': '#2a2a2a',
        'bloomberg-text': '#e0e0e0',
        'bloomberg-green': '#00ff00',
        'bloomberg-red': '#ff0000'
      },
      fontFamily: {
        'mono': ['Consolas', 'Monaco', 'Courier New', 'monospace']
      }
    },
  },
  plugins: [],
}