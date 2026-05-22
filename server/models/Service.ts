import mongoose, { Schema, Document } from "mongoose";

export interface IService extends Document {
  name: string;
  slug: string;
  duration: number; // minutes
  description?: string;
  price?: number;
  meetingType: "Google Meet" | "Phone" | "In Person";
  colorTag: string; // hex or Tailwind color class name
  bufferTime: number; // minutes
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    duration: { type: Number, required: true },
    description: { type: String },
    price: { type: Number },
    meetingType: {
      type: String,
      enum: ["Google Meet", "Phone", "In Person"],
      default: "Google Meet",
    },
    colorTag: { type: String, default: "emerald" },
    bufferTime: { type: Number, default: 15 },
    isEnabled: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Service || mongoose.model<IService>("Service", ServiceSchema);
