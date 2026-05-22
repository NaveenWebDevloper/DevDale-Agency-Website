import express, { Request, Response } from "express";
import Service from "../models/Service";
import { authenticate, requireAdmin } from "../middleware/authMiddleware";
import ActivityLog from "../models/ActivityLog";

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
 * GET /api/services (Public & Admin)
 * Returns all services. Public queries receive enabled-only. Admins receive all.
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const { all } = req.query;
    
    let query: any = { isEnabled: true };
    
    // If requesting all (admin dashboard contexts)
    if (all === "true") {
      query = {};
    }

    const services = await Service.find(query).sort({ price: 1, duration: 1 });
    res.json({ services });
  } catch (error) {
    console.error("[Services] Fetch error:", error);
    res.status(500).json({ error: "Failed to load services database." });
  }
});

/**
 * GET /api/services/:id
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: "Service configuration not found." });
    }
    res.json({ service });
  } catch (error) {
    console.error("[Services] Single fetch error:", error);
    res.status(500).json({ error: "Failed to load service configuration." });
  }
});

/**
 * POST /api/services (Admin Root Protected)
 * Creates a brand new agency service offering
 */
router.post("/", authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, duration, description, price, meetingType, colorTag, bufferTime, isEnabled } = req.body;

    if (!name || !duration) {
      return res.status(400).json({ error: "Service name and duration are required." });
    }

    // Auto-generate slug
    const slug = name.toLowerCase().trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const existing = await Service.findOne({ slug });
    if (existing) {
      return res.status(400).json({ error: "A service with a similar name already exists." });
    }

    const service = new Service({
      name,
      slug,
      duration,
      description,
      price,
      meetingType,
      colorTag,
      bufferTime,
      isEnabled,
    });

    await service.save();
    await logActivity(req.user?.id, "CREATE_SERVICE", { serviceId: service._id, name }, req);

    res.status(201).json({ success: true, service });
  } catch (error) {
    console.error("[Services] Create error:", error);
    res.status(500).json({ error: "Failed to create service offering." });
  }
});

/**
 * PUT /api/services/:id (Admin Root Protected)
 * Modifies an existing agency service offering
 */
router.put("/:id", authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, duration, description, price, meetingType, colorTag, bufferTime, isEnabled } = req.body;

    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: "Service not found." });
    }

    // Update fields
    if (name) {
      service.name = name;
      service.slug = name.toLowerCase().trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }
    
    if (duration !== undefined) service.duration = duration;
    if (description !== undefined) service.description = description;
    if (price !== undefined) service.price = price;
    if (meetingType) service.meetingType = meetingType;
    if (colorTag) service.colorTag = colorTag;
    if (bufferTime !== undefined) service.bufferTime = bufferTime;
    if (isEnabled !== undefined) service.isEnabled = isEnabled;

    await service.save();
    await logActivity(req.user?.id, "UPDATE_SERVICE", { serviceId: service._id, name: service.name }, req);

    res.json({ success: true, service });
  } catch (error) {
    console.error("[Services] Update error:", error);
    res.status(500).json({ error: "Failed to update service configurations." });
  }
});

/**
 * DELETE /api/services/:id (Admin Root Protected)
 * Securely deletes an agency service offering
 */
router.delete("/:id", authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: "Service not found." });
    }

    await Service.findByIdAndDelete(req.params.id);
    await logActivity(req.user?.id, "DELETE_SERVICE", { serviceId: req.params.id, name: service.name }, req);

    res.json({ success: true, message: "Service successfully decommissioned from booking systems." });
  } catch (error) {
    console.error("[Services] Delete error:", error);
    res.status(500).json({ error: "Failed to delete service offering." });
  }
});

export default router;
