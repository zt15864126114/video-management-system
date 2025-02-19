import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    open: true
  },
  base: '/video-management-system/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
}) 