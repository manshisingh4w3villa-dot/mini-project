import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: false,
    sourcemap: false,
    reportCompressedSize: false,
  },
})
