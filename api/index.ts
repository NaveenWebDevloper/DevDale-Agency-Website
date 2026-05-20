// Vercel-native serverless handler — no Express, no serverless-http
// This avoids all Express 5 / serverless-http compatibility issues
import mongoose, { Schema, Document } from "mongoose";
import { Resend } from "resend";

// ─── Inline Lead Model (avoids relative-import bundling issues) ───────────────
interface ILead extends Document {
  name: string;
  email: string;
  company?: string;
  message: string;
  createdAt: Date;
}

const LeadSchema = new Schema<ILead>({
  name:      { type: String, required: true },
  email:     { type: String, required: true },
  company:   { type: String },
  message:   { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Lead = mongoose.models?.Lead || mongoose.model<ILead>("Lead", LeadSchema);

// ─── DB Connection (cached across warm invocations) ──────────────────────────
let isConnected = false;

async function connectDB(): Promise<void> {
  if (isConnected && mongoose.connection.readyState === 1) return;

  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) throw new Error("MONGO_URI is not set in environment variables.");

  await mongoose.connect(MONGO_URI, { bufferCommands: false });
  isConnected = true;
  console.log("[DB] Connected to MongoDB");
}

// ─── Email helpers ────────────────────────────────────────────────────────────
const getResend  = () => new Resend(process.env.RESEND_API_KEY || "re_mock_123");
const FROM_EMAIL = () => process.env.FROM_EMAIL  || "hello@thedevdale.com";
const ADMIN_EMAIL = () => process.env.ADMIN_EMAIL || "devdaleagency@gmail.com";

// ─── JSON helpers ─────────────────────────────────────────────────────────────
function jsonRes(res: any, status: number, body: object) {
  res.status(status).json(body);
}

async function readBody(req: any): Promise<any> {
  return new Promise((resolve, reject) => {
    // On Vercel, req.body is already parsed when Content-Type is application/json
    if (req.body !== undefined) { resolve(req.body); return; }
    let raw = "";
    req.on("data", (chunk: any) => (raw += chunk));
    req.on("end", () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch { resolve({}); }
    });
    req.on("error", reject);
  });
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const url: string = req.url || "";
  const method: string = (req.method || "GET").toUpperCase();

  console.log(`[Handler] ${method} ${url}`);

  // ── Health Check ────────────────────────────────────────────────────────────
  if (url.startsWith("/api/ping")) {
    return jsonRes(res, 200, { message: "pong" });
  }

  // ── DB Status (for debugging env vars) ─────────────────────────────────────
  if (url.startsWith("/api/db-status")) {
    return jsonRes(res, 200, {
      mongoUri:   process.env.MONGO_URI   ? "SET" : "MISSING",
      resendKey:  process.env.RESEND_API_KEY ? "SET" : "MISSING",
      fromEmail:  process.env.FROM_EMAIL  || "NOT SET",
      adminEmail: process.env.ADMIN_EMAIL || "NOT SET",
      dbState:    ["disconnected","connected","connecting","disconnecting"][mongoose.connection.readyState],
    });
  }

  // ── Contact Form ────────────────────────────────────────────────────────────
  if (url.startsWith("/api/submit-form") && method === "POST") {
    try {
      await connectDB();
      const body = await readBody(req);
      const { name, email, company, message } = body;

      if (!name || !email || !message) {
        return jsonRes(res, 400, { message: "Name, Email, and Message are required." });
      }

      await Lead.create({ name, email, company, message });
      console.log("[Contact] Lead saved");

      const resend    = getResend();
      const fromEmail = FROM_EMAIL();
      const adminEmail = ADMIN_EMAIL();

      // User confirmation email
      try {
        const { error } = await resend.emails.send({
          from: fromEmail,
          to: email,
          subject: "Phase 1: Project Inquiry Received | DevDale Agency",
          html: `
            <div style="background:#000;padding:40px 20px;font-family:sans-serif;">
              <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden;">
                <div style="background:#000;padding:60px 40px;text-align:center;">
                  <h1 style="color:#fff;margin:0;font-size:32px;font-weight:900;text-transform:uppercase;">DEVDALE</h1>
                  <p style="color:#666;font-size:10px;letter-spacing:4px;text-transform:uppercase;">Strategic Digital Architecture</p>
                </div>
                <div style="padding:50px 40px;">
                  <p style="font-size:18px;color:#111;">Hello <strong>${name}</strong>,</p>
                  <p style="font-size:16px;color:#444;line-height:1.8;">Your vision has reached our engineering lab. We are currently analyzing the requirements for ${company ? `<strong>${company}</strong>` : "your project"}.</p>
                  <p style="font-size:16px;color:#444;line-height:1.8;">A lead architect will reach out within <strong>24 hours</strong>.</p>
                  <div style="margin-top:60px;padding-top:40px;border-top:1px solid #eee;text-align:center;">
                    <p style="font-size:11px;color:#aaa;letter-spacing:1px;">© 2026 DEVDALE AGENCY.</p>
                  </div>
                </div>
              </div>
            </div>`,
        });
        if (error) console.error("[Contact] User email error:", error);
      } catch (e: any) {
        console.error("[Contact] User email exception:", e.message);
      }

      // Admin alert email
      try {
        const { error } = await resend.emails.send({
          from: fromEmail,
          to: adminEmail,
          subject: `🚨 NEW LEAD: ${name} (${company || "Indie"})`,
          html: `
            <div style="background:#f4f4f4;padding:40px 20px;font-family:sans-serif;">
              <div style="max-width:600px;margin:0 auto;background:#fff;border:3px solid #000;padding:50px;">
                <h2 style="font-weight:900;text-transform:uppercase;">NEW LEAD</h2>
                <table style="width:100%;border-collapse:collapse;margin-top:20px;">
                  <tr><td style="padding:12px 0;border-bottom:1px solid #eee;color:#888;font-size:12px;text-transform:uppercase;">Client</td><td style="text-align:right;font-weight:800;">${name}</td></tr>
                  <tr><td style="padding:12px 0;border-bottom:1px solid #eee;color:#888;font-size:12px;text-transform:uppercase;">Company</td><td style="text-align:right;font-weight:800;">${company || "N/A"}</td></tr>
                  <tr><td style="padding:12px 0;border-bottom:1px solid #eee;color:#888;font-size:12px;text-transform:uppercase;">Email</td><td style="text-align:right;font-weight:800;">${email}</td></tr>
                </table>
                <div style="margin-top:30px;">
                  <p style="font-size:11px;color:#888;text-transform:uppercase;font-weight:900;">Message</p>
                  <div style="background:#000;color:#fff;padding:20px;line-height:1.8;border-radius:4px;">${message}</div>
                </div>
              </div>
            </div>`,
        });
        if (error) console.error("[Contact] Admin email error:", error);
        else console.log("[Contact] Admin alert sent to", adminEmail);
      } catch (e: any) {
        console.error("[Contact] Admin email exception:", e.message);
      }

      return jsonRes(res, 200, { message: "Form submitted successfully!" });
    } catch (err: any) {
      console.error("[Contact] Fatal error:", err.message);
      return jsonRes(res, 500, { message: "Internal server error.", error: err.message });
    }
  }

  // ── Project Request ─────────────────────────────────────────────────────────
  if (url.startsWith("/api/project-request") && method === "POST") {
    try {
      await connectDB();
      const data = await readBody(req);

      if (!data.fullName || !data.email || !data.projectTitle || !data.description) {
        return jsonRes(res, 400, { message: "Missing required fields." });
      }

      await Lead.create({
        name:    data.fullName,
        email:   data.email,
        company: data.companyName || "N/A",
        message: `Project: ${data.projectTitle}\nType: ${data.projectType}\nDescription: ${data.description}\nFeatures: ${Array.isArray(data.features) ? data.features.join(", ") : data.features}\nPlatform: ${data.platform}\nBudget: ${data.budgetRange}\nTimeline: ${data.startDate} to ${data.deadline}\n\nAdditional Notes: ${data.additionalNotes}`,
      });
      console.log("[ProjectRequest] Lead saved");

      const resend    = getResend();
      const fromEmail = FROM_EMAIL();
      const adminEmail = ADMIN_EMAIL();

      try {
        await resend.emails.send({
          from: fromEmail,
          to: data.email,
          subject: "Project Strategy Received | DevDale Agency",
          html: `<div style="background:#000;padding:40px;font-family:sans-serif;"><div style="max-width:600px;margin:0 auto;background:#fff;border-radius:24px;padding:50px;"><h1 style="color:#000;font-size:28px;font-weight:900;">DEVDALE</h1><p style="font-size:18px;margin-top:30px;">Hello ${data.fullName},</p><p style="font-size:16px;color:#444;line-height:1.8;">We've received your project request for <strong>${data.projectTitle}</strong>. Our architects are reviewing it and will be in touch within 24 hours.</p></div></div>`,
        });
      } catch (e: any) {
        console.error("[ProjectRequest] User email failed:", e.message);
      }

      try {
        await resend.emails.send({
          from: fromEmail,
          to: adminEmail,
          subject: `🚀 NEW PROJECT: ${data.projectTitle} by ${data.fullName}`,
          html: `<pre style="font-family:monospace;background:#f9f9f9;padding:20px;white-space:pre-wrap;">${JSON.stringify(data, null, 2)}</pre>`,
        });
      } catch (e: any) {
        console.error("[ProjectRequest] Admin email failed:", e.message);
      }

      return jsonRes(res, 200, { message: "Project request submitted successfully!" });
    } catch (err: any) {
      console.error("[ProjectRequest] Fatal error:", err.message);
      return jsonRes(res, 500, { message: "Internal server error.", error: err.message });
    }
  }

  // ── 404 fallback ────────────────────────────────────────────────────────────
  return jsonRes(res, 404, { message: `Route not found: ${method} ${url}` });
}
