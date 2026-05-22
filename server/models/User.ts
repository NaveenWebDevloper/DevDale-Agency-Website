import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // Optional because external SSO or basic credentials might vary, but standard for local auth
  role: "ADMIN" | "TEAM_MEMBER";
  isLocked: boolean;
  loginAttempts: number;
  lockUntil?: Date;
  refreshTokens?: string[];
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["ADMIN", "TEAM_MEMBER"], default: "TEAM_MEMBER" },
    isLocked: { type: Boolean, default: false },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    refreshTokens: { type: [String], default: [] },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
