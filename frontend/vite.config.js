import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/admin.js': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/employee.js': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/manager.js': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/admin.css': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/style.css': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
