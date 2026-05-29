import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        // Используем современный Sass API вместо устаревшего legacy.
        // Это убирает Deprecation Warning при сборке.
        // 'modern-compiler' — самый быстрый (нужен пакет sass-embedded).
        // Если sass-embedded не установлен, поменяйте на 'modern'.
        api: 'modern-compiler',
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
