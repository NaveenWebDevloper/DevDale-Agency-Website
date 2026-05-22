import express, { Request, Response } from "express";
import ActivityLog from "../models/ActivityLog";
import { authenticate, requireAdmin } from "../middleware/authMiddleware";

const router = express.Router();

/**
 * GET /api/activity-logs (Admin Protected)
 * Lists system audit logs, paginated, for visual security verification
 */
router.get("/", authenticate, async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "20" } = req.query;

    const p = parseInt(page as string, 10);
    const l = parseInt(limit as string, 10);

    const total = await ActivityLog.countDocuments();
    const logs = await ActivityLog.find()
      .populate("userId", "name role email")
      .sort({ createdAt: -1 })
      .skip((p - 1) * l)
      .limit(l);

    res.json({
      logs,
      pagination: {
        total,
        page: p,
        limit: l,
        pages: Math.ceil(total / l),
      },
    });
  } catch (error) {
    console.error("[ActivityLogs] Fetch error:", error);
    res.status(500).json({ error: "Failed to load system audit trails." });
  }
});

export default router;
