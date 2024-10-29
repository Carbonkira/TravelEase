import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,  // Enable source maps in production build
  },
  server: {
    sourcemap: true,  // Enable source maps in development (optional, depending on Vite version)
  },
})
