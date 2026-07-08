import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuration for Vite client server on default port 5173
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
});
