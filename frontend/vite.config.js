import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 9999,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:9998',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 9999,
    host: true,
  },
})