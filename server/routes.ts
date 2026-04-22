import type { Express } from "express";
import { createServer, type Server } from "http";
import { handleSubmitForm } from "./routes/contact";

export async function registerRoutes(app: Express): Promise<Server> {
  // Agency Core: Form Handling
  app.post("/api/submit-form", handleSubmitForm);
  
  const httpServer = createServer(app);
  return httpServer;
}
