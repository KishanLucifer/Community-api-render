import { Router, type Response } from "express";
import mongoose from "mongoose";
import Post from "../models/Post";
import { authenticate } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";

const router = Router();

const checkDBConnection = () => {
  return mongoose.connection.readyState === 1;
};

// Get all posts (public feed)
router.get("/", async (req, res: Response) => {
  try {
    if (!checkDBConnection()) {
      return res.status(503).json({ message: "Database not available" });
    }

    const posts = await Post.find()
      .populate("author", "name email bio")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ posts });
  } catch (error: any) {
    console.error("Get posts error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get posts by user ID
router.get("/user/:userId", async (req, res: Response) => {
  try {
    const { userId } = req.params;

    if (!checkDBConnection()) {
      return res.status(503).json({ message: "Database not available" });
    }

    const posts = await Post.find({ author: userId })
      .populate("author", "name email bio")
      .sort({ createdAt: -1 });

    res.json({ posts });
  } catch (error: any) {
    console.error("Get user posts error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create a new post
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;
    const userId = req.user?._id;

    if (!content?.trim()) {
      return res.status(400).json({ message: "Post content is required" });
    }

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!checkDBConnection()) {
      return res.status(503).json({ message: "Database not available" });
    }

    const post = new Post({
      content: content.trim(),
      author: userId,
    });

    await post.save();
    await post.populate("author", "name email bio");

    res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error: any) {
    console.error("Create post error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete a post (only by author)
router.delete(
  "/:postId",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const { postId } = req.params;
      const userId = req.user?._id;

      if (!checkDBConnection()) {
        return res.status(503).json({ message: "Database not available" });
      }

      const post = await Post.findById(postId);

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      if (post.author.toString() !== userId?.toString()) {
        return res
          .status(403)
          .json({ message: "Not authorized to delete this post" });
      }

      await Post.findByIdAndDelete(postId);
      res.json({ message: "Post deleted successfully" });
    } catch (error: any) {
      console.error("Delete post error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

export default router;
