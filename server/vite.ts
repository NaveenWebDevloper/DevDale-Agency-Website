import express, { type Express } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { type Server } from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function setupVite(app: Express, server: Server) {
  const vite = await createViteServer({
    server: { 
      middlewareMode: true, 
      hmr: { server },
      allowedHosts: true 
    },
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use(async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientIndex = path.resolve(__dirname, "..", "index.html");
      let template = fs.readFileSync(clientIndex, "utf-8");
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "..", "client");
  log(`Serving static files from: ${distPath}`);
  if (!fs.existsSync(distPath)) {
    throw new Error(`Could not find a build: ${distPath}. Build the project first.`);
  }

  app.use(express.static(distPath, { maxAge: '31536000', immutable: true }));
  app.use((_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

export const log = (message: string) => {
  const time = new Date().toLocaleTimeString();
  console.log(`[${time}] ${message}`);
};
