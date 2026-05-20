import { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { handleSubmitForm } from "./routes/contact";
import { handleProjectRequest } from "./routes/projectRequest";

export function setupRoutes(app: Express) {
  // Health Check
  app.get("/api/ping", (_req: Request, res: Response) => {
    res.json({ message: "pong" });
  });

  // Agency Core: Form Handling
  app.post("/api/submit-form", handleSubmitForm);
  app.post("/api/project-request", handleProjectRequest);
}


export async function registerRoutes(app: Express): Promise<Server> {
  setupRoutes(app);
  
  const httpServer = createServer(app);
  return httpServer;
}
