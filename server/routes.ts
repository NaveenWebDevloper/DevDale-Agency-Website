import { Application, Request, Response } from "express";
import { createServer, type Server } from "http";
import { handleSubmitForm } from "./routes/contact";
import { handleProjectRequest } from "./routes/projectRequest";
import { securityHeaders } from "./middleware/securityMiddleware";

// Import modular API routers
import authRouter from "./routes/auth";
import bookingsRouter from "./routes/bookings";
import availabilityRouter from "./routes/availability";
import servicesRouter from "./routes/services";
import leadsRouter from "./routes/leads";
import teamRouter from "./routes/team";
import analyticsRouter from "./routes/analytics";
import notificationsRouter from "./routes/notifications";
import activityLogsRouter from "./routes/activityLogs";

import mongoose from "mongoose";

export function setupRoutes(app: Application) {
  // Apply security headers across all operational pathways
  app.use(securityHeaders);

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

  // Core Modular Gateways
  app.use("/api/auth", authRouter);
  app.use("/api/bookings", bookingsRouter);
  app.use("/api/availability", availabilityRouter);
  app.use("/api/services", servicesRouter);
  app.use("/api/leads", leadsRouter);
  app.use("/api/team", teamRouter);
  app.use("/api/analytics", analyticsRouter);
  app.use("/api/notifications", notificationsRouter);
  app.use("/api/activity-logs", activityLogsRouter);

  // Agency Core Legacy: Form Handling
  app.post("/api/submit-form", handleSubmitForm);
  app.post("/api/project-request", handleProjectRequest);
}


export async function registerRoutes(app: Application): Promise<Server> {
  setupRoutes(app);
  
  const httpServer = createServer(app);
  return httpServer;
}
