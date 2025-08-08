// // middleware/dbCheck.ts
// import type { Request, Response, NextFunction } from "express";
// import mongoose from "mongoose";

// export const dbCheck = (req: Request, res: Response, next: NextFunction) => {
//   if (mongoose.connection.readyState !== 1) {
//     return res.status(503).json({ message: "Database not available" });
//   }
//   next();
// };
