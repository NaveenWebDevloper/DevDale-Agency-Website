import express, { type Request, Response, NextFunction } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import mongoose from "mongoose";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let resSent = false;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (resSent) {
        logLine += ` (sent after response finish)`;
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  log("Starting server initialization...");

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Check if we are in production
  const isProduction = process.env.NODE_ENV === "production" || !fs.existsSync(path.resolve(__dirname, "..", "client", "main.tsx"));

  if (isProduction) {
    serveStatic(app);
  } else {
    await setupVite(app, server);
  }

  const port = Number(process.env.PORT) || 5000;
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
  });

  // Database: Connect in background so it doesn't block startup
  const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/devdale_agency";
  log("Connecting to infrastructure...");
  mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => log("Infrastructure connected: MongoDB Protocol established"))
    .catch(err => log(`Infrastructure error: ${err}`));
})();
