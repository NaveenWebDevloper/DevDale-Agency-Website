import express, { Request, Response } from "express";
import User from "../models/User";
import Availability from "../models/Availability";
import { authenticate, requireAdmin } from "../middleware/authMiddleware";
import { hashPassword } from "../middleware/securityMiddleware";
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
 * GET /api/team (Admin Protected)
 * Lists all registered agency staff / team members
 */
router.get("/", authenticate, async (req: Request, res: Response) => {
  try {
    const team = await User.find().select("-password -refreshTokens").sort({ role: 1, name: 1 });
    res.json({ team });
  } catch (error) {
    console.error("[Team] Fetch error:", error);
    res.status(500).json({ error: "Failed to load team directory." });
  }
});

/**
 * POST /api/team (Admin Root Protected)
 * Registers a new staff member, hashes their password, and provisions default availability schedule
 */
router.post("/", authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, email, password, role = "TEAM_MEMBER" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ error: "An account with that email has already been registered." });
    }

    const { hash, salt } = hashPassword(password);
    const user = new User({
      name,
      email: email.toLowerCase().trim(),
      password: `${hash}:${salt}`,
      role,
      isLocked: false,
      loginAttempts: 0,
    });

    await user.save();

    // Provision default availability working days (Monday-Friday, 9:00 - 17:00 UTC)
    await Availability.create({
      userId: user._id,
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

    await logActivity(req.user?.id, "ONBOARD_TEAM_MEMBER", { newMemberId: user._id, email: user.email }, req);

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[Team] Create error:", error);
    res.status(500).json({ error: "Failed to onboard team member." });
  }
});

/**
 * DELETE /api/team/:id (Admin Root Protected)
 * Deletes team member and their corresponding availability records.
 * Note: Admins cannot delete their own profile.
 */
router.delete("/:id", authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const targetId = req.params.id;

    if (targetId === req.user?.id) {
      return res.status(400).json({ error: "Self-deletion block: You are not authorized to delete your active account." });
    }

    const user = await User.findById(targetId);
    if (!user) {
      return res.status(404).json({ error: "Team member account not found." });
    }

    // Delete user
    await User.findByIdAndDelete(targetId);
    
    // Delete corresponding availability schedules
    await Availability.findOneAndDelete({ userId: targetId });
    
    await logActivity(req.user?.id, "OFFBOARD_TEAM_MEMBER", { offboardedId: targetId, email: user.email }, req);

    res.json({ success: true, message: "Team member securely deleted and scheduling logs released." });
  } catch (error) {
    console.error("[Team] Delete error:", error);
    res.status(500).json({ error: "Failed to offboard team member." });
  }
});

export default router;
