import express from "express";
import { setupRoutes } from "../server/routes";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize MongoDB inside the serverless function
const MONGO_URI = process.env.MONGO_URI;

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  if (!MONGO_URI) {
    console.error("MONGO_URI is missing in environment variables");
    return;
  }
  try {
    await mongoose.connect(MONGO_URI);
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

// Export the app for Vercel
export default app;
