import path             from "path";
import { defineConfig } from "vite";
import react            from "@vitejs/plugin-react";
import svgr from 'vite-plugin-svgr'


// https://vitejs.dev/config/
export default defineConfig({
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
      host: 'localhost',
      port: 5173,
      clientPort: 8081
    }
  }
});
