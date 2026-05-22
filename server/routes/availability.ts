import express, { Request, Response } from "express";
import Availability from "../models/Availability";
import BlockedDate from "../models/BlockedDate";
import Service from "../models/Service";
import { AvailabilityEngine, normalizeToUTCDate } from "../services/availabilityEngine";
import { authenticate } from "../middleware/authMiddleware";
import ActivityLog from "../models/ActivityLog";
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
 * GET /api/availability/slots (Public)
 * Retrieves available slots for booking widget DatePicker
 * Query parameters: serviceId (or slug), date (YYYY-MM-DD), timezone
 */
router.get("/slots", async (req: Request, res: Response) => {
  try {
    const { serviceId, serviceSlug, date, timezone = "UTC" } = req.query;

    if (!date) {
      return res.status(400).json({ error: "Date parameter is required (format: YYYY-MM-DD)." });
    }

    let service = null;
    if (serviceId) {
      service = await Service.findById(serviceId);
    } else if (serviceSlug) {
      service = await Service.findOne({ slug: serviceSlug });
    }

    if (!service || !service.isEnabled) {
      return res.status(404).json({ error: "Selected service could not be located or is currently disabled." });
    }

    // Retrieve slots using dynamic engine
    const slots = await AvailabilityEngine.getAvailableSlots(service, date as string, timezone as string);
    res.json({ slots });
  } catch (error) {
    console.error("[Availability] Slots error:", error);
    res.status(500).json({ error: "Failed to generate dynamic slot grid." });
  }
});

/**
 * GET /api/availability/setup (Admin Protected)
 * Loads availability rules for authenticated team member
 */
router.get("/setup", authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    let availability = await Availability.findOne({ userId });

    // Fallback seed in case it was missed
    if (!availability) {
      availability = await Availability.create({
        userId: new mongoose.Types.ObjectId(userId),
        timezone: "UTC",
        workingDays: [
          { day: 1, slots: [{ start: "09:00", end: "17:00" }] },
          { day: 2, slots: [{ start: "09:00", end: "17:00" }] },
          { day: 3, slots: [{ start: "09:00", end: "17:00" }] },
          { day: 4, slots: [{ start: "09:00", end: "17:00" }] },
          { day: 5, slots: [{ start: "09:00", end: "17:00" }] },
        ],
        bookingLimitsPerDay: 6,
      });
    }

    res.json({ availability });
  } catch (error) {
    console.error("[Availability] Get setup error:", error);
    res.status(500).json({ error: "Failed to load availability configurations." });
  }
});

/**
 * PUT /api/availability/setup (Admin Protected)
 * Updates working schedule rules, timezone, limits
 */
router.put("/setup", authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { timezone, workingDays, bookingLimitsPerDay } = req.body;

    const availability = await Availability.findOneAndUpdate(
      { userId },
      {
        $set: {
          timezone,
          workingDays,
          bookingLimitsPerDay,
        },
      },
      { new: true, upsert: true }
    );

    await logActivity(req.user?.id, "UPDATE_AVAILABILITY", { timezone, bookingLimitsPerDay }, req);

    res.json({ success: true, availability });
  } catch (error) {
    console.error("[Availability] Put setup error:", error);
    res.status(500).json({ error: "Failed to update availability schedule configurations." });
  }
});

/**
 * GET /api/availability/blocked-dates (Public / Admin)
 * Lists all active calendar blocks
 */
router.get("/blocked-dates", async (req: Request, res: Response) => {
  try {
    const blocks = await BlockedDate.find().sort({ date: 1 });
    res.json({ blockedDates: blocks });
  } catch (error) {
    console.error("[Availability] Blocked dates error:", error);
    res.status(500).json({ error: "Failed to fetch blocked dates feed." });
  }
});

/**
 * POST /api/availability/blocked-dates (Admin Protected)
 * Provisions new calendar blackouts / holidays
 */
router.post("/blocked-dates", authenticate, async (req: Request, res: Response) => {
  try {
    const { date, reason, isGlobal = true } = req.body;

    if (!date) {
      return res.status(400).json({ error: "Blockout date is required." });
    }

    const normalized = normalizeToUTCDate(date);

    // Prevent duplicate blockout entries
    const existing = await BlockedDate.findOne({
      date: normalized,
      userId: isGlobal ? undefined : new mongoose.Types.ObjectId(req.user?.id),
    });

    if (existing) {
      return res.status(400).json({ error: "This date has already been registered in the calendar blockouts." });
    }

    const block = new BlockedDate({
      date: normalized,
      reason,
      isGlobal,
      userId: isGlobal ? undefined : new mongoose.Types.ObjectId(req.user?.id),
    });

    await block.save();
    await logActivity(req.user?.id, "CREATE_BLOCKED_DATE", { date: normalized, reason }, req);

    res.status(201).json({ success: true, block });
  } catch (error) {
    console.error("[Availability] Block creation error:", error);
    res.status(500).json({ error: "Failed to provision calendar block." });
  }
});

/**
 * DELETE /api/availability/blocked-dates/:id (Admin Protected)
 * Deletes calendar blackout / releases slot back to pool
 */
router.delete("/blocked-dates/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const block = await BlockedDate.findById(req.params.id);
    
    if (!block) {
      return res.status(404).json({ error: "Blocked date calendar entry not found." });
    }

    // Role safety: TEAM_MEMBER can only delete blocks they created
    if (req.user?.role !== "ADMIN" && block.userId?.toString() !== req.user?.id) {
      return res.status(403).json({ error: "Forbidden: You are only authorized to release your own custom blockouts." });
    }

    await BlockedDate.findByIdAndDelete(req.params.id);
    await logActivity(req.user?.id, "DELETE_BLOCKED_DATE", { date: block.date }, req);

    res.json({ success: true, message: "Calendar date blackout released back to open pools." });
  } catch (error) {
    console.error("[Availability] Block delete error:", error);
    res.status(500).json({ error: "Failed to remove calendar blockout." });
  }
});

export default router;
