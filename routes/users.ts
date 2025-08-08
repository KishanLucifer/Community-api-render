import { Router, type Response } from "express";
import mongoose from "mongoose";
import User from "../models/User";
import { authenticate, type AuthRequest } from "../middleware/auth";

const router = Router();

const checkDBConnection = () => {
  return mongoose.connection.readyState === 1;
};

// Get user profile by ID
router.get("/:userId", async (req, res: Response) => {
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

// Update user profile
router.put(
  "/:userId",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.params;
      const { name, bio } = req.body;
      const currentUserId = req.user?._id;

      if (!checkDBConnection()) {
        return res.status(503).json({ message: "Database not available" });
      }

      // Check if user is updating their own profile
      if (currentUserId?.toString() !== userId) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this profile" });
      }

      // Validate input
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: "Name is required" });
      }

      if (name.trim().length > 50) {
        return res
          .status(400)
          .json({ message: "Name cannot be more than 50 characters" });
      }

      if (bio && bio.length > 500) {
        return res
          .status(400)
          .json({ message: "Bio cannot be more than 500 characters" });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        {
          name: name.trim(),
          bio: bio ? bio.trim() : undefined,
        },
        { new: true, runValidators: true }
      ).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        message: "Profile updated successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          bio: user.bio,
          createdAt: user.createdAt,
        },
      });
    } catch (error: any) {
      console.error("Update profile error:", error);
      if (error.name === "ValidationError") {
        return res
          .status(400)
          .json({ message: "Invalid input data", error: error.message });
      }
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

export default router;
