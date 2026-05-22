import mongoose, { Schema, Document } from "mongoose";

export interface IActivityLog extends Document {
  userId?: mongoose.Types.ObjectId; // User executing the action (or undefined/null for guest actions like booking)
  action: string; // e.g. "LOGIN_SUCCESS", "CREATE_BOOKING", "UPDATE_SERVICE", "DELETE_LEAD"
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const ActivityLogSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  action: { type: String, required: true },
  details: { type: Schema.Types.Mixed, default: {} },
  ipAddress: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.ActivityLog || mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);
