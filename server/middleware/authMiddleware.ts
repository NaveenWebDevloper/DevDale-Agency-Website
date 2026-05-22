import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "./securityMiddleware";
import User from "../models/User";

// Extend Request interface to support req.user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: "ADMIN" | "TEAM_MEMBER";
        name: string;
      };
    }
  }
}

/**
 * Authentication check middleware
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Access token is missing or malformed." });
    }

    const { valid, payload } = verifyJwt(token);

    if (!valid || !payload) {
      return res.status(401).json({ error: "Access token is invalid or has expired." });
    }

    // Attach user metadata to request context
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    };

    next();
  } catch (error) {
    console.error("[AuthMiddleware] Verification error:", error);
    res.status(500).json({ error: "Internal security authorization processing failure." });
  }
}

/**
 * Role-Based Access Control: restricts to ADMIN only
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized access attempt." });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden: Restricted to root administrator level access." });
  }

  next();
}
