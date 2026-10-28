import type { RequestHandler } from "express";
import { HttpError } from "../errors/HttpError.js";
import { verifyAccessToken } from "../services/token.service.js";

declare global {
  namespace Express {
    interface Request {
      userId?: string; // Lo asigna requireAuth en las rutas protegidas
    }
  }
}

// Rechaza la solicitud con 401 si no tiene un Bearer access token válido
export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new HttpError(401, "Se requiere autenticación");
  }

  req.userId = verifyAccessToken(header.slice("Bearer ".length));
  next();
};
