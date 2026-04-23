import type { Express } from "express";
import { createServer, type Server } from "http";
import { handleSubmitForm } from "./routes/contact";

export function setupRoutes(app: Express) {
  // Health Check
  app.get("/api/ping", (_req, res) => res.json({ message: "pong" }));

  // Agency Core: Form Handling
  app.post("/api/submit-form", handleSubmitForm);
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupRoutes(app);
  
  const httpServer = createServer(app);
  return httpServer;
}
