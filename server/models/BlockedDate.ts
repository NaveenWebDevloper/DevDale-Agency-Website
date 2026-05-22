import mongoose, { Schema, Document } from "mongoose";

export interface IBlockedDate extends Document {
  date: Date; // Normalised to YYYY-MM-DD
  reason?: string;
  userId?: mongoose.Types.ObjectId; // Staff specific block if present
  isGlobal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BlockedDateSchema: Schema = new Schema(
  {
    date: { type: Date, required: true }, // Normalized date (00:00:00 UTC)
    reason: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    isGlobal: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.BlockedDate || mongoose.model<IBlockedDate>("BlockedDate", BlockedDateSchema);
