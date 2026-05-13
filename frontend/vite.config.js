import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
    proxy: {
      '/solve': { target: 'http://localhost:8000', changeOrigin: true },
      '/ping':  { target: 'http://localhost:8000', changeOrigin: true },
      '/moves': { target: 'http://localhost:8000', changeOrigin: true },
    }
  }
})
