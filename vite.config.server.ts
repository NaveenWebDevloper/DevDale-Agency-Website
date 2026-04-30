import { defineConfig } from "vite";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  build: {
    ssr: true,
    lib: {
      entry: path.resolve(__dirname, "server/index.ts"),
      formats: ["es"],
    },
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, "server/index.ts"),
      },
      external: [
        "express",
        "dotenv",
      ],
    },
    outDir: path.resolve(__dirname, "dist/server"),
    emptyOutDir: true,
  },
});
