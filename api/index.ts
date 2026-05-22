import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { setupRoutes } from "../server/routes";
import { seedDatabase } from "../server/utils/seed";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Warm-start DB connection
let isConnected = false;

async function connectDB(): Promise<void> {
  if (isConnected && mongoose.connection.readyState === 1) return;

  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) throw new Error("MONGO_URI is not set in environment variables.");

  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  isConnected = true;
  console.log("[DB] Connected to MongoDB via Serverless Wrapper");
  
  // Run database seeding if empty
  await seedDatabase();
}

// CORS Middleware to handle headers and pre-flights
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  next();
});

// Custom request logging to match local server style
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      console.log(`[Serverless] ${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

// Setup all modular Express routes
setupRoutes(app);

// Serverless Handler
export default async function handler(req: any, res: any) {
  // Establish / verify DB connection
  try {
    await connectDB();
  } catch (err: any) {
    console.error("[DB Error] Connection failed:", err.message);
  }

  // Delegate processing to Express app
  return app(req, res);
}
