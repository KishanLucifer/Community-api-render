import mongoose from "mongoose";

const connectDB = async (): Promise<boolean> => {
  try {
    // Use in-memory MongoDB for development if no URI is provided
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/community";

    const conn = await mongoose.connect(mongoURI, {
      // Connection options optimized for serverless
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      bufferCommands: false, // Disable mongoose buffering for serverless
      // bufferMaxEntries is deprecated, using bufferCommands: false instead
      maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || "10"),
      minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || "5"),
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Set up session cleanup interval
    setInterval(async () => {
      try {
        const { SessionManager } = await import("../utils/session.js");
        const cleaned = await SessionManager.cleanupExpiredSessions();
        if (cleaned > 0) {
          console.log(`Cleaned up ${cleaned} expired sessions`);
        }
      } catch (error) {
        console.error("Session cleanup error:", error);
      }
    }, 60000 * 15); // Run every 15 minutes

    return true;
  } catch (error: any) {
    console.error("MongoDB connection failed:", error.message);
    console.log(
      "Running without database - authentication and posts will not work"
    );
    return false;
  }
};

export default connectDB;
