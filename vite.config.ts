/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => ({
  // GitHub Pages serves the site from /<repo>/. Build and `vite preview`
  // both use that path so the preview matches production; dev stays at /.
  base: command === 'build' || isPreview ? '/epicycle-orrery-demo/' : '/',
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.ts'],
  },
}))
