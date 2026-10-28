import type { CookieOptions, Request, Response } from "express";
import { env } from "../config/env.js";
import { loginSchema, registerSchema } from "../validators/auth.validators.js";
import {
  getUserById,
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
} from "../services/auth.service.js";
import { HttpError } from "../errors/HttpError.js";

const REFRESH_COOKIE = "refreshToken";

const isProduction = env.NODE_ENV === "production";

const refreshCookieOptions: CookieOptions = {
  httpOnly: true, // JavaScript can't read it
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/api/auth", // only sent to auth endpoints
};

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    ...refreshCookieOptions,
    maxAge: env.REFRESH_TOKEN_TTL_MINUTES * 60_000,
  });
}

export async function register(req: Request, res: Response) {
  // Throws ZodError on invalid input; the error handler responds 400
  const input = registerSchema.parse(req.body);
  const user = await registerUser(input);
  res.status(201).json({ user });
}

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const { user, accessToken, refreshToken } = await loginUser(input);
  setRefreshCookie(res, refreshToken);
  res.json({ user, accessToken });
}

export async function refresh(req: Request, res: Response) {
  const token: string | undefined = req.cookies[REFRESH_COOKIE];
  if (!token) {
    throw new HttpError(401, "No active session");
  }

  try {
    const { user, accessToken, refreshToken } = await refreshSession(token);
    setRefreshCookie(res, refreshToken);
    res.json({ user, accessToken });
  } catch (err) {
    res.clearCookie(REFRESH_COOKIE, refreshCookieOptions);
    throw err;
  }
}

export async function logout(req: Request, res: Response) {
  const token: string | undefined = req.cookies[REFRESH_COOKIE];
  if (token) {
    await logoutUser(token);
  }
  res.clearCookie(REFRESH_COOKIE, refreshCookieOptions);
  res.status(204).end();
}

export async function me(req: Request, res: Response) {
  const user = await getUserById(req.userId!);
  res.json({ user });
}
