import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // Ensures assets load from the root domain
  build: {
    outDir: 'dist', // Standard for Vercel
  }
});
