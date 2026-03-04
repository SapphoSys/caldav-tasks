import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
      $components: path.resolve(__dirname, './src/components'),
      $context: path.resolve(__dirname, './src/context'),
      $data: path.resolve(__dirname, './src/data'),
      $hooks: path.resolve(__dirname, './src/hooks'),
      $lib: path.resolve(__dirname, './src/lib'),
      $providers: path.resolve(__dirname, './src/providers'),
      $styles: path.resolve(__dirname, './src/styles'),
      $types: path.resolve(__dirname, './src/types'),
      $utils: path.resolve(__dirname, './src/utils'),

      // Tree-shake lucide-react by resolving icons/* to individual ESM files
      'lucide-react/icons': fileURLToPath(
        new URL('./node_modules/lucide-react/dist/esm/icons', import.meta.url),
      ),
    },
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
    rollupOptions: {
      output: {
        manualChunks: {
          // date utilities
          'date-fns': ['date-fns'],

          // dnd for sorting, drag'n'drop and ordering
          'dnd-kit': ['@dnd-kit/core', '@dnd-kit/sortable'],

          // emoji picker
          frimousse: ['frimousse'],

          // icons
          lucide: ['lucide-react'],

          // toast notifications
          sonner: ['sonner'],

          // react-query for server state
          state: ['@tanstack/react-query'],

          // tauri plugins chunk
          tauri: [
            '@tauri-apps/api',
            '@tauri-apps/plugin-dialog',
            '@tauri-apps/plugin-fs',
            '@tauri-apps/plugin-http',
            '@tauri-apps/plugin-log',
            '@tauri-apps/plugin-notification',
            '@tauri-apps/plugin-opener',
            '@tauri-apps/plugin-os',
            '@tauri-apps/plugin-process',
            '@tauri-apps/plugin-shell',
            '@tauri-apps/plugin-sql',
            '@tauri-apps/plugin-updater',
          ],
        },
      },
    },
  },
});
