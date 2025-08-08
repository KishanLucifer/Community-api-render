import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { SessionManager } from "../utils/session";
import User from "../models/User";
import type { IUser } from "../models/User";

export interface AuthRequest extends Request {
  user?: IUser;
  sessionId?: string;
}

const checkDBConnection = (): boolean => {
  return mongoose.connection.readyState === 1;
};

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res
        .status(401)
        .json({ message: "No session token provided, authorization denied" });
      return;
    }

    const sessionToken = authHeader.substring(7); // Remove 'Bearer ' prefix

    // If database is not connected, return error
    if (!checkDBConnection()) {
      console.log("Database not connected, authentication requires database");
      res
        .status(503)
        .json({ message: "Database not available, please try again later" });
      return;
    }

    // Validate session using MongoDB
    const session = await SessionManager.validateSession(sessionToken);
    if (!session) {
      res.status(401).json({ message: "Invalid or expired session" });
      return;
    }

    // Get user data
    const user = await User.findById(session.userId);
    if (!user) {
      // Clean up invalid session
      await SessionManager.deleteSession(sessionToken);
      res.status(401).json({ message: "User not found" });
      return;
    }

    req.user = user;
    req.sessionId = sessionToken;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Authentication failed" });
  }
};
