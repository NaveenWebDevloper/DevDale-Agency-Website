import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId?: mongoose.Types.ObjectId; // Specific recipient, or undefined/null for global broadcast to all admins
  title: string;
  message: string;
  type: "BOOKING_NEW" | "BOOKING_CANCELLED" | "LEAD_NEW" | "SYSTEM";
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["BOOKING_NEW", "BOOKING_CANCELLED", "LEAD_NEW", "SYSTEM"],
      required: true,
    },
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
