import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
    .max(20, "El nombre de usuario debe tener como máximo 20 caracteres")
    .regex(
      /^[a-z0-9_]+$/,
      "El nombre de usuario solo puede contener letras, números y guion bajo (_), sin espacios",
    ),
  email: z.email("Correo electrónico inválido").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    // bcrypt solo usa los primeros 72 bytes de una contraseña
    .max(72, "La contraseña debe tener como máximo 72 caracteres")
    .regex(/[A-Z]/, "La contraseña debe incluir una letra mayúscula")
    .regex(/[a-z]/, "La contraseña debe incluir una letra minúscula")
    .regex(/[0-9]/, "La contraseña debe incluir un número")
    .regex(/[^A-Za-z0-9\s]/, "La contraseña debe incluir un carácter especial"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// Solo verifica que existan: las reglas de contraseña se aplican al registrarse
export const loginSchema = z.object({
  // Correo o nombre de usuario. Ambos se guardan en minúsculas
  identifier: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "El correo o nombre de usuario es obligatorio"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export type LoginInput = z.infer<typeof loginSchema>;
