import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', environmentOptions: { jsdom: { url: 'http://localhost/' } }, globals: true, setupFiles: ['./src/test/setup.js'] },
})
