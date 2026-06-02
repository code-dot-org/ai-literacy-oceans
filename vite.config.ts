import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [react()],
  base: '/ai-literacy-oceans/',
  define: {
    global: 'globalThis',
  },
});
