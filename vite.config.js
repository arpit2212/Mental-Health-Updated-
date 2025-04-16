import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    host: '0.0.0.0', // Allow access from local network
    port: 5173,       // Use the same port as before
    strictPort: true  // Avoid automatic port switching
  },
  define: {
    // Polyfill for process.env
    'process.env': {},
    'process': { env: {} }
  }
})
