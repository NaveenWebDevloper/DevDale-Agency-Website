import { defineConfig } from "vite";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { builtinModules } from "module";
import pkg from "./package.json" assert { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const externals = [
  ...builtinModules,
  ...builtinModules.map(m => `node:${m}`),
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
];

export default defineConfig({
  build: {
    ssr: true,
    lib: {
      entry: path.resolve(__dirname, "server/api-entry.ts"),
      formats: ["es"],
      fileName: () => "index.js",
    },
    rollupOptions: {
      output: {
        entryFileNames: "index.js",
      },
      external: (id) => {
        if (id.startsWith(".") || id.startsWith("/") || path.isAbsolute(id)) {
          return false;
        }
        if (id.startsWith("@/") || id.startsWith("@shared/")) {
          return false;
        }
        return externals.some(ext => id === ext || id.startsWith(`${ext}/`));
      },
    },
    outDir: path.resolve(__dirname, "api"),
    emptyOutDir: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
});
