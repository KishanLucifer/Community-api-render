import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/database";
import authRoutes from "./routes/auth";
import postsRoutes from "./routes/posts";
import healthRoutes from "./routes/health";
import usersRoutes from "./routes/users";

const app = express();
const PORT = process.env.PORT || 8000;

// Connect to MongoDB
connectDB().catch((err) => {
  console.log("MongoDB connection failed, continuing without database");
});

// CORS configuration for separate frontend
app.use(
  cors({
    origin: [
      "https://client-nine-gamma-75.vercel.app/",
      "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check routes
app.use("/api", healthRoutes);

// Auth routes
app.use("/api/auth", authRoutes);

// Posts routes
app.use("/api/posts", postsRoutes);

// Users routes
app.use("/api/users", usersRoutes);

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Server error:", err);
    res.status(500).json({
      message: "Internal server error",
      ...(process.env.NODE_ENV === "development" && { error: err.message }),
    });
  }
);

// Start server
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Backend API server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  });
}

export default app;
