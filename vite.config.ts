import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import imagemin from "vite-plugin-imagemin";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    imagemin({
      gifsicle: { optimizationLevel: 3 },
      optipng: { optimizationLevel: 5 },
      mozjpeg: { quality: 75 },
      svgo: { plugins: [{ name: "removeViewBox", active: false }] },
      webp: { quality: 80 },
    }),
  ],
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
    chunkSizeWarningLimit: 1500,
    target: "es2020",
    rollupOptions: {
      input: {
        app: "index.html",
      },
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (/[\\/\\]node_modules[\\/\\](\\.pnpm[\\/\\])?react[\\/\\]/.test(id)) return "react";
          if (/[\\/\\]node_modules[\\/\\](\\.pnpm[\\/\\])?react-dom[\\/\\]/.test(id)) return "react-dom";
          if (/[\\/\\]node_modules[\\/\\](\\.pnpm[\\/\\])?react-router-dom[\\/\\]/.test(id)) return "react-router-dom";
          if (/[\\/\\]node_modules[\\/\\](\\.pnpm[\\/\\])?framer-motion[\\/\\]/.test(id)) return "framer-motion";
          if (/[\\/\\]node_modules[\\/\\](\\.pnpm[\\/\\])?gsap[\\/\\]/.test(id)) return "gsap";
          if (/[\\/\\]node_modules[\\/\\](\\.pnpm[\\/\\])?lenis[\\/\\]/.test(id)) return "lenis";
          if (/[\\/\\]node_modules[\\/\\](\\.pnpm[\\/\\])?(three|@react-three)[\\/\\]/.test(id)) return "three";
          if (/[\\/\\]node_modules[\\/\\](\\.pnpm[\\/\\])?@vercel[\\/\\](analytics|speed-insights)[\\/\\]/.test(id)) return "analytics";
          if (/[\\/\\]node_modules[\\/\\](\\.pnpm[\\/\\])?@radix-ui[\\/\\]/.test(id)) return "radix-ui";
          if (/[\\/\\]node_modules[\\/\\](\\.pnpm[\\/\\])?recharts[\\/\\]/.test(id)) return "recharts";
          if (/[\\/\\]node_modules[\\/\\](\\.pnpm[\\/\\])?date-fns[\\/\\]/.test(id)) return "date-fns";
          if (/[\\/\\]node_modules[\\/\\](\\.pnpm[\\/\\])?@tanstack[\\/\\]/.test(id)) return "tanstack";
          if (/[\\/\\]node_modules[\\/\\](\\.pnpm[\\/\\])?lucide-react[\\/\\]/.test(id)) return "lucide";
          return "vendor";
        },
      },
    },
  },
});
