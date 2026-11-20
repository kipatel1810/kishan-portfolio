import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// VITE_BASE lets GitHub Pages serve the app from /<repo-name>/.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  build: {
    // three.js is only loaded lazily by the hero scene, so its large chunk doesn't block first paint.
    chunkSizeWarningLimit: 1000,
  },
});
