import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV ?? "production"),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  build: {
    outDir: "dist/client",
    emptyOutDir: true,
    cssMinify: true,
    minify: "esbuild",
    sourcemap: false,
    target: "es2020",
    rollupOptions: {
      input: {
        app: "index.html",
      },
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (/[\\/]node_modules[\\/](\.pnpm[\\/])?(react|react-dom|react-router-dom)[\\/]/.test(id)) return "react";
          if (/[\\/]node_modules[\\/](\.pnpm[\\/])?(framer-motion|gsap)[\\/]/.test(id)) return "animation";
          if (/[\\/]node_modules[\\/](\.pnpm[\\/])?(three|@react-three)[\\/]/.test(id)) return "three";
          if (/[\\/]node_modules[\\/](\.pnpm[\\/])?@vercel[\\/](analytics|speed-insights)[\\/]/.test(id)) return "analytics";
          return "vendor";
        },
      },
    },
  },
});
