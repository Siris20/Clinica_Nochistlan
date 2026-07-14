import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Permite que Docker acceda al servidor de desarrollo
    port: 5173, // Asegúrate de que coincida con el puerto de desarrollo
    watch: {
      usePolling: true, // Fuerza a Vite a buscar cambios en el disco
      interval: 100     // Revisa cada 100ms
    }
  }
})