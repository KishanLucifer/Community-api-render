import { Router, type Request, type Response } from "express";
import mongoose from "mongoose";

const router = Router();

// Health check endpoint for deployment monitoring
router.get("/health", (req: Request, res: Response) => {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    database: {
      connected: mongoose.connection.readyState === 1,
      state: getConnectionState(mongoose.connection.readyState),
    },
    services: ["auth", "posts", "users"],
    vercel: {
      region: process.env.VERCEL_REGION || "unknown",
      deployment: process.env.VERCEL_GIT_COMMIT_SHA
        ? process.env.VERCEL_GIT_COMMIT_SHA.substring(0, 7)
        : "local",
    },
  };

  const statusCode = health.database.connected ? 200 : 503;
  res.status(statusCode).json(health);
});

// Readiness check for load balancers
router.get("/ready", (req: Request, res: Response) => {
  const isReady = mongoose.connection.readyState === 1;

  if (isReady) {
    res.status(200).json({ status: "ready" });
  } else {
    res
      .status(503)
      .json({ status: "not ready", reason: "database not connected" });
  }
});

function getConnectionState(state: number): string {
  switch (state) {
    case 0:
      return "disconnected";
    case 1:
      return "connected";
    case 2:
      return "connecting";
    case 3:
      return "disconnecting";
    default:
      return "unknown";
  }
}

export default router;
