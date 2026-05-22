import User from "../models/User";
import Service from "../models/Service";
import Availability from "../models/Availability";
import { hashPassword } from "../middleware/securityMiddleware";

export async function seedDatabase() {
  try {
    // 1. Seed Root Admin
    const userCount = await User.countDocuments();
    let rootAdminId = null;

    if (userCount === 0) {
      console.log("[Seed] Bootstrapping root admin account...");
      
      const defaultPassword = "Devdale@2026";
      const { hash, salt } = hashPassword(defaultPassword);
      
      const admin = await User.create({
        name: "DevDale Administrator",
        email: "admin@devdale.com",
        password: `${hash}:${salt}`,
        role: "ADMIN",
        isLocked: false,
        loginAttempts: 0,
      });

      rootAdminId = admin._id;
      console.log("-----------------------------------------------------------------");
      console.log("[SECURITY ALERT] ROOT ADMIN BOOTSTRAPPED");
      console.log("Email: admin@devdale.com");
      console.log(`Password: ${defaultPassword}`);
      console.log("[SECURITY ALERT] PLEASE UPDATE PASSWORD IMMEDIATELY UPON LOGIN");
      console.log("-----------------------------------------------------------------");

      // Set default availability schedule for this admin
      await Availability.create({
        userId: admin._id,
        timezone: "UTC",
        workingDays: [
          { day: 1, slots: [{ start: "09:00", end: "17:00" }] }, // Monday
          { day: 2, slots: [{ start: "09:00", end: "17:00" }] }, // Tuesday
          { day: 3, slots: [{ start: "09:00", end: "17:00" }] }, // Wednesday
          { day: 4, slots: [{ start: "09:00", end: "17:00" }] }, // Thursday
          { day: 5, slots: [{ start: "09:00", end: "17:00" }] }, // Friday
        ],
        bookingLimitsPerDay: 6,
      });
      console.log("[Seed] Initial availability schedule provisioned for root admin.");
    } else {
      const admin = await User.findOne({ role: "ADMIN" });
      if (admin) {
        rootAdminId = admin._id;
      }
    }

    // 2. Seed Default Agency Services
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      console.log("[Seed] Seeding core agency services...");
      const defaultServices = [
        {
          name: "Discovery Call",
          slug: "discovery-call",
          duration: 30,
          description: "A 30-minute introductory sync to understand your engineering goals, project criteria, and operational vision.",
          price: 0,
          meetingType: "Google Meet",
          colorTag: "zinc",
          bufferTime: 15,
          isEnabled: true,
        },
        {
          name: "Website Design",
          slug: "website-design",
          duration: 60,
          description: "Premium, bespoke product design and creative art direction mapping your enterprise or SaaS web architecture.",
          price: 1500,
          meetingType: "Google Meet",
          colorTag: "indigo",
          bufferTime: 15,
          isEnabled: true,
        },
        {
          name: "Web Development",
          slug: "web-development",
          duration: 60,
          description: "Sleek frontend development engineering using Next.js/React and high-performance server logic backend integration.",
          price: 2500,
          meetingType: "Google Meet",
          colorTag: "emerald",
          bufferTime: 15,
          isEnabled: true,
        },
        {
          name: "AI Applications",
          slug: "ai-applications",
          duration: 90,
          description: "In-depth engineering strategy and implementation call for generative AI systems, agents, LLMs, and workflow automation.",
          price: 3500,
          meetingType: "Google Meet",
          colorTag: "purple",
          bufferTime: 30,
          isEnabled: true,
        },
        {
          name: "App Development",
          slug: "app-development",
          duration: 90,
          description: "High-end native/cross-platform app engineering sessions defining layouts, state machines, and app store deployment tracks.",
          price: 4000,
          meetingType: "Google Meet",
          colorTag: "rose",
          bufferTime: 30,
          isEnabled: true,
        },
        {
          name: "SEO Optimization",
          slug: "seo-optimization",
          duration: 45,
          description: "Audit crawl, structural tuning, performance boost, and authority roadmap outlining organic index growth.",
          price: 800,
          meetingType: "Google Meet",
          colorTag: "amber",
          bufferTime: 15,
          isEnabled: true,
        },
      ];

      await Service.insertMany(defaultServices);
      console.log(`[Seed] Successfully provisioned ${defaultServices.length} default agency services.`);
    }
  } catch (error) {
    console.error("[Seed] Error seeding database:", error);
  }
}
