import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // We zetten CSS minification volledig uit. 
    // Dit voorkomt dat de builder struikelt over vage syntax foutjes.
    cssMinify: false 
  }
})