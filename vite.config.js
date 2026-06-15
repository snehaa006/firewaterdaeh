import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  // Vite automatically exposes VITE_* variables from .env to import.meta.env
  // No extra config needed — just ensure your .env file has VITE_ prefixed keys
})
