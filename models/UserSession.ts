import mongoose, { Document, Schema } from "mongoose";

export interface IUserSession extends Document {
  userId: mongoose.Types.ObjectId;
  sessionToken: string;
  expiresAt: Date;
  createdAt: Date;
  userAgent?: string;
  ipAddress?: string;
}

const userSessionSchema = new Schema<IUserSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionToken: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // MongoDB will auto-delete expired sessions
    },
    userAgent: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient lookups (removed duplicate sessionToken index since unique: true already creates one)
userSessionSchema.index({ userId: 1 });

const UserSession =
  (mongoose.models.UserSession as mongoose.Model<IUserSession>) ||
  mongoose.model<IUserSession>("UserSession", userSessionSchema);

export default UserSession;
