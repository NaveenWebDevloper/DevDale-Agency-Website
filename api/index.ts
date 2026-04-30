import express from "express";
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

// Initialize MongoDB inside the serverless function
const MONGO_URI = process.env.MONGO_URI;

let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) return;
  
  if (!MONGO_URI) {
    console.error("MONGO_URI is missing in environment variables");
    return;
  }

  try {
    const opts = {
      bufferCommands: false,
    };
    await mongoose.connect(MONGO_URI, opts);
    isConnected = true;
    console.log("Connected to MongoDB via Serverless Function");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
};

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  if (req.path.startsWith("/api")) {
    await connectDB();
  }
  next();
});

// Register routes (API handlers)
setupRoutes(app);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("API Error:", err);
  res.status(500).json({ 
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined 
  });
});

// Export the app for Vercel
export default app;

