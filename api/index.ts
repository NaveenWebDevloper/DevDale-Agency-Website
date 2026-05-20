import express from "express";
import serverless from "serverless-http";
import { setupRoutes } from "../server/routes";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- DB Connection (cached for warm Lambda / Vercel serverless) ---
let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) return;

  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error("[DB] MONGO_URI environment variable is NOT set on Vercel!");
    throw new Error("MONGO_URI is not configured in environment variables.");
  }

  try {
    await mongoose.connect(MONGO_URI, { bufferCommands: false });
    isConnected = true;
    console.log("[DB] Connected to MongoDB via Serverless Function");
  } catch (err: any) {
    console.error("[DB] MongoDB connection error:", err.message);
    throw err; // Re-throw so the route handler returns 500 with context
  }
};

// Ensure DB is connected before any /api route is handled
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err: any) {
    console.error("[Middleware] DB connection failed:", err.message);
    res.status(500).json({
      message: "Database connection failed. Please try again later.",
      error: err.message,
    });
  }
});

// Register all API routes
setupRoutes(app);

// Global Error Handler — always surface the error message for debugging
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[Global Error]", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Export as Vercel serverless handler
export default serverless(app);
