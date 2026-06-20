import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Dev: żądania /api lecą do lokalnego backendu (npm run server na :3001).
    // Front i API na tym samym originie (localhost:5173) → httpOnly cookie
    // działa first-party także lokalnie.
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
