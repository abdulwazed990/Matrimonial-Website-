import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

const buildTimestamp = Date.now().toString();

// Vite plugin to generate version.json for runtime update detection
function buildVersionPlugin(): Plugin {
  return {
    name: 'build-version-json',
    generateBundle() {
      const versionData = JSON.stringify(
        {
          version: buildTimestamp,
          buildTime: new Date().toISOString(),
        },
        null,
        2
      );
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: versionData,
      });
    },
  };
}

export default defineConfig(() => {
  return {
    define: {
      __APP_BUILD_TIME__: JSON.stringify(buildTimestamp),
    },
    plugins: [react(), tailwindcss(), buildVersionPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]',
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
