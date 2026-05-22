import express, { Request, Response } from "express";
import Booking from "../models/Booking";
import Lead from "../models/Lead";
import Service from "../models/Service";
import ActivityLog from "../models/ActivityLog";
import { authenticate } from "../middleware/authMiddleware";
import { normalizeToUTCDate } from "../services/availabilityEngine";

const router = express.Router();

/**
 * GET /api/analytics/dashboard (Admin Protected)
 * Performs aggregation queries to feed key metrics & charts in the CRM Dashboard
 */
router.get("/dashboard", authenticate, async (req: Request, res: Response) => {
  try {
    const now = new Date();
    
    // Normalize date points
    const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    const endOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59));
    
    const startOfThisMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const startOfLastMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    const endOfLastMonth = new Date(startOfThisMonth.getTime() - 1);

    // 1. Core aggregates
    const totalBookings = await Booking.countDocuments({ status: { $ne: "Cancelled" } });
    const todaysMeetings = await Booking.countDocuments({
      date: { $gte: startOfToday, $lte: endOfToday },
      status: { $in: ["Confirmed", "Pending", "Rescheduled"] },
    });

    const pendingLeads = await Lead.countDocuments({ status: { $in: ["New", "Contacted"] } });
    const totalLeads = await Lead.countDocuments();
    
    // Conversion rate: (Qualified/Won/Proposal leads / total leads) * 100
    const qualifiedLeads = await Lead.countDocuments({
      status: { $in: ["Qualified", "Proposal Sent", "Won"] },
    });
    const conversionRate = totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;

    // Revenue Pipeline: Sum of prices of active confirmed/completed/rescheduled bookings
    const activeBookings = await Booking.find({
      status: { $in: ["Confirmed", "Completed", "Rescheduled"] },
    }).populate("serviceId", "price");

    let revenuePipeline = 0;
    activeBookings.forEach((b: any) => {
      if (b.serviceId && b.serviceId.price) {
        revenuePipeline += b.serviceId.price;
      }
    });

    // Monthly Growth estimation: bookings this month vs last month
    const bookingsThisMonth = await Booking.countDocuments({
      createdAt: { $gte: startOfThisMonth },
      status: { $ne: "Cancelled" }
    });
    const bookingsLastMonth = await Booking.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      status: { $ne: "Cancelled" }
    });

    let monthlyGrowth = 0;
    if (bookingsLastMonth > 0) {
      monthlyGrowth = Math.round(((bookingsThisMonth - bookingsLastMonth) / bookingsLastMonth) * 100);
    } else if (bookingsThisMonth > 0) {
      monthlyGrowth = 100; // 100% growth if starting from scratch
    }

    // 2. Trend charts (last 6 months of Bookings and Leads)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i + 1, 1, 0, 0, 0, -1));
      const monthName = monthStart.toLocaleString("en-US", { month: "short", timeZone: "UTC" });

      const bookCount = await Booking.countDocuments({
        createdAt: { $gte: monthStart, $lte: monthEnd },
        status: { $ne: "Cancelled" },
      });

      const leadCount = await Lead.countDocuments({
        createdAt: { $gte: monthStart, $lte: monthEnd },
      });

      const monthlyBookings = await Booking.find({
        createdAt: { $gte: monthStart, $lte: monthEnd },
        status: { $in: ["Confirmed", "Completed", "Rescheduled"] },
      }).populate("serviceId", "price");

      let monthlyRevenue = 0;
      monthlyBookings.forEach((b: any) => {
        if (b.serviceId && b.serviceId.price) {
          monthlyRevenue += b.serviceId.price;
        }
      });

      monthlyTrends.push({
        month: monthName,
        bookings: bookCount,
        leads: leadCount,
        revenue: monthlyRevenue,
      });
    }

    // 3. Service demand breakdowns
    const services = await Service.find();
    const serviceDemand = [];

    for (const service of services) {
      const count = await Booking.countDocuments({ serviceId: service._id, status: { $ne: "Cancelled" } });
      serviceDemand.push({
        name: service.name,
        value: count,
        color: service.colorTag,
      });
    }

    // Sort service demand and keep top 5
    serviceDemand.sort((a, b) => b.value - a.value);

    // 4. UTM Source Attribution (leads)
    const utmAttribution = await Lead.aggregate([
      { $group: { _id: { $ifNull: ["$utmSource", "Direct"] }, value: { $sum: 1 } } },
      { $project: { name: "$_id", value: 1, _id: 0 } },
      { $sort: { value: -1 } }
    ]);

    // 5. Recent Activity Logs (last 5)
    const recentActivity = await ActivityLog.find()
      .populate("userId", "name role")
      .sort({ createdAt: -1 })
      .limit(6);

    // 6. Upcoming briefings (next 5)
    const upcomingMeetings = await Booking.find({
      date: { $gte: startOfToday },
      status: { $in: ["Confirmed", "Pending", "Rescheduled"] },
    })
      .populate("serviceId", "name duration colorTag")
      .populate("userId", "name")
      .sort({ date: 1, timeSlot: 1 })
      .limit(5);

    res.json({
      metrics: {
        totalBookings,
        todaysMeetings,
        conversionRate,
        revenuePipeline,
        pendingLeads,
        monthlyGrowth,
      },
      charts: {
        monthlyTrends,
        serviceDemand: serviceDemand.filter(s => s.value > 0),
        utmAttribution,
      },
      upcomingMeetings,
      recentActivity,
    });
  } catch (error) {
    console.error("[Analytics] Dashboard error:", error);
    res.status(500).json({ error: "Failed to compile business dashboard intelligence." });
  }
});

export default router;
