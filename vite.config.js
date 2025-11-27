import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // For relative paths in static build
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  server: {
    host: true
  }
});
