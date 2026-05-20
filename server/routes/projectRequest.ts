import express from "express";
import { Resend } from "resend";
import Lead from "../models/Lead"; // Reusing Lead model for simplicity, or we could create a new ProjectRequest model
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_123");

export const handleProjectRequest = async (req: express.Request, res: express.Response) => {
  try {
    console.log("Incoming Project Request Data:", req.body);
    const data = req.body;

    // 1. Basic Validation (Backend fallback)
    if (!data.fullName || !data.email || !data.projectTitle || !data.description) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // 2. Save to MongoDB (Flattening some data for the Lead model if needed, or just save as is if model allows)
    // For now, let's just log it or save what fits. 
    // Ideally we'd have a separate model, but let's see Lead model.
    const newLead = new Lead({
      name: data.fullName,
      email: data.email,
      company: data.companyName || "N/A",
      message: `Project: ${data.projectTitle}\nType: ${data.projectType}\nDescription: ${data.description}\nFeatures: ${Array.isArray(data.features) ? data.features.join(", ") : data.features}\nPlatform: ${data.platform}\nBudget: ${data.budgetRange}\nTimeline: ${data.startDate} to ${data.deadline}\n\nAdditional Notes: ${data.additionalNotes}`,
      // In a real app, we'd add metadata for the other fields
    });
    
    await newLead.save();

    // 3. Trigger Emails via Resend
    const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@devdale.com";

    // Email to User
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: data.email,
        subject: "Project Strategy Received | DevDale Agency",
        html: `
          <div style="background-color: #000; padding: 40px 20px; font-family: sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 24px; padding: 50px;">
              <h1 style="color: #000; margin: 0; font-size: 28px; font-weight: 900;">DEVDALE</h1>
              <p style="font-size: 18px; color: #111; margin-top: 30px;">Hello ${data.fullName},</p>
              <p style="font-size: 16px; color: #444; line-height: 1.8;">We've received your project request for <strong>${data.projectTitle}</strong>.</p>
              <p style="font-size: 16px; color: #444; line-height: 1.8;">Our architects are already reviewing your requirements. We'll be in touch within 24 hours to schedule a deep-dive session.</p>
              <div style="margin-top: 40px; padding: 20px; background: #f9f9f9; border-radius: 12px;">
                <p style="margin: 0; font-size: 14px; color: #666;">Budget Range: ${data.budgetRange}</p>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Target Deadline: ${data.deadline}</p>
              </div>
            </div>
          </div>
        `,
      });
    } catch (e) {
      console.error("Failed to send user confirmation email", e);
    }

    // Email to Admin
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `🚀 NEW PROJECT: ${data.projectTitle} by ${data.fullName}`,
        html: `<pre>${JSON.stringify(data, null, 2)}</pre>`, // Simple for now
      });
    } catch (e) {
      console.error("Failed to send admin alert email", e);
    }

    return res.status(200).json({ message: "Project request submitted successfully!" });
  } catch (error: any) {
    console.error("Project Request Error:", error);
    return res.status(500).json({ 
      message: "Internal server error.",
      error: error?.message || String(error)
    });
  }
};
