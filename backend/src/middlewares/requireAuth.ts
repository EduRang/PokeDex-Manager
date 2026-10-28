import type { RequestHandler } from "express";
import { HttpError } from "../errors/HttpError.js";
import { verifyAccessToken } from "../services/token.service.js";

declare global {
  namespace Express {
    interface Request {
      userId?: string; // Set by requireAuth on protected routes
    }
  }
}

// Rejects the request with 401 unless it has a valid Bearer access token
export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new HttpError(401, "Authentication required");
  }

  req.userId = verifyAccessToken(header.slice("Bearer ".length));
  next();
};
