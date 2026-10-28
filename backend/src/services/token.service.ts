import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import type { Types } from "mongoose";
import { env } from "../config/env.js";
import { RefreshTokenModel } from "../models/RefreshToken.js";
import { HttpError } from "../errors/HttpError.js";

export function signAccessToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: env.ACCESS_TOKEN_TTL_MINUTES * 60,
  });
}

// Devuelve el id de usuario guardado en un access token válido
export function verifyAccessToken(token: string): string {
  let payload: string | jwt.JwtPayload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] });
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new HttpError(401, "El token ha expirado");
    }
    throw new HttpError(401, "Token inválido");
  }

  if (typeof payload === "string" || !payload.sub) {
    throw new HttpError(401, "Token inválido");
  }
  return payload.sub;
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Crea un refresh token, guarda su hash y devuelve el token original
export async function createRefreshToken(
  userId: string | Types.ObjectId,
): Promise<string> {
  const token = crypto.randomBytes(32).toString("base64url");

  await RefreshTokenModel.create({
    tokenHash: hashToken(token),
    user: userId,
    expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_TTL_MINUTES * 60_000),
  });

  return token;
}

/**
 * Consume un refresh token (solo puede usarse una vez) y emite uno nuevo.
 * Devuelve el id del dueño y el nuevo token original.
 */
export async function rotateRefreshToken(token: string) {
  const stored = await RefreshTokenModel.findOneAndDelete({
    tokenHash: hashToken(token),
    expiresAt: { $gt: new Date() },
  });
  if (!stored) {
    throw new HttpError(401, "Sesión inválida o expirada");
  }

  const userId = stored.user.toString();
  const newToken = await createRefreshToken(userId);
  return { userId, refreshToken: newToken };
}

export async function revokeRefreshToken(token: string): Promise<void> {
  await RefreshTokenModel.deleteOne({ tokenHash: hashToken(token) });
}
