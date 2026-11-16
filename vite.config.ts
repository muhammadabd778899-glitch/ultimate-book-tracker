import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// GitHub Pages base path: repository name (production) / root (dev)
const isDev = process.env.VITE_DEV === 'true' || process.env.NODE_ENV === 'development';
const BASE = isDev ? '/' : '/ultimate-book-tracker/';

export default defineConfig({
  base: BASE,
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,ttf,otf}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        navigateFallback: `${BASE}index.html`,
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/covers\.openlibrary\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'official-covers',
              expiration: { maxEntries: 300, maxAgeSeconds: 365 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: new RegExp(`^${BASE.replace(/\/$/, '')}/covers/.*`, 'i'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'covers-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: new RegExp(`^${BASE.replace(/\/$/, '')}/icons/.*`, 'i'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'icons-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
        ],
      },
      manifest: {
        name: 'The Ultimate Book Tracker',
        short_name: 'Book Tracker',
        description: 'Your personal Netflix for books — a private, offline digital library and reading journal.',
        start_url: BASE,
        display: 'standalone',
        background_color: '#101014',
        theme_color: '#E65A45',
        orientation: 'portrait',
        scope: BASE,
        icons: [
          { src: 'icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: 'icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' },
          { src: 'icons/maskable-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'dexie', 'dexie-react-hooks', 'lucide-react', 'recharts'],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
    historyApiFallback: true,
  },
});
