import crypto from "crypto";
import mongoose from "mongoose";
import UserSession, { type IUserSession } from "../models/UserSession";

export interface SessionData {
  sessionId: string;
  userId: string;
  expiresAt: Date;
}

export interface CreateSessionOptions {
  userId: string;
  userAgent?: string;
  ipAddress?: string;
  expiresInDays?: number;
}

export class SessionManager {
  static generateSessionToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  static async createSession(
    options: CreateSessionOptions
  ): Promise<SessionData> {
    const defaultExpiry = parseInt(process.env.SESSION_TIMEOUT_DAYS || "7");
    const {
      userId,
      userAgent,
      ipAddress,
      expiresInDays = defaultExpiry,
    } = options;

    const sessionToken = this.generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const session = new UserSession({
      userId: new mongoose.Types.ObjectId(userId),
      sessionToken,
      expiresAt,
      userAgent,
      ipAddress,
    });

    await session.save();

    return {
      sessionId: sessionToken,
      userId,
      expiresAt,
    };
  }

  static async validateSession(
    sessionToken: string
  ): Promise<IUserSession | null> {
    if (!sessionToken) return null;

    const session = await UserSession.findOne({
      sessionToken,
      expiresAt: { $gt: new Date() },
    }).populate("userId");

    return session;
  }

  static async deleteSession(sessionToken: string): Promise<boolean> {
    const result = await UserSession.deleteOne({ sessionToken });
    return result.deletedCount > 0;
  }

  static async deleteAllUserSessions(userId: string): Promise<number> {
    const result = await UserSession.deleteMany({
      userId: new mongoose.Types.ObjectId(userId),
    });
    return result.deletedCount;
  }

  static async cleanupExpiredSessions(): Promise<number> {
    const result = await UserSession.deleteMany({
      expiresAt: { $lt: new Date() },
    });
    return result.deletedCount;
  }
}
