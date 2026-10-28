import type { Request, Response } from "express";
import { registerSchema } from "../validators/auth.validators.js";
import { registerUser } from "../services/auth.service.js";

export async function register(req: Request, res: Response) {
  // Throws ZodError on invalid input; the error handler responds 400
  const input = registerSchema.parse(req.body);
  const user = await registerUser(input);
  res.status(201).json({ user });
}
