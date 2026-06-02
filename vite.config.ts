import fs from 'fs';
import {fileURLToPath} from 'url';
import react from '@vitejs/plugin-react';
import {defineConfig, type Plugin} from 'vite';

/**
 * Vite copies model.json (referenced via new URL in the oceans-lab bundle) but
 * treats it as a raw asset — it never rewrites its content, so the binary shard
 * path inside the JSON is never resolved.  Emit the binary explicitly so it
 * lands next to the hashed model.json in dist/assets/.
 */
function emitOceansModelBinary(): Plugin {
  return {
    name: 'emit-oceans-model-binary',
    generateBundle() {
      const binPath = fileURLToPath(
        new URL(
          './node_modules/@code-dot-org/oceans-lab/dist/assets/models/group1-shard1of1.bin',
          import.meta.url,
        ),
      );
      this.emitFile({
        type: 'asset',
        fileName: 'assets/group1-shard1of1.bin',
        source: fs.readFileSync(binPath),
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), emitOceansModelBinary()],
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
