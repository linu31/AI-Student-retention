import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },

  // 🔥 ADD THIS BLOCK
  preview: {
    host: true,
    port: process.env.PORT || 3000,
    allowedHosts: "all"
  },

  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
