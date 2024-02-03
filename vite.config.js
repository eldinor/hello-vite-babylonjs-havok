import { defineConfig } from 'vite'
export default defineConfig({
  base:"/loader/",
  optimizeDeps: {
    exclude: ['@babylonjs/havok'],
  },
})