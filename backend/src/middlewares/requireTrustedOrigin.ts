import type { RequestHandler } from "express";
import { env } from "../config/env.js";
import { HttpError } from "../errors/HttpError.js";

const allowedOrigin = new URL(env.CLIENT_URL).origin;

// Defensa contra CSRF en las rutas de autenticación, que usan la cookie de
// refresh. Los navegadores envían la cabecera Origin en las solicitudes POST:
// si viene de otra web, se rechaza aunque el navegador adjunte la cookie.
// Sin Origin (curl, Postman, pruebas) no hay navegador, así que tampoco CSRF
export const requireTrustedOrigin: RequestHandler = (req, _res, next) => {
  const origin = req.get("origin");
  if (origin && origin !== allowedOrigin) {
    throw new HttpError(403, "Origen no permitido");
  }
  next();
};
