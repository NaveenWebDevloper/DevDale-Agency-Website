import express from "express";
import { Resend } from "resend";
import Lead from "../models/Lead";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_123");

export const handleSubmitForm = async (req: express.Request, res: express.Response) => {

  try {
    console.log("Incoming Lead Data:", req.body);
    const { name, email, company, message } = req.body;

    // 1. Basic Validation
    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, Email, and Message are required." });
    }

    // 2. Save to MongoDB
    const newLead = new Lead({ name, email, company, message });
    await newLead.save();

    // 3. Trigger Emails via Resend
    const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";
    
    // Email 1: To User (Thank You)
    try {
      console.log(`Sending user confirmation from: ${FROM_EMAIL}`);
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: "Phase 1: Project Inquiry Received | DevDale Agency",
        html: `
          <div style="background-color: #000; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden;">
              <div style="background: #000; padding: 60px 40px; text-align: center;">
                <h1 style="color: #fff; margin: 0; font-size: 32px; font-weight: 900; letter-spacing: -2px; text-transform: uppercase;">DEVDALE</h1>
                <p style="color: #666; font-size: 10px; font-weight: 700; letter-spacing: 4px; margin-top: 12px; text-transform: uppercase;">Strategic Digital Architecture</p>
              </div>
              <div style="padding: 50px 40px;">
                <p style="font-size: 18px; color: #111; line-height: 1.6; margin-top: 0;">Hello <strong>${name}</strong>,</p>
                <p style="font-size: 16px; color: #444; line-height: 1.8;">Your vision has reached our engineering lab. We are currently analyzing the requirements for ${company ? `<strong>${company}</strong>` : 'your project'}.</p>
                
                <div style="margin: 40px 0; padding: 30px; background: #f9f9f9; border-left: 6px solid #000; border-radius: 0 16px 16px 0;">
                  <p style="margin: 0; font-size: 15px; color: #666; font-style: italic; line-height: 1.6;">"At DevDale, we don't just build software; we architect the infrastructure of tomorrow."</p>
                </div>

                <p style="font-size: 16px; color: #444; line-height: 1.8;">A lead architect will reach out to you within <strong>24 hours</strong> to discuss the next phase of development.</p>
                
                <div style="margin-top: 60px; padding-top: 40px; border-top: 1px solid #eee; text-align: center;">
                  <p style="font-size: 11px; color: #aaa; margin: 0; letter-spacing: 1px; font-weight: 600;">© 2026 DEVDALE AGENCY. ALL SYSTEMS OPTIMIZED.</p>
                </div>
              </div>
            </div>
          </div>
        `,
      });
      if (error) console.error("Resend Error (User Email):", JSON.stringify(error, null, 2));
      else console.log("User Email Sent Successfully!");
    } catch (emailError) {
      console.error("Resend Exception (User Email):", emailError);
    }

    // Email 2: To Admin (Lead Alert)
    try {
      const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@devdale.com";
      console.log(`Sending admin alert from: ${FROM_EMAIL}`);
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `🚨 MISSION ALERT: ${name} (${company || "Indie"})`,
        html: `
          <div style="background-color: #f4f4f4; padding: 40px 20px; font-family: -apple-system, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: #fff; border: 3px solid #000; padding: 50px; box-shadow: 20px 20px 0 rgba(0,0,0,0.05);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 2px solid #000; padding-bottom: 20px;">
                <h2 style="margin: 0; font-weight: 900; text-transform: uppercase; font-size: 24px;">NEW LEAD</h2>
                <div style="background: #000; color: #fff; padding: 6px 15px; font-size: 11px; font-weight: 900; letter-spacing: 1px;">PRIORITY: ALPHA</div>
              </div>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #eee; color: #888; font-size: 12px; text-transform: uppercase; font-weight: 700;">Client</td>
                  <td style="padding: 15px 0; border-bottom: 1px solid #eee; font-weight: 800; text-align: right; font-size: 16px;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #eee; color: #888; font-size: 12px; text-transform: uppercase; font-weight: 700;">Organization</td>
                  <td style="padding: 15px 0; border-bottom: 1px solid #eee; font-weight: 800; text-align: right; font-size: 16px;">${company || "Confidential"}</td>
                </tr>
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #eee; color: #888; font-size: 12px; text-transform: uppercase; font-weight: 700;">Channel</td>
                  <td style="padding: 15px 0; border-bottom: 1px solid #eee; font-weight: 800; text-align: right; font-size: 16px;">${email}</td>
                </tr>
              </table>

              <div style="margin-top: 40px;">
                <p style="font-size: 11px; color: #888; text-transform: uppercase; margin-bottom: 12px; font-weight: 900; letter-spacing: 1px;">Project Brief</p>
                <div style="background: #000; color: #fff; padding: 30px; line-height: 1.8; font-size: 15px; border-radius: 4px;">
                  ${message}
                </div>
              </div>

              <div style="margin-top: 50px; text-align: center;">
                <p style="font-size: 10px; color: #ccc; text-transform: uppercase; letter-spacing: 3px; font-weight: bold;">DevDale Lead Capture Protocol V2.0</p>
              </div>
            </div>
          </div>
        `,
      });
      if (error) console.error("Resend Error (Admin Email):", JSON.stringify(error, null, 2));
      else console.log("Admin Alert Dispatched!");
    } catch (emailError) {
      console.error("Resend Exception (Admin Email):", emailError);
    }

    return res.status(200).json({ message: "Form submitted successfully!" });
  } catch (error: any) {
    console.error("Database Error:", error);
    return res.status(500).json({ 
      message: "Internal server error. Please try again later.",
      error: error?.message || String(error)
    });
  }
};
