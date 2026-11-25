import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    // Same-origin /api in dev keeps the httpOnly auth cookie simple.
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
})
