import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Builds everything (JS + CSS) into ONE index.html that opens by double-click.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: './',
  build: { outDir: 'standalone', emptyOutDir: true },
});
