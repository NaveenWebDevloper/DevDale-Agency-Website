import "./generate-seo-assets.mjs";
import { build } from "vite";

try {
  await build({ configFile: "vite.config.ts" });
} catch (error) {
  console.error(error);
  process.exit(1);
}
