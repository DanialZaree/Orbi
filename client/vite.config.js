import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import typography from '@tailwindcss/typography'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss({
      plugins: [
        typography,
      ]
    }),
  ],
})
