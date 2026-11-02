import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  server: { host: true, port: 5173 },
  build: {
    target: 'es2022',
    assetsInlineLimit: 2048,
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        help: resolve(process.cwd(), 'help.html'),
        privacy: resolve(process.cwd(), 'privacy.html'),
      },
    },
  },
});
