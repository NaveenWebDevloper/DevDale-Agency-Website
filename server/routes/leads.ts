import express, { Request, Response } from "express";
import Lead, { ILeadActivity } from "../models/Lead";
import { authenticate, requireAdmin } from "../middleware/authMiddleware";
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
 * GET /api/leads (Admin Protected)
 * Supports search, status filter, scoring range filter, and pagination
 */
router.get("/", authenticate, async (req: Request, res: Response) => {
  try {
    const { status, search, minScore, assignedTo, page = "1", limit = "10" } = req.query;

    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (assignedTo) {
      query.assignedTo = new mongoose.Types.ObjectId(assignedTo as string);
    }

    if (minScore) {
      query.score = { $gte: parseInt(minScore as string, 10) };
    }

    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { company: searchRegex },
        { message: searchRegex },
        { notes: searchRegex },
      ];
    }

    const p = parseInt(page as string, 10);
    const l = parseInt(limit as string, 10);

    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .populate("assignedTo", "name email")
      .sort({ score: -1, createdAt: -1 })
      .skip((p - 1) * l)
      .limit(l);

    res.json({
      leads,
      pagination: {
        total,
        page: p,
        limit: l,
        pages: Math.ceil(total / l),
      },
    });
  } catch (error) {
    console.error("[Leads] Fetch error:", error);
    res.status(500).json({ error: "Failed to fetch CRM prospects." });
  }
});

/**
 * GET /api/leads/:id (Admin Protected)
 */
router.get("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const lead = await Lead.findById(req.params.id).populate("assignedTo", "name email");
    
    if (!lead) {
      return res.status(404).json({ error: "Prospect file not found." });
    }

    res.json({ lead });
  } catch (error) {
    console.error("[Leads] Single fetch error:", error);
    res.status(500).json({ error: "Failed to load prospect files." });
  }
});

/**
 * POST /api/leads (Public Form Capture or Admin manual addition)
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, email, phone, company, message, budgetRange, projectType, utmSource, utmMedium, utmCampaign } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required." });
    }

    // Lead scoring logic
    let score = 20; // baseline
    if (budgetRange && budgetRange !== "Under $5k") score += 30;
    if (projectType) score += 20;
    if (message.length > 50) score += 20;
    if (company) score += 10;

    const timeline: ILeadActivity[] = [
      {
        action: "LEAD_CAPTURED",
        note: "CRM Lead Profile initialized via direct capture portal.",
        timestamp: new Date(),
      },
    ];

    const lead = new Lead({
      name,
      email: email.toLowerCase().trim(),
      phone,
      company,
      message,
      status: "New",
      score,
      budgetRange,
      projectType,
      utmSource,
      utmMedium,
      utmCampaign,
      activityTimeline: timeline,
    });

    await lead.save();
    
    // Log activity
    await logActivity(undefined, "CREATE_LEAD_CRM", { leadId: lead._id, email }, req);

    res.status(201).json({ success: true, lead });
  } catch (error) {
    console.error("[Leads] Creation error:", error);
    res.status(500).json({ error: "Failed to capture lead profile." });
  }
});

/**
 * PATCH /api/leads/:id (Admin Protected - update CRM fields)
 */
router.patch("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const { status, score, assignedTo, notes, phone, company, budgetRange, projectType } = req.body;
    
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: "Prospect profile not found." });
    }

    const prevStatus = lead.status;
    const prevAssigned = lead.assignedTo;

    // Apply updates
    if (status) {
      lead.status = status;
      if (prevStatus !== status) {
        lead.activityTimeline.push({
          action: "STATUS_CHANGED",
          note: `CRM Pipeline state upgraded from ${prevStatus} to ${status}.`,
          timestamp: new Date(),
        });
      }
    }

    if (score !== undefined) {
      lead.score = score;
    }

    if (assignedTo !== undefined) {
      if (assignedTo === null) {
        lead.assignedTo = undefined;
        lead.activityTimeline.push({
          action: "ASSIGNED_MEMBER",
          note: "Lead profile unassigned.",
          timestamp: new Date(),
        });
      } else {
        lead.assignedTo = new mongoose.Types.ObjectId(assignedTo);
        if (prevAssigned?.toString() !== assignedTo) {
          lead.activityTimeline.push({
            action: "ASSIGNED_MEMBER",
            note: "Lead assigned to new workload manager.",
            timestamp: new Date(),
          });
        }
      }
    }

    if (notes !== undefined) lead.notes = notes;
    if (phone !== undefined) lead.phone = phone;
    if (company !== undefined) lead.company = company;
    if (budgetRange !== undefined) lead.budgetRange = budgetRange;
    if (projectType !== undefined) lead.projectType = projectType;

    await lead.save();
    
    // Log activity
    await logActivity(req.user?.id, "UPDATE_LEAD_CRM", { leadId: lead._id, updates: req.body }, req);

    res.json({ success: true, lead });
  } catch (error) {
    console.error("[Leads] Update error:", error);
    res.status(500).json({ error: "Failed to update prospect CRM data." });
  }
});

/**
 * POST /api/leads/:id/notes (Admin Protected - append custom note to history)
 */
router.post("/:id/notes", authenticate, async (req: Request, res: Response) => {
  try {
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({ error: "Note content is required." });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: "Prospect file not found." });
    }

    lead.activityTimeline.push({
      action: "NOTE_ADDED",
      note,
      timestamp: new Date(),
    });

    await lead.save();
    await logActivity(req.user?.id, "ADD_LEAD_NOTE", { leadId: lead._id, note }, req);

    res.json({ success: true, lead });
  } catch (error) {
    console.error("[Leads] Append note error:", error);
    res.status(500).json({ error: "Failed to append note to timeline." });
  }
});

/**
 * DELETE /api/leads/:id (Admin Protected - restrict to full ADMIN)
 */
router.delete("/:id", authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: "Prospect not found." });
    }

    await Lead.findByIdAndDelete(req.params.id);
    await logActivity(req.user?.id, "DELETE_LEAD_CRM", { leadId: req.params.id, name: lead.name }, req);

    res.json({ success: true, message: "Lead record securely deleted from active CRM archives." });
  } catch (error) {
    console.error("[Leads] Delete error:", error);
    res.status(500).json({ error: "Failed to delete lead archives." });
  }
});

export default router;
