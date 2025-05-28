import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// הגדרות של Vite לפרויקט
export default defineConfig({
  plugins: [react()],
  server: {
    // הגדרות שרת הפיתוח
    host: '0.0.0.0', // מאפשר גישה מכל כתובת IP
    port: 3000,
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://10.100.102.17:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
})
