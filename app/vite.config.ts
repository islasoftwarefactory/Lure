import path             from "path";
import { defineConfig } from "vite";
import react            from "@vitejs/plugin-react";
import svgr from 'vite-plugin-svgr'


// https://vitejs.dev/config/
export default defineConfig({
  // Define environment variables here
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify('http://locked.lureclo.com')
  },
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
      host: 'lureclo.com',
      port: 5173,
      clientPort: 8081
    }
  }
});
