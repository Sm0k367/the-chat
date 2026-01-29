import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext', // Ensures modern JS features aren't downgraded
    outDir: 'dist',
  },
  server: {
    port: 5173,
    strictPort: true,
  }
});
