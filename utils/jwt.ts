import jwt, { type SignOptions } from "jsonwebtoken";
import type { StringValue } from "ms"; // ✅ make sure this import exists

const JWT_SECRET = (process.env.JWT_SECRET || "your-secret-key-here") as string;
const JWT_EXPIRE = (process.env.JWT_EXPIRE || "1d") as StringValue; // ✅ casting here

export const generateToken = (userId: string): string => {
  const payload = { userId };
  const options: SignOptions = { expiresIn: JWT_EXPIRE }; // ✅ now type-safe

  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string): string | jwt.JwtPayload => {
  return jwt.verify(token, JWT_SECRET);
};
