import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and _"),
  email: z.email("Invalid email").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    // bcrypt only uses the first 72 bytes of a password
    .max(72, "Password must be at most 72 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// Only checks presence: password rules are enforced at registration
export const loginSchema = z.object({
  email: z.email("Invalid email").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
