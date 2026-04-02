import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const frontendPort = Number(process.env.VITE_PORT || 5173)
const backendPort = Number(process.env.VITE_BACKEND_PORT || 5000)
const backendTarget = process.env.VITE_BACKEND_TARGET || `http://127.0.0.1:${backendPort}`

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      '/admin.js': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      '/employee.js': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      '/manager.js': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      '/admin.css': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      '/style.css': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://127.0.0.1:5000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
