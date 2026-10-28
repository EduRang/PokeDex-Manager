import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-z0-9_]+$/,
      "Username can only contain letters, numbers and _ (without spaces)",
    ),
  email: z.email("Invalid email").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    // bcrypt only uses the first 72 bytes of a password
    .max(72, "Password must be at most 72 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number")
    .regex(/[^A-Za-z0-9\s]/, "Password must contain a special character"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// Only checks presence: password rules are enforced at registration
export const loginSchema = z.object({
  // Email or username, both are stored lowercase
  identifier: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
