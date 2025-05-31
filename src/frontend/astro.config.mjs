// src/frontend/astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import node from '@astrojs/node';

export default defineConfig({
  integrations: [
    tailwind(),
    react() // Add React integration
  ],
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  server: {
    host: true,
    port: 4321
  },
  vite: {
    ssr: {
      // Don't externalize pg for SSR - let it be bundled
      noExternal: ['pg']
    },
    define: {
      // Ensure process.env is available
      'process.env': 'process.env'
    }
  }
});