import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/player-service': 'http://localhost:8080',
      '/auth-service':   'http://localhost:8080',
      '/mgmt-service':   'http://localhost:8080',
    },
  },
})
