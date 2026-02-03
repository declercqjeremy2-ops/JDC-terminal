import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // We gebruiken de standaard minifyer in plaats van lightningcss 
    // om die vage syntax errors te voorkomen
    cssMinify: 'esbuild' 
  }
})