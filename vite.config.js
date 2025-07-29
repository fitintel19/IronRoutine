import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        style: 'src/style.css'
      },
      output: {
        assetFileNames: '[name].[ext]'
      }
    }
  }
});