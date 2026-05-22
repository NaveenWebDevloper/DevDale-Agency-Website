import mongoose, { Schema, Document } from "mongoose";

export interface IBooking extends Document {
  serviceId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId; // Assigned team member (optional, e.g. auto-assigned or specific admin)
  customerName: string;
  customerEmail: string;
  customerCompany?: string;
  budgetRange?: string;
  projectType?: string;
  notes?: string;
  date: Date; // Normalised to YYYY-MM-DD
  timeSlot: string; // "HH:MM" format
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled" | "Rescheduled" | "No Show";
  googleEventId?: string;
  googleMeetLink?: string;
  googleCalendarLink?: string;
  googleCalendarEventId?: string;
  duration?: number; // Duration in minutes
  cancellationReason?: string;
  rescheduleReason?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema(
  {
    serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    customerCompany: { type: String },
    budgetRange: { type: String },
    projectType: { type: String },
    notes: { type: String },
    date: { type: Date, required: true }, // Normalized date (00:00:00 UTC)
    timeSlot: { type: String, required: true }, // "10:30"
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled", "Rescheduled", "No Show"],
      default: "Pending",
    },
    googleEventId: { type: String },
    googleMeetLink: { type: String },
    googleCalendarLink: { type: String },
    googleCalendarEventId: { type: String },
    duration: { type: Number, default: 60 }, // Duration in minutes
    cancellationReason: { type: String },
    rescheduleReason: { type: String },
    utmSource: { type: String },
    utmMedium: { type: String },
    utmCampaign: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);
