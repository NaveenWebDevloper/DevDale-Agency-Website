import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY || "mock_key");
const FROM_EMAIL = process.env.FROM_EMAIL || "hello@thedevdale.com";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "devdaleagency@gmail.com";

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  /**
   * General-purpose send mail function. Gracefully logs and returns boolean representing outcome.
   */
  private static async sendEmail({ to, subject, html }: EmailParams): Promise<boolean> {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes("mock")) {
      console.log(`[EmailService] [MOCK SEND] To: ${to} | Subject: ${subject}`);
      return true;
    }

    try {
      const response = await resend.emails.send({
        from: `DevDale Agency <${FROM_EMAIL}>`,
        to,
        subject,
        html,
      });

      if (response.error) {
        console.error("[EmailService] Resend API Error:", response.error);
        return false;
      }

      console.log(`[EmailService] Email sent successfully to ${to}. ID: ${response.data?.id}`);
      return true;
    } catch (error) {
      console.error("[EmailService] Exception during email send:", error);
      return false;
    }
  }

  /**
   * Premium monochrome wrapper template (inspired by Linear & Stripe)
   */
  private static wrapTemplate(title: string, innerHtml: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background-color: #fcfcfc;
            color: #111111;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .wrapper {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
            box-sizing: border-box;
          }
          .container {
            background-color: #ffffff;
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            padding: 32px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
          }
          .header {
            margin-bottom: 32px;
            border-bottom: 1px solid #f0f0f0;
            padding-bottom: 20px;
          }
          .logo {
            font-size: 20px;
            font-weight: 700;
            letter-spacing: -0.03em;
            color: #000000;
            text-decoration: none;
            display: inline-block;
          }
          .title {
            font-size: 22px;
            font-weight: 600;
            letter-spacing: -0.02em;
            margin-top: 16px;
            margin-bottom: 8px;
            color: #111111;
          }
          .content {
            font-size: 15px;
            line-height: 1.6;
            color: #444444;
          }
          .meta-box {
            background-color: #f7f7f7;
            border: 1px solid #ececec;
            border-radius: 6px;
            padding: 20px;
            margin: 24px 0;
          }
          .meta-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 14px;
          }
          .meta-row:last-child {
            margin-bottom: 0;
          }
          .meta-label {
            font-weight: 500;
            color: #666666;
            width: 120px;
          }
          .meta-value {
            color: #111111;
            font-weight: 600;
            text-align: right;
            flex-grow: 1;
          }
          .button {
            display: inline-block;
            background-color: #000000;
            color: #ffffff !important;
            text-decoration: none;
            font-weight: 500;
            font-size: 14px;
            padding: 12px 24px;
            border-radius: 6px;
            margin-top: 16px;
            text-align: center;
            letter-spacing: -0.01em;
            transition: background-color 0.2s ease;
          }
          .button:hover {
            background-color: #222222;
          }
          .footer {
            margin-top: 32px;
            font-size: 12px;
            color: #888888;
            border-top: 1px solid #f0f0f0;
            padding-top: 20px;
            line-height: 1.5;
          }
          .signature {
            font-weight: 600;
            color: #222222;
            margin-bottom: 4px;
          }
          @media (prefers-color-scheme: dark) {
            body {
              background-color: #000000;
              color: #f3f4f6;
            }
            .container {
              background-color: #0a0a0a;
              border-color: #1f1f1f;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
            }
            .header {
              border-bottom-color: #1a1a1a;
            }
            .logo {
              color: #ffffff;
            }
            .title {
              color: #ffffff;
            }
            .content {
              color: #a1a1aa;
            }
            .meta-box {
              background-color: #121212;
              border-color: #1c1c1e;
            }
            .meta-label {
              color: #a1a1aa;
            }
            .meta-value {
              color: #ffffff;
            }
            .button {
              background-color: #ffffff;
              color: #000000 !important;
            }
            .button:hover {
              background-color: #e4e4e7;
            }
            .footer {
              border-top-color: #1a1a1a;
              color: #71717a;
            }
            .signature {
              color: #e4e4e7;
            }
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <a href="https://thedevdale.com" class="logo">DEVDALE</a>
            </div>
            <div class="content">
              ${innerHtml}
            </div>
            <div class="footer">
              <div class="signature">DevDale Agency OS</div>
              <div>Delivering elite engineering, designs, and growth.</div>
              <div>This is an automated operational transmission. Please do not reply directly.</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Customer booking confirmation
   */
  static async sendBookingConfirmation(booking: any, service: any): Promise<boolean> {
    const formattedDate = new Date(booking.date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });

    const innerHtml = `
      <div class="title">Booking Confirmed</div>
      <p>Hello ${booking.customerName},</p>
      <p>Your session with DevDale has been officially scheduled. A calendar event containing meeting access coordinates has been provisioned.</p>
      
      <div class="meta-box">
        <div class="meta-row">
          <div class="meta-label">Service</div>
          <div class="meta-value">${service.name}</div>
        </div>
        <div class="meta-row">
          <div class="meta-label">Date</div>
          <div class="meta-value">${formattedDate}</div>
        </div>
        <div class="meta-row">
          <div class="meta-label">Time</div>
          <div class="meta-value">${booking.timeSlot} (Host Local)</div>
        </div>
        <div class="meta-row">
          <div class="meta-label">Duration</div>
          <div class="meta-value">${service.duration} mins</div>
        </div>
        <div class="meta-row">
          <div class="meta-label">Format</div>
          <div class="meta-value">${service.meetingType}</div>
        </div>
      </div>

      <p>To join the virtual briefing, use the secure link below:</p>
      <a href="${booking.googleMeetLink}" class="button" target="_blank">Join Meeting</a>

      <p style="margin-top: 24px;">Need to reschedule or cancel? Log in to your booking interface or click your calendar invitation details.</p>
    `;

    const html = this.wrapTemplate("Booking Confirmed — DevDale", innerHtml);
    
    // Send to customer
    const sentCustomer = await this.sendEmail({
      to: booking.customerEmail,
      subject: `Confirmed: ${service.name} with DevDale`,
      html,
    });

    // Notify admins/team in background
    await this.sendAdminBookingNotification(booking, service, "NEW");

    return sentCustomer;
  }

  /**
   * Reschedule notification
   */
  static async sendBookingRescheduled(booking: any, service: any, oldDetails: { date: Date; timeSlot: string }): Promise<boolean> {
    const formattedNewDate = new Date(booking.date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });

    const formattedOldDate = new Date(oldDetails.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });

    const innerHtml = `
      <div class="title">Meeting Rescheduled</div>
      <p>Hello ${booking.customerName},</p>
      <p>Your appointment has been successfully updated. The previous block has been released and a new calendar slot has been provisioned.</p>
      
      <div class="meta-box">
        <div class="meta-row">
          <div class="meta-label">Service</div>
          <div class="meta-value">${service.name}</div>
        </div>
        <div class="meta-row">
          <div class="meta-label">Old Schedule</div>
          <div class="meta-value" style="text-decoration: line-through; color: #a1a1aa;">${formattedOldDate} at ${oldDetails.timeSlot}</div>
        </div>
        <div class="meta-row">
          <div class="meta-label">New Date</div>
          <div class="meta-value">${formattedNewDate}</div>
        </div>
        <div class="meta-row">
          <div class="meta-label">New Time</div>
          <div class="meta-value">${booking.timeSlot} (Host Local)</div>
        </div>
        <div class="meta-row">
          <div class="meta-label">Reason</div>
          <div class="meta-value">${booking.rescheduleReason || "Requested change"}</div>
        </div>
      </div>

      <p>Your secure virtual connection remains active. Access meeting coordinates below:</p>
      <a href="${booking.googleMeetLink}" class="button" target="_blank">Join Meeting</a>
    `;

    const html = this.wrapTemplate("Meeting Rescheduled — DevDale", innerHtml);
    
    const sentCustomer = await this.sendEmail({
      to: booking.customerEmail,
      subject: `Rescheduled: ${service.name} with DevDale`,
      html,
    });

    // Notify admins
    await this.sendAdminBookingNotification(booking, service, "RESCHEDULED", oldDetails);

    return sentCustomer;
  }

  /**
   * Cancellation notification
   */
  static async sendBookingCancelled(booking: any, service: any): Promise<boolean> {
    const formattedDate = new Date(booking.date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });

    const innerHtml = `
      <div class="title">Booking Cancelled</div>
      <p>Hello ${booking.customerName},</p>
      <p>Your booking with DevDale has been cancelled. The reserved slot has been released back into the availability pool.</p>
      
      <div class="meta-box">
        <div class="meta-row">
          <div class="meta-label">Service</div>
          <div class="meta-value">${service.name}</div>
        </div>
        <div class="meta-row">
          <div class="meta-label">Original Date</div>
          <div class="meta-value">${formattedDate}</div>
        </div>
        <div class="meta-row">
          <div class="meta-label">Original Time</div>
          <div class="meta-value">${booking.timeSlot}</div>
        </div>
        <div class="meta-row">
          <div class="meta-label">Reason</div>
          <div class="meta-value">${booking.cancellationReason || "No reason specified"}</div>
        </div>
      </div>

      <p>If you'd like to select a new date or book another session, please visit our booking portal.</p>
      <a href="https://thedevdale.com/book" class="button">Book New Session</a>
    `;

    const html = this.wrapTemplate("Booking Cancelled — DevDale", innerHtml);

    const sentCustomer = await this.sendEmail({
      to: booking.customerEmail,
      subject: `Cancelled: ${service.name} with DevDale`,
      html,
    });

    // Notify admins
    await this.sendAdminBookingNotification(booking, service, "CANCELLED");

    return sentCustomer;
  }

  /**
   * Admin booking updates
   */
  private static async sendAdminBookingNotification(
    booking: any, 
    service: any, 
    type: "NEW" | "RESCHEDULED" | "CANCELLED",
    oldDetails?: { date: Date; timeSlot: string }
  ): Promise<boolean> {
    const formattedDate = new Date(booking.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });

    let subject = `[Agency OS] Booking ${type}: ${booking.customerName} - ${service.name}`;
    let messageBody = "";

    if (type === "NEW") {
      messageBody = `
        <div class="title">New Client Booking</div>
        <p>A new briefing has been scheduled through the booking module.</p>
        
        <div class="meta-box">
          <div class="meta-row">
            <div class="meta-label">Client</div>
            <div class="meta-value">${booking.customerName} (${booking.customerEmail})</div>
          </div>
          <div class="meta-row">
            <div class="meta-label">Company</div>
            <div class="meta-value">${booking.customerCompany || "Not specified"}</div>
          </div>
          <div class="meta-row">
            <div class="meta-label">Service</div>
            <div class="meta-value">${service.name}</div>
          </div>
          <div class="meta-row">
            <div class="meta-label">Schedule</div>
            <div class="meta-value">${formattedDate} at ${booking.timeSlot}</div>
          </div>
          <div class="meta-row">
            <div class="meta-label">Budget</div>
            <div class="meta-value">${booking.budgetRange || "Not specified"}</div>
          </div>
          <div class="meta-row">
            <div class="meta-label">Project Type</div>
            <div class="meta-value">${booking.projectType || "Not specified"}</div>
          </div>
        </div>
        <p><strong>Client Notes:</strong> ${booking.notes || "None"}</p>
        <a href="https://thedevdale.com/admin/bookings" class="button">Manage Booking</a>
      `;
    } else if (type === "RESCHEDULED" && oldDetails) {
      const formattedOldDate = new Date(oldDetails.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      });
      messageBody = `
        <div class="title">Booking Rescheduled</div>
        <p>Client ${booking.customerName} has rescheduled their session.</p>
        
        <div class="meta-box">
          <div class="meta-row">
            <div class="meta-label">Client</div>
            <div class="meta-value">${booking.customerName}</div>
          </div>
          <div class="meta-row">
            <div class="meta-label">Service</div>
            <div class="meta-value">${service.name}</div>
          </div>
          <div class="meta-row">
            <div class="meta-label">Previous Time</div>
            <div class="meta-value">${formattedOldDate} at ${oldDetails.timeSlot}</div>
          </div>
          <div class="meta-row">
            <div class="meta-label">New Time</div>
            <div class="meta-value">${formattedDate} at ${booking.timeSlot}</div>
          </div>
          <div class="meta-row">
            <div class="meta-label">Reason</div>
            <div class="meta-value">${booking.rescheduleReason || "Not specified"}</div>
          </div>
        </div>
        <a href="https://thedevdale.com/admin/bookings" class="button">Manage Booking</a>
      `;
    } else {
      messageBody = `
        <div class="title">Booking Cancelled</div>
        <p>A scheduled meeting was cancelled by the client.</p>
        
        <div class="meta-box">
          <div class="meta-row">
            <div class="meta-label">Client</div>
            <div class="meta-value">${booking.customerName} (${booking.customerEmail})</div>
          </div>
          <div class="meta-row">
            <div class="meta-label">Service</div>
            <div class="meta-value">${service.name}</div>
          </div>
          <div class="meta-row">
            <div class="meta-label">Cancelled Date</div>
            <div class="meta-value">${formattedDate} at ${booking.timeSlot}</div>
          </div>
          <div class="meta-row">
            <div class="meta-label">Reason</div>
            <div class="meta-value">${booking.cancellationReason || "Not specified"}</div>
          </div>
        </div>
        <a href="https://thedevdale.com/admin/bookings" class="button">View Bookings Dashboard</a>
      `;
    }

    const html = this.wrapTemplate(subject, messageBody);

    return this.sendEmail({
      to: ADMIN_EMAIL,
      subject,
      html,
    });
  }

  /**
   * New CRM Lead Notification
   */
  static async sendNewLeadNotification(lead: any): Promise<boolean> {
    const subject = `[Agency OS CRM] New Enterprise Lead: ${lead.name} (${lead.company || "No Company"})`;
    
    const innerHtml = `
      <div class="title">New Lead Captured</div>
      <p>A new prospect has submitted details on the DevDale portal. The profile has been registered in the CRM pipeline.</p>
      
      <div class="meta-box">
        <div class="meta-row">
          <div class="meta-label">Prospect Name</div>
          <div class="meta-value">${lead.name}</div>
        </div>
        <div class="meta-row">
          <div class="meta-label">Email Address</div>
          <div class="meta-value">${lead.email}</div>
        </div>
        <div class="meta-row">
          <div class="meta-label">Company</div>
          <div class="meta-value">${lead.company || "Not specified"}</div>
        </div>
        <div class="meta-row">
          <div class="meta-label">Budget</div>
          <div class="meta-value">${lead.budgetRange || "Not specified"}</div>
        </div>
        <div class="meta-row">
          <div class="meta-label">Project Type</div>
          <div class="meta-value">${lead.projectType || "Not specified"}</div>
        </div>
        <div class="meta-row">
          <div class="meta-label">Lead Score</div>
          <div class="meta-value">${lead.score} / 100</div>
        </div>
      </div>

      <p><strong>Message Context:</strong></p>
      <blockquote style="border-left: 3px solid #000000; padding-left: 12px; margin-left: 0; color: #555555; font-style: italic;">
        ${lead.message}
      </blockquote>

      <p style="margin-top: 24px;">Assign a team member and score this lead immediately via the Agency CRM module.</p>
      <a href="https://thedevdale.com/admin/leads" class="button">Launch CRM Interface</a>
    `;

    const html = this.wrapTemplate(subject, innerHtml);

    return this.sendEmail({
      to: ADMIN_EMAIL,
      subject,
      html,
    });
  }
}
