import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      '@sagasu/api-contract': path.resolve(import.meta.dirname, '../../packages/api-contract/index.ts'),
      '$lib': path.resolve(import.meta.dirname, './src/lib'),
      '$features': path.resolve(import.meta.dirname, './src/features'),
      '$components': path.resolve(import.meta.dirname, './src/components')
    }
  }
});
