import { Application, Request, Response } from "express";
import { createServer, type Server } from "http";
import { handleSubmitForm } from "./routes/contact";
import { handleProjectRequest } from "./routes/projectRequest";

import mongoose from "mongoose";

export function setupRoutes(app: Application) {
  // Health Check
  app.get("/api/ping", (_req: Request, res: Response) => {
    res.json({ message: "pong" });
  });

  // Database Diagnostic Check
  app.get("/api/db-status", (_req: Request, res: Response) => {
    const states = ["disconnected", "connected", "connecting", "disconnecting"];
    res.json({
      status: states[mongoose.connection.readyState],
      readyState: mongoose.connection.readyState,
      dbName: mongoose.connection.name
    });
  });

  // Agency Core: Form Handling
  app.post("/api/submit-form", handleSubmitForm);
  app.post("/api/project-request", handleProjectRequest);
}


export async function registerRoutes(app: Application): Promise<Server> {
  setupRoutes(app);
  
  const httpServer = createServer(app);
  return httpServer;
}
