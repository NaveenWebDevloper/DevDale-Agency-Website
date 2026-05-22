import mongoose, { Schema, Document } from "mongoose";

interface ITimeSlot {
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
}

interface IWorkingDay {
  day: number; // 0 (Sunday) to 6 (Saturday)
  slots: ITimeSlot[];
}

export interface IAvailability extends Document {
  userId: mongoose.Types.ObjectId;
  timezone: string;
  workingDays: IWorkingDay[];
  bookingLimitsPerDay: number;
  createdAt: Date;
  updatedAt: Date;
}

const TimeSlotSchema = new Schema(
  {
    start: { type: String, required: true }, // e.g., "09:00"
    end: { type: String, required: true },   // e.g., "17:00"
  },
  { _id: false }
);

const WorkingDaySchema = new Schema(
  {
    day: { type: Number, required: true, min: 0, max: 6 },
    slots: { type: [TimeSlotSchema], default: [] },
  },
  { _id: false }
);

const AvailabilitySchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    timezone: { type: String, default: "UTC" },
    workingDays: {
      type: [WorkingDaySchema],
      default: [
        { day: 1, slots: [{ start: "09:00", end: "17:00" }] }, // Monday
        { day: 2, slots: [{ start: "09:00", end: "17:00" }] }, // Tuesday
        { day: 3, slots: [{ start: "09:00", end: "17:00" }] }, // Wednesday
        { day: 4, slots: [{ start: "09:00", end: "17:00" }] }, // Thursday
        { day: 5, slots: [{ start: "09:00", end: "17:00" }] }, // Friday
      ],
    },
    bookingLimitsPerDay: { type: Number, default: 6 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Availability || mongoose.model<IAvailability>("Availability", AvailabilitySchema);
