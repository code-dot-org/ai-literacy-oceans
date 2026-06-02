import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [react()],
  base: '/ai-literacy-oceans/',
  define: {
    global: 'globalThis',
  },
  build: {
    rollupOptions: {
      // node-fetch is referenced inside the bundled oceans-lab dist (via TF.js).
      // Browsers have native fetch; exclude the Node shim from the bundle.
      external: ['node-fetch'],
    },
  },
});
