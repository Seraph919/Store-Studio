import fs from 'node:fs'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const isRunningInDocker = fs.existsSync('/.dockerenv')
const defaultBackend = isRunningInDocker ? 'http://spring-backend:8080' : 'http://localhost:8080'
const backendTarget = process.env.VITE_BACKEND_URL || process.env.BACKEND_URL || defaultBackend

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['.trycloudflare.com'],
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
      },
      '/auth': {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: true,
    port: 5173,
    allowedHosts: ['.trycloudflare.com'],
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
      },
      '/auth': {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react'
          }
          if (id.includes('node_modules/@tanstack/')) {
            return 'vendor-query'
          }
        },
      },
    },
  },
})