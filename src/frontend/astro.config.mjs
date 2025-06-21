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
      // Properly define CESIUM_BASE_URL for Vite/Cesium integration
      CESIUM_BASE_URL: JSON.stringify('./'),
      // Define global for Leaflet
      global: 'globalThis'
    },
    assetsInclude: ['**/*.gltf', '**/*.glb'],
    optimizeDeps: {
      include: ['react', 'react-dom'],
      exclude: ['leaflet'] // Exclude leaflet from pre-bundling
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'cesium': ['cesium'],
            'react-vendor': ['react', 'react-dom'],
            'leaflet': ['leaflet']
          }
        }
      },
      chunkSizeWarningLimit: 1000
    },
    resolve: {
      alias: {
        // Handle leaflet CSS imports
        'leaflet/dist/leaflet.css': 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      }
    },
    // Cesium-specific configuration for Vite
    server: {
      fs: {
        allow: ['..']
      }
    }
  }
});