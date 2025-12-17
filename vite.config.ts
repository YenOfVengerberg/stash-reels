import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const STASH_HOST = 'http://192.168.1.11:9777'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'plugin/assets/app',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/graphql': {
        target: STASH_HOST,
        changeOrigin: true,
      },
    },
  },
})
