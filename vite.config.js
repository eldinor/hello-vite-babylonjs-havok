import { defineConfig } from 'vite'
export default defineConfig({
  base:"/hello-vite-babylonjs-havok/",
  optimizeDeps: {
    exclude: ['@babylonjs/havok', 'ktx2-encoder'],
  },
})