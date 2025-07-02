// @ts-nocheck
import path             from "path";
import { defineConfig } from "vite";
import react            from "@vitejs/plugin-react";
import svgr from 'vite-plugin-svgr'


// https://vitejs.dev/config/
export default defineConfig({
  // Load environment variables from app/ directory
  envDir: path.resolve(__dirname),
  // Environment variables will be loaded from .env file automatically
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    watch: {
      usePolling: true,
      interval: 100
    },
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: {
      host: 'locked.lureclo.com',
      port: 5173,
      clientPort: 8081
    }
  }
});