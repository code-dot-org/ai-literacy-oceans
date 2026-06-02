import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [react()],
  base: '/ai-literacy-oceans/',
  define: {
    global: 'globalThis',
  },
  resolve: {
    // node-fetch is referenced inside the bundled oceans-lab dist (TF.js CJS shim).
    // Alias it to a browser shim for both dev server and build.
    alias: {
      'node-fetch': new URL('./src/node-fetch-shim.ts', import.meta.url).pathname,
    },
  },
});
