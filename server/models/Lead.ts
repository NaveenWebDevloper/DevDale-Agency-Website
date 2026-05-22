import mongoose, { Schema, Document } from "mongoose";

export interface ILeadActivity {
  action: string; // e.g. "LEAD_CAPTURED", "STATUS_CHANGED", "NOTE_ADDED", "ASSIGNED_MEMBER"
  note?: string;
  timestamp: Date;
}

export interface ILead extends Document {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  status: "New" | "Contacted" | "Qualified" | "Proposal Sent" | "Won" | "Lost" | "Archived";
  score: number; // 0 to 100 lead score
  assignedTo?: mongoose.Types.ObjectId; // Team member ID
  budgetRange?: string;
  projectType?: string;
  notes?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  activityTimeline: ILeadActivity[];
  createdAt: Date;
  updatedAt: Date;
}

const LeadActivitySchema = new Schema(
  {
    action: { type: String, required: true },
    note: { type: String },
    timestamp: { type: Date, default: Date.now }
  },
  { _id: false }
);

const LeadSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String },
    company: { type: String },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["New", "Contacted", "Qualified", "Proposal Sent", "Won", "Lost", "Archived"],
      default: "New",
    },
    score: { type: Number, default: 0 },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    budgetRange: { type: String },
    projectType: { type: String },
    notes: { type: String },
    utmSource: { type: String },
    utmMedium: { type: String },
    utmCampaign: { type: String },
    activityTimeline: { type: [LeadActivitySchema], default: [] },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Lead || mongoose.model<ILead>("Lead", LeadSchema);

