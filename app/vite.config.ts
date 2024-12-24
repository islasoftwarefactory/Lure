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
    hmr: {
      protocol: 'ws',
      host: '0.0.0.0',
    },
    host: true,
    strictPort: true,
    port: 5173
  }
});
