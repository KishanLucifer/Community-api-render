import { Router, type Request, type Response } from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import { SessionManager } from "../utils/session";
import { authenticate } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";

const checkDBConnection = () => {
  return mongoose.connection.readyState === 1;
};

const router = Router();

// Register user
router.post("/register", async (req: Request, res: Response) => {
  try {
    console.log("Register endpoint hit with body:", req.body);

    if (!checkDBConnection()) {
      console.log("Database not connected, returning 503");
      return res
        .status(503)
        .json({ message: "Database not available. Please try again later." });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide name, email, and password" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const user = new User({ name, email, password });
    await user.save();

    // Create session
    const session = await SessionManager.createSession({
      userId: String(user._id),
      userAgent: req.headers["user-agent"] ?? "",
      ipAddress: req.ip ?? req.connection.remoteAddress ?? "",
    });

    res.status(201).json({
      message: "User registered successfully",
      sessionToken: session.sessionId,
      expiresAt: session.expiresAt,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Login user
router.post("/login", async (req: Request, res: Response) => {
  try {
    if (!checkDBConnection()) {
      return res
        .status(503)
        .json({ message: "Database not available. Please try again later." });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create session
    const session = await SessionManager.createSession({
      userId: String(user._id),
      userAgent: req.headers["user-agent"] ?? "",
      ipAddress: req.ip ?? req.connection.remoteAddress ?? "",
    });

    res.json({
      message: "Login successful",
      sessionToken: session.sessionId,
      expiresAt: session.expiresAt,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get current user
router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Logout user and clean up session
router.post(
  "/logout",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const sessionId = req.sessionId;

      if (sessionId) {
        await SessionManager.deleteSession(sessionId);
      }

      res.json({ message: "Logout successful" });
    } catch (error: any) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Logout from all devices
router.post(
  "/logout-all",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user;

      if (user?._id) {
        const deletedCount = await SessionManager.deleteAllUserSessions(
          user._id.toString()
        );
        res.json({
          message: "Logged out from all devices successfully",
          sessionsCleared: deletedCount,
        });
      } else {
        res.status(401).json({ message: "User not found" });
      }
    } catch (error: any) {
      console.error("Logout all error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Get user profile by ID
router.get("/users/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!checkDBConnection()) {
      return res.status(503).json({ message: "Database not available" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Get user profile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
