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

          // Core React runtime — always needed, load first
          if (/[\\/]node_modules[\\/](\.pnpm[\\/])?react[\\/]/.test(id)) return "react";
          if (/[\\/]node_modules[\\/](\.pnpm[\\/])?react-dom[\\/]/.test(id)) return "react-dom";

          // Routing — needed on every page
          if (/[\\/]node_modules[\\/](\.pnpm[\\/])?react-router-dom[\\/]/.test(id)) return "react-router-dom";

          // Animation libraries — keep separate so pages without animations skip them
          if (/[\\/]node_modules[\\/](\.pnpm[\\/])?framer-motion[\\/]/.test(id)) return "framer-motion";
          if (/[\\/]node_modules[\\/](\.pnpm[\\/])?gsap[\\/]/.test(id)) return "gsap";
          if (/[\\/]node_modules[\\/](\.pnpm[\\/])?lenis[\\/]/.test(id)) return "lenis";

          // 3D graphics — very heavy, only on pages that use it
          if (/[\\/]node_modules[\\/](\.pnpm[\\/])?(three|@react-three)[\\/]/.test(id)) return "three";

          // Vercel telemetry — load last, not critical
          if (/[\\/]node_modules[\\/](\.pnpm[\\/])?@vercel[\\/](analytics|speed-insights)[\\/]/.test(id)) return "analytics";

          // Radix UI — large component set, not all used on every page
          if (/[\\/]node_modules[\\/](\.pnpm[\\/])?@radix-ui[\\/]/.test(id)) return "radix-ui";

          // Charting — only on pages with charts
          if (/[\\/]node_modules[\\/](\.pnpm[\\/])?recharts[\\/]/.test(id)) return "recharts";

          // Date utilities — only in date-heavy pages
          if (/[\\/]node_modules[\\/](\.pnpm[\\/])?date-fns[\\/]/.test(id)) return "date-fns";

          // TanStack Query — data fetching layer
          if (/[\\/]node_modules[\\/](\.pnpm[\\/])?@tanstack[\\/]/.test(id)) return "tanstack";

          // Icons — medium sized, can load slightly deferred
          if (/[\\/]node_modules[\\/](\.pnpm[\\/])?lucide-react[\\/]/.test(id)) return "lucide";

          // Everything else falls into a smaller vendor chunk
          return "vendor";
        },
      },
    },
  },
});
