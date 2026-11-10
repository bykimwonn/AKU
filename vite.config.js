import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * `base: './'` keeps every asset path relative, so the built site works when
 * hosted anywhere — a domain root, a GitHub Pages project folder (/AKU/), or
 * even opened straight from disk.
 */
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    // The preview environment proxies this dev server under another hostname.
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true,
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 700,
    reportCompressedSize: false,
  },
});
