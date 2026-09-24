import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../services/authService.js";

// Express's Request type extended with the authenticated user's id, set by
// requireAuth below once the bearer token has been verified.
export interface AuthedRequest extends Request {
  userId?: number;
}

export function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  const userId = token ? verifyToken(token) : null;

  if (!userId) {
    res.status(401).json({ error: "unauthorized", message: "Authentication required" });
    return;
  }

  req.userId = userId;
  next();
}

// Like requireAuth, but never rejects — sets req.userId when a valid token
// is present, leaves it undefined otherwise. Used by routes that serve
// useful content either way but personalize it when logged in.
export function attachUser(
  req: AuthedRequest,
  _res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  const userId = token ? verifyToken(token) : null;
  if (userId) req.userId = userId;
  next();
}
