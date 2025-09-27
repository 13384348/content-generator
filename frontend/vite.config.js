import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    host: '0.0.0.0', // 允许外部访问
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.NODE_ENV === 'production' ? 'http://localhost:5004' : 'http://localhost:5004',
        changeOrigin: true,
        timeout: 120000, // 设置代理超时为120秒
        proxyTimeout: 120000 // 设置代理响应超时为120秒
      }
    }
  }
})