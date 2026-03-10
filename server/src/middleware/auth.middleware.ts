import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
// We extend the Express Request type to include our user data
interface AuthRequest extends Request {
  user?: { id: string; isAdmin: boolean };
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  // 1. Check for token in headers (Bearer <token>)
  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // 2. Verify token
      const decoded = jwt.verify(token, env.JWT_SECRET!) as { id: string; isAdmin: boolean };

      // 3. Attach user to request
      req.user = decoded;
      
      return next(); // Move to the controller
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Admin-only middleware
export const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};