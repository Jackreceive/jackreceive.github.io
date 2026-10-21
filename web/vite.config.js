import { defineConfig } from 'vite';

export default defineConfig({
  root: 'web',
  // Hash navigation and relative assets support both username.github.io and /repo/.
  base: './',
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
  build: { outDir: 'dist', emptyOutDir: true },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
});
