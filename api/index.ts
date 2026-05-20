import express from "express";
import serverless from "serverless-http";
import { Resend } from "resend";
import Lead from "../server/models/Lead";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- DB Connection (cached across warm invocations) ---
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
    isConnected = false;
    throw err;
  }
};

// Ensure DB is connected before handling any request
app.use(async (_req, res, next) => {
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

// Helper to read env vars
const FROM_EMAIL = () => process.env.FROM_EMAIL || "hello@thedevdale.com";
const ADMIN_EMAIL = () => process.env.ADMIN_EMAIL || "devdaleagency@gmail.com";
const getResend = () => new Resend(process.env.RESEND_API_KEY || "re_mock_123");

// ─── Health Check ───────────────────────────────────────────
app.get("/api/ping", (_req, res) => {
  res.json({ message: "pong" });
});

// ─── DB Status ──────────────────────────────────────────────
app.get("/api/db-status", (_req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json({
    status: states[mongoose.connection.readyState],
    readyState: mongoose.connection.readyState,
    mongoUri: process.env.MONGO_URI ? "SET" : "MISSING",
    resendKey: process.env.RESEND_API_KEY ? "SET" : "MISSING",
    fromEmail: process.env.FROM_EMAIL || "NOT SET",
    adminEmail: process.env.ADMIN_EMAIL || "NOT SET",
  });
});

// ─── Contact Form ────────────────────────────────────────────
app.post("/api/submit-form", async (req, res) => {
  try {
    console.log("[Contact] Incoming data:", req.body);
    const { name, email, company, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, Email, and Message are required." });
    }

    // Save to DB
    const newLead = new Lead({ name, email, company, message });
    await newLead.save();
    console.log("[Contact] Lead saved to DB");

    const resend = getResend();
    const fromEmail = FROM_EMAIL();
    const adminEmail = ADMIN_EMAIL();

    // Email to user
    try {
      const { error } = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: "Phase 1: Project Inquiry Received | DevDale Agency",
        html: `
          <div style="background-color:#000;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
            <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;">
              <div style="background:#000;padding:60px 40px;text-align:center;">
                <h1 style="color:#fff;margin:0;font-size:32px;font-weight:900;letter-spacing:-2px;text-transform:uppercase;">DEVDALE</h1>
                <p style="color:#666;font-size:10px;font-weight:700;letter-spacing:4px;margin-top:12px;text-transform:uppercase;">Strategic Digital Architecture</p>
              </div>
              <div style="padding:50px 40px;">
                <p style="font-size:18px;color:#111;line-height:1.6;margin-top:0;">Hello <strong>${name}</strong>,</p>
                <p style="font-size:16px;color:#444;line-height:1.8;">Your vision has reached our engineering lab. We are currently analyzing the requirements for ${company ? `<strong>${company}</strong>` : 'your project'}.</p>
                <p style="font-size:16px;color:#444;line-height:1.8;">A lead architect will reach out to you within <strong>24 hours</strong> to discuss the next phase of development.</p>
                <div style="margin-top:60px;padding-top:40px;border-top:1px solid #eee;text-align:center;">
                  <p style="font-size:11px;color:#aaa;margin:0;letter-spacing:1px;font-weight:600;">© 2026 DEVDALE AGENCY. ALL SYSTEMS OPTIMIZED.</p>
                </div>
              </div>
            </div>
          </div>
        `,
      });
      if (error) console.error("[Contact] Resend user email error:", error);
      else console.log("[Contact] User confirmation email sent");
    } catch (e: any) {
      console.error("[Contact] Failed to send user email:", e.message);
    }

    // Email to admin
    try {
      const { error } = await resend.emails.send({
        from: fromEmail,
        to: adminEmail,
        subject: `🚨 MISSION ALERT: ${name} (${company || "Indie"})`,
        html: `
          <div style="background-color:#f4f4f4;padding:40px 20px;font-family:-apple-system,sans-serif;">
            <div style="max-width:600px;margin:0 auto;background:#fff;border:3px solid #000;padding:50px;">
              <h2 style="margin:0;font-weight:900;text-transform:uppercase;font-size:24px;">NEW LEAD</h2>
              <table style="width:100%;border-collapse:collapse;margin-top:30px;">
                <tr><td style="padding:15px 0;border-bottom:1px solid #eee;color:#888;font-size:12px;text-transform:uppercase;font-weight:700;">Client</td><td style="padding:15px 0;border-bottom:1px solid #eee;font-weight:800;text-align:right;">${name}</td></tr>
                <tr><td style="padding:15px 0;border-bottom:1px solid #eee;color:#888;font-size:12px;text-transform:uppercase;font-weight:700;">Company</td><td style="padding:15px 0;border-bottom:1px solid #eee;font-weight:800;text-align:right;">${company || "N/A"}</td></tr>
                <tr><td style="padding:15px 0;border-bottom:1px solid #eee;color:#888;font-size:12px;text-transform:uppercase;font-weight:700;">Email</td><td style="padding:15px 0;border-bottom:1px solid #eee;font-weight:800;text-align:right;">${email}</td></tr>
              </table>
              <div style="margin-top:40px;">
                <p style="font-size:11px;color:#888;text-transform:uppercase;margin-bottom:12px;font-weight:900;">Message</p>
                <div style="background:#000;color:#fff;padding:30px;line-height:1.8;font-size:15px;border-radius:4px;">${message}</div>
              </div>
            </div>
          </div>
        `,
      });
      if (error) console.error("[Contact] Resend admin email error:", error);
      else console.log("[Contact] Admin alert sent to", adminEmail);
    } catch (e: any) {
      console.error("[Contact] Failed to send admin email:", e.message);
    }

    return res.status(200).json({ message: "Form submitted successfully!" });
  } catch (err: any) {
    console.error("[Contact] Error:", err.message);
    return res.status(500).json({ message: "Internal server error.", error: err.message });
  }
});

// ─── Project Request ─────────────────────────────────────────
app.post("/api/project-request", async (req, res) => {
  try {
    console.log("[ProjectRequest] Incoming data:", req.body);
    const data = req.body;

    if (!data.fullName || !data.email || !data.projectTitle || !data.description) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const newLead = new Lead({
      name: data.fullName,
      email: data.email,
      company: data.companyName || "N/A",
      message: `Project: ${data.projectTitle}\nType: ${data.projectType}\nDescription: ${data.description}\nFeatures: ${Array.isArray(data.features) ? data.features.join(", ") : data.features}\nPlatform: ${data.platform}\nBudget: ${data.budgetRange}\nTimeline: ${data.startDate} to ${data.deadline}\n\nAdditional Notes: ${data.additionalNotes}`,
    });
    await newLead.save();
    console.log("[ProjectRequest] Lead saved to DB");

    const resend = getResend();
    const fromEmail = FROM_EMAIL();
    const adminEmail = ADMIN_EMAIL();

    try {
      await resend.emails.send({
        from: fromEmail,
        to: data.email,
        subject: "Project Strategy Received | DevDale Agency",
        html: `<div style="background:#000;padding:40px 20px;font-family:sans-serif;"><div style="max-width:600px;margin:0 auto;background:#fff;border-radius:24px;padding:50px;"><h1 style="color:#000;font-size:28px;font-weight:900;">DEVDALE</h1><p style="font-size:18px;color:#111;margin-top:30px;">Hello ${data.fullName},</p><p style="font-size:16px;color:#444;line-height:1.8;">We've received your project request for <strong>${data.projectTitle}</strong>. Our architects are already reviewing your requirements and will be in touch within 24 hours.</p></div></div>`,
      });
    } catch (e: any) {
      console.error("[ProjectRequest] Failed to send user email:", e.message);
    }

    try {
      await resend.emails.send({
        from: fromEmail,
        to: adminEmail,
        subject: `🚀 NEW PROJECT: ${data.projectTitle} by ${data.fullName}`,
        html: `<pre style="font-family:monospace;background:#f9f9f9;padding:20px;">${JSON.stringify(data, null, 2)}</pre>`,
      });
    } catch (e: any) {
      console.error("[ProjectRequest] Failed to send admin email:", e.message);
    }

    return res.status(200).json({ message: "Project request submitted successfully!" });
  } catch (err: any) {
    console.error("[ProjectRequest] Error:", err.message);
    return res.status(500).json({ message: "Internal server error.", error: err.message });
  }
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[Global Error]", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: err.message,
  });
});

// Export as Vercel serverless handler
export default serverless(app);
