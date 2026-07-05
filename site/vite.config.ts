import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Project page on GitHub Pages: https://frc2713.github.io/software_training/
export default defineConfig({
  base: '/software_training/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    fs: {
      // allow the dev server to read lesson content from ../lessons
      allow: ['..'],
    },
  },
})
