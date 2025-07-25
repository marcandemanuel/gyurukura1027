import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 2006,
    proxy: {
      "/api": {
        target: "http://localhost:2020",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
    },
  },
  build: {
    outDir: "build",
    assetsDir: "assets",
  },
  publicDir: "public",
})
