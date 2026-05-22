import express, { Request, Response } from "express";
import Notification from "../models/Notification";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

/**
 * GET /api/notifications (Admin Protected)
 * Lists latest 30 notifications for the staff header tray
 */
router.get("/", authenticate, async (req: Request, res: Response) => {
  try {
    const unreadCount = await Notification.countDocuments({ isRead: false });
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(30);

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error("[Notifications] Fetch error:", error);
    res.status(500).json({ error: "Failed to load notifications stream." });
  }
});

/**
 * PATCH /api/notifications (Admin Protected)
 * Marks all notifications as read
 */
router.patch("/mark-all-read", authenticate, async (req: Request, res: Response) => {
  try {
    await Notification.updateMany({ isRead: false }, { $set: { isRead: true } });
    res.json({ success: true, message: "All system alerts marked as read." });
  } catch (error) {
    console.error("[Notifications] Mark all read error:", error);
    res.status(500).json({ error: "Failed to clear notifications tray." });
  }
});

/**
 * PATCH /api/notifications/:id (Admin Protected)
 * Marks a single notification as read
 */
router.patch("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification entry not found." });
    }

    res.json({ success: true, notification });
  } catch (error) {
    console.error("[Notifications] Update error:", error);
    res.status(500).json({ error: "Failed to mark system alert as read." });
  }
});

export default router;
