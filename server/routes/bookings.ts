import express, { Request, Response } from "express";
import Booking from "../models/Booking";
import Service from "../models/Service";
import Lead from "../models/Lead";
import User from "../models/User";
import Notification from "../models/Notification";
import ActivityLog from "../models/ActivityLog";
import { AvailabilityEngine, normalizeToUTCDate } from "../services/availabilityEngine";
import { CalendarService } from "../services/calendarService";
import { EmailService } from "../services/emailService";
import { authenticate, requireAdmin } from "../middleware/authMiddleware";
import mongoose from "mongoose";

const router = express.Router();

/**
 * Helper to record activity logs
 */
async function logActivity(userId: string | undefined, action: string, details: any, req: Request) {
  try {
    await ActivityLog.create({
      userId,
      action,
      details,
      ipAddress: req.ip || req.socket?.remoteAddress,
      userAgent: req.headers["user-agent"],
    });
  } catch (err) {
    console.error("[ActivityLog] Error:", err);
  }
}

/**
 * Helper to trigger real-time notifications for admins
 */
async function createNotification(title: string, message: string, type: "BOOKING_NEW" | "BOOKING_CANCELLED" | "LEAD_NEW" | "SYSTEM") {
  try {
    await Notification.create({ title, message, type });
  } catch (err) {
    console.error("[Notification] Error:", err);
  }
}

/**
 * Helper: Build Google Calendar event times from date + timeSlot + duration
 */
function buildEventTimes(dateStr: string, timeSlot: string, durationMinutes: number) {
  const targetDate = new Date(`${dateStr}T00:00:00Z`);
  const startHour = parseInt(timeSlot.split(":")[0], 10);
  const startMin = parseInt(timeSlot.split(":")[1], 10);

  const startDateTime = new Date(Date.UTC(
    targetDate.getUTCFullYear(),
    targetDate.getUTCMonth(),
    targetDate.getUTCDate(),
    startHour,
    startMin,
    0
  ));

  const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);

  return { targetDate, startDateTime, endDateTime };
}

/**
 * GET /api/bookings (Admin Protected)
 * Supports filters: status, search (name/email/company), date range, pagination
 */
router.get("/", authenticate, async (req: Request, res: Response) => {
  try {
    const { status, search, startDate, endDate, page = "1", limit = "10" } = req.query;

    const query: any = {};

    // Apply role-based visibility: TEAM_MEMBER can only see bookings assigned to them (optional request level rule)
    if (req.user?.role === "TEAM_MEMBER") {
      query.userId = new mongoose.Types.ObjectId(req.user.id);
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      query.$or = [
        { customerName: searchRegex },
        { customerEmail: searchRegex },
        { customerCompany: searchRegex },
        { notes: searchRegex },
      ];
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = normalizeToUTCDate(startDate as string);
      if (endDate) query.date.$lte = normalizeToUTCDate(endDate as string);
    }

    const p = parseInt(page as string, 10);
    const l = parseInt(limit as string, 10);

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate("serviceId", "name duration price meetingType colorTag")
      .populate("userId", "name email")
      .sort({ date: 1, timeSlot: 1 })
      .skip((p - 1) * l)
      .limit(l);

    res.json({
      bookings,
      pagination: {
        total,
        page: p,
        limit: l,
        pages: Math.ceil(total / l),
      },
    });
  } catch (error) {
    console.error("[Bookings] Fetch error:", error);
    res.status(500).json({ error: "Failed to fetch bookings list." });
  }
});

/**
 * GET /api/bookings/export (Admin Protected - CSV format)
 */
router.get("/export", authenticate, async (req: Request, res: Response) => {
  try {
    const query: any = {};
    if (req.user?.role === "TEAM_MEMBER") {
      query.userId = new mongoose.Types.ObjectId(req.user.id);
    }

    const bookings = await Booking.find(query)
      .populate("serviceId", "name")
      .populate("userId", "name")
      .sort({ date: -1, timeSlot: -1 });

    let csv = "ID,Customer Name,Customer Email,Company,Service,Date,Time Slot,Status,Budget,Project Type,Meet Link,Created At\n";
    
    for (const b of bookings) {
      const formattedDate = new Date(b.date).toISOString().split("T")[0];
      const serviceName = b.serviceId ? (b.serviceId as any).name : "Unknown";
      
      csv += `"${b._id}","${b.customerName}","${b.customerEmail}","${b.customerCompany || ""}","${serviceName}","${formattedDate}","${b.timeSlot}","${b.status}","${b.budgetRange || ""}","${b.projectType || ""}","${b.googleMeetLink || ""}","${b.createdAt.toISOString()}"\n`;
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=bookings_export.csv");
    res.status(200).send(csv);
  } catch (error) {
    console.error("[Bookings] CSV Export error:", error);
    res.status(500).json({ error: "Failed to generate CSV export." });
  }
});

/**
 * GET /api/bookings/:id (Admin Protected)
 */
router.get("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("serviceId")
      .populate("userId", "name email");

    if (!booking) {
      return res.status(404).json({ error: "Booking not found." });
    }

    res.json({ booking });
  } catch (error) {
    console.error("[Bookings] Single fetch error:", error);
    res.status(500).json({ error: "Failed to load booking details." });
  }
});

/**
 * POST /api/bookings (Public Endpoint - Client Booking Flow)
 * 
 * Full pipeline:
 *  1. Validate inputs & availability
 *  2. Create booking in MongoDB  
 *  3. Create Google Calendar event with Meet link & send invitation
 *  4. Auto-register CRM lead
 *  5. Send email confirmations via Resend
 *  6. Push admin notifications & activity logs
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      serviceId,
      customerName,
      customerEmail,
      customerCompany,
      budgetRange,
      projectType,
      notes,
      date, // YYYY-MM-DD
      timeSlot, // HH:MM
      utmSource,
      utmMedium,
      utmCampaign,
    } = req.body;

    // 1. Basic validation
    if (!serviceId || !customerName || !customerEmail || !date || !timeSlot) {
      return res.status(400).json({ error: "Required fields are missing." });
    }

    const service = await Service.findById(serviceId);
    if (!service || !service.isEnabled) {
      return res.status(404).json({ error: "Selected service is unavailable or disabled." });
    }

    // 2. Validate availability using the Engine
    const slots = await AvailabilityEngine.getAvailableSlots(service, date, "UTC");
    const matchedSlot = slots.find((s) => s.time === timeSlot);

    if (!matchedSlot || !matchedSlot.available) {
      return res.status(409).json({ error: "The selected time slot is no longer available. Please select another slot." });
    }

    // Determine host assigned (default to first availability profile)
    let assignedUserId: mongoose.Types.ObjectId | undefined = undefined;
    const defaultAvail = await mongoose.model("Availability").findOne();
    if (defaultAvail) {
      assignedUserId = defaultAvail.userId;
    }

    // 3. Create Booking Document in MongoDB
    const { targetDate, startDateTime, endDateTime } = buildEventTimes(date, timeSlot, service.duration);

    const booking = new Booking({
      serviceId: service._id,
      userId: assignedUserId,
      customerName,
      customerEmail: customerEmail.toLowerCase().trim(),
      customerCompany,
      budgetRange,
      projectType,
      notes,
      date: normalizeToUTCDate(targetDate),
      timeSlot,
      status: "Confirmed",
      duration: service.duration,
      utmSource,
      utmMedium,
      utmCampaign,
    });

    // 4. Create Google Calendar event with Meet link
    const summary = `${service.name} Briefing: ${customerName} & DevDale`;
    const description = [
      `Service: ${service.name}`,
      `Client: ${customerName} (${customerEmail})`,
      `Organization: ${customerCompany || "N/A"}`,
      `Project Type: ${projectType || "N/A"}`,
      `Budget: ${budgetRange || "N/A"}`,
      ``,
      `Notes: ${notes || "None"}`,
      ``,
      `Synchronized by DevDale Agency OS.`,
    ].join("\n");

    const calResult = await CalendarService.createEvent({
      summary,
      description,
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
      attendeeEmail: customerEmail,
      attendeeName: customerName,
    });

    booking.googleEventId = calResult.googleEventId;
    booking.googleMeetLink = calResult.googleMeetLink;

    await booking.save();

    // 5. Auto-register CRM Lead
    let leadObj = null;
    let leadScore = 20;
    if (budgetRange && budgetRange !== "Under $5k") leadScore += 30;
    if (projectType) leadScore += 20;
    if (notes && notes.length > 50) leadScore += 20;
    if (customerCompany) leadScore += 10;

    const existingLead = await Lead.findOne({ email: customerEmail.toLowerCase().trim() });
    if (!existingLead) {
      leadObj = await Lead.create({
        name: customerName,
        email: customerEmail.toLowerCase().trim(),
        company: customerCompany,
        message: notes || `Auto-captured through Booking Flow for service: ${service.name}`,
        status: "New",
        score: leadScore,
        assignedTo: assignedUserId,
        budgetRange,
        projectType,
        utmSource,
        utmMedium,
        utmCampaign,
        activityTimeline: [
          {
            action: "LEAD_CAPTURED",
            note: `Lead auto-provisioned via secure appointment booking for ${service.name}.`,
            timestamp: new Date(),
          },
        ],
      });

      await EmailService.sendNewLeadNotification(leadObj);
      await createNotification(
        "New CRM Lead Registered",
        `${customerName} from ${customerCompany || "Indie"} auto-captured via booking.`,
        "LEAD_NEW"
      );
    } else {
      existingLead.activityTimeline.push({
        action: "NOTE_ADDED",
        note: `Customer booked service: ${service.name} for slot ${date} ${timeSlot}.`,
        timestamp: new Date(),
      });
      await existingLead.save();
    }

    // 6. Send email confirmations via Resend
    await EmailService.sendBookingConfirmation(booking, service);

    // 7. Push admin notifications & activity logs
    await createNotification(
      "New Appointment Scheduled",
      `${customerName} booked ${service.name} for ${date} at ${timeSlot}.`,
      "BOOKING_NEW"
    );
    await logActivity(undefined, "CREATE_BOOKING", { bookingId: booking._id, customerEmail }, req);

    console.log(`[Bookings] ✅ Booking created: ${booking._id} | Meet: ${booking.googleMeetLink} | Real: ${calResult.isReal}`);

    res.status(201).json({
      success: true,
      booking,
      meetingLink: booking.googleMeetLink,
    });
  } catch (error) {
    console.error("[Bookings] Public booking creation exception:", error);
    res.status(500).json({ error: "System error: Failed to provision booking reservation." });
  }
});

/**
 * POST /api/bookings/:id/reschedule (Public/Client or Admin Reschedule Flow)
 */
router.post("/:id/reschedule", async (req: Request, res: Response) => {
  try {
    const { date, timeSlot, rescheduleReason } = req.body;

    if (!date || !timeSlot) {
      return res.status(400).json({ error: "New date and timeSlot are required." });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking session not found." });
    }

    const service = await Service.findById(booking.serviceId);
    if (!service) {
      return res.status(404).json({ error: "Associated service model not found." });
    }

    // Keep old details for email comparison
    const oldDetails = {
      date: booking.date,
      timeSlot: booking.timeSlot,
    };

    // 1. Verify availability
    const slots = await AvailabilityEngine.getAvailableSlots(service, date, "UTC", booking.userId?.toString());
    const matchedSlot = slots.find((s) => s.time === timeSlot);

    if (!matchedSlot || !matchedSlot.available) {
      return res.status(409).json({ error: "The newly selected slot is unavailable." });
    }

    // 2. Build new event times
    const { targetDate, startDateTime, endDateTime } = buildEventTimes(date, timeSlot, service.duration);

    const summary = `[RESCHEDULED] ${service.name} Briefing: ${booking.customerName} & DevDale`;
    const description = [
      `Service: ${service.name} (Rescheduled)`,
      `Client: ${booking.customerName} (${booking.customerEmail})`,
      `Reason: ${rescheduleReason || "N/A"}`,
      ``,
      `Updated by DevDale Agency OS.`,
    ].join("\n");

    // 3. Update or recreate Google Calendar event
    const existingEventId = booking.googleEventId || booking.googleCalendarEventId;
    let calResult;

    if (existingEventId && !existingEventId.startsWith("mock-")) {
      // Try to update the existing event (preserves Meet link, sends update notifications)
      calResult = await CalendarService.updateEvent(existingEventId, {
        summary,
        description,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        attendeeEmail: booking.customerEmail,
        attendeeName: booking.customerName,
      });
    } else {
      // Delete old mock/event and create fresh
      if (existingEventId) {
        await CalendarService.deleteEvent(existingEventId);
      }
      calResult = await CalendarService.createEvent({
        summary,
        description,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        attendeeEmail: booking.customerEmail,
        attendeeName: booking.customerName,
      });
    }

    // 4. Update booking in MongoDB
    booking.date = normalizeToUTCDate(targetDate);
    booking.timeSlot = timeSlot;
    booking.status = "Rescheduled";
    booking.rescheduleReason = rescheduleReason;
    booking.duration = service.duration;
    booking.googleEventId = calResult.googleEventId;
    booking.googleMeetLink = calResult.googleMeetLink;

    await booking.save();

    // Update Lead CRM activity if exists
    const lead = await Lead.findOne({ email: booking.customerEmail });
    if (lead) {
      lead.activityTimeline.push({
        action: "STATUS_CHANGED",
        note: `Meeting rescheduled to ${date} at ${timeSlot}. Reason: ${rescheduleReason || "none"}`,
        timestamp: new Date(),
      });
      await lead.save();
    }

    // 5. Send rescheduled notification emails via Resend
    await EmailService.sendBookingRescheduled(booking, service, oldDetails);

    // 6. Log & Notify
    await createNotification(
      "Booking Rescheduled",
      `${booking.customerName} changed schedule to ${date} at ${timeSlot}.`,
      "SYSTEM"
    );
    await logActivity(req.user?.id, "RESCHEDULE_BOOKING", { bookingId: booking._id, oldDetails }, req);

    res.json({
      success: true,
      booking,
      meetingLink: booking.googleMeetLink,
    });
  } catch (error) {
    console.error("[Bookings] Reschedule error:", error);
    res.status(500).json({ error: "Failed to process appointment reschedule." });
  }
});

/**
 * POST /api/bookings/:id/cancel (Public/Client or Admin Cancellation Flow)
 */
router.post("/:id/cancel", async (req: Request, res: Response) => {
  try {
    const { cancellationReason } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking session not found." });
    }

    const service = await Service.findById(booking.serviceId);
    if (!service) {
      return res.status(404).json({ error: "Service model not found." });
    }

    // 1. Delete Google Calendar Event (sends cancellation emails to attendees)
    const eventId = booking.googleEventId || booking.googleCalendarEventId;
    if (eventId) {
      await CalendarService.deleteEvent(eventId);
    }

    // 2. Set cancellation status in MongoDB
    booking.status = "Cancelled";
    booking.cancellationReason = cancellationReason;
    await booking.save();

    // Update CRM Lead activity if exists
    const lead = await Lead.findOne({ email: booking.customerEmail });
    if (lead) {
      lead.activityTimeline.push({
        action: "STATUS_CHANGED",
        note: `Meeting CANCELLED. Reason: ${cancellationReason || "none"}`,
        timestamp: new Date(),
      });
      await lead.save();
    }

    // 3. Dispatch transactional cancel alerts via EmailService (Resend)
    await EmailService.sendBookingCancelled(booking, service);

    // 4. Push log feeds & dashboard updates
    await createNotification(
      "Appointment Cancelled",
      `${booking.customerName} cancelled session on ${booking.date.toISOString().split("T")[0]}.`,
      "BOOKING_CANCELLED"
    );
    await logActivity(req.user?.id, "CANCEL_BOOKING", { bookingId: booking._id, cancellationReason }, req);

    res.json({
      success: true,
      message: "Appointment successfully cancelled. Notifications dispatched.",
      booking,
    });
  } catch (error) {
    console.error("[Bookings] Cancellation error:", error);
    res.status(500).json({ error: "Failed to process appointment cancellation." });
  }
});

/**
 * PATCH /api/bookings/:id (Admin Edit - status updates, team assignment, logs)
 */
router.patch("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    
    // Whitelist administrative updates
    const allowedFields = ["status", "userId", "notes"];
    const queryUpdates: any = {};
    
    for (const key of Object.keys(updates)) {
      if (allowedFields.includes(key)) {
        if (key === "userId" && updates[key]) {
          queryUpdates[key] = new mongoose.Types.ObjectId(updates[key]);
        } else {
          queryUpdates[key] = updates[key];
        }
      }
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: queryUpdates },
      { new: true }
    ).populate("serviceId").populate("userId", "name email");

    if (!booking) {
      return res.status(404).json({ error: "Booking session not found." });
    }

    await logActivity(req.user?.id, "UPDATE_BOOKING_ADMIN", { bookingId: booking._id, updates: queryUpdates }, req);

    res.json({ success: true, booking });
  } catch (error) {
    console.error("[Bookings] Admin update error:", error);
    res.status(500).json({ error: "Failed to modify booking record." });
  }
});

/**
 * DELETE /api/bookings/:id (Admin Root Protected)
 */
router.delete("/:id", authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found." });
    }

    // Delete calendar event before deleting document
    const eventId = booking.googleEventId || booking.googleCalendarEventId;
    if (eventId) {
      await CalendarService.deleteEvent(eventId);
    }

    await Booking.findByIdAndDelete(req.params.id);
    await logActivity(req.user?.id, "DELETE_BOOKING_ADMIN", { bookingId: req.params.id, customerName: booking.customerName }, req);

    res.json({ success: true, message: "Booking securely deleted from system archives." });
  } catch (error) {
    console.error("[Bookings] Admin delete error:", error);
    res.status(500).json({ error: "Failed to remove booking archives." });
  }
});

export default router;
