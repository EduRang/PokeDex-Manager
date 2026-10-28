import type { LoginInput, RegisterInput } from "../types/auth";

export type FieldErrors = Partial<Record<string, string>>;

// Mirrors the backend rules so most mistakes are caught before sending
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface Requirement {
  label: string;
  isMet: (value: string) => boolean;
}

// Shown live in the field's hint bubble while the user types
export const USERNAME_REQUIREMENTS: Requirement[] = [
  {
    label: "Entre 3 y 20 caracteres",
    isMet: (v) => v.trim().length >= 3 && v.trim().length <= 20,
  },
  {
    label: "Solo letras, números y guion bajo (_)",
    isMet: (v) => /^[a-zA-Z0-9_\s]+$/.test(v.trim()),
  },
  {
    label: "Sin espacios",
    isMet: (v) => v.trim().length > 0 && !/\s/.test(v.trim()),
  },
];

export const PASSWORD_REQUIREMENTS: Requirement[] = [
  {
    label: "Entre 8 y 72 caracteres",
    isMet: (v) => v.length >= 8 && v.length <= 72,
  },
  { label: "Al menos una mayúscula", isMet: (v) => /[A-Z]/.test(v) },
  { label: "Al menos una minúscula", isMet: (v) => /[a-z]/.test(v) },
  { label: "Al menos un número", isMet: (v) => /[0-9]/.test(v) },
  {
    label: "Al menos un carácter especial (!@#$%...)",
    isMet: (v) => /[^A-Za-z0-9\s]/.test(v),
  },
];

export function hasErrors(errors: FieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}

function validateEmail(email: string): string | undefined {
  if (!email.trim()) return "El correo es obligatorio";
  if (!EMAIL_REGEX.test(email.trim())) return "Ingresa un correo válido";
  return undefined;
}

export function validateLogin(values: LoginInput): FieldErrors {
  return {
    identifier: values.identifier.trim()
      ? undefined
      : "Ingresa tu correo o nombre de usuario",
    password: values.password ? undefined : "La contraseña es obligatoria",
  };
}

export interface RegisterFormValues extends RegisterInput {
  confirmPassword: string;
}

export function validateRegister(values: RegisterFormValues): FieldErrors {
  const errors: FieldErrors = { email: validateEmail(values.email) };

  const username = values.username.trim();
  if (!username) {
    errors.username = "El nombre de usuario es obligatorio";
  } else if (/\s/.test(username)) {
    errors.username = "El nombre de usuario no puede contener espacios";
  } else if (username.length < 3 || username.length > 20) {
    errors.username = "Debe tener entre 3 y 20 caracteres";
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.username = "Solo letras, números y guion bajo (_), sin espacios";
  }

  const unmetPasswordRule = PASSWORD_REQUIREMENTS.find(
    (rule) => !rule.isMet(values.password),
  );
  if (!values.password) {
    errors.password = "La contraseña es obligatoria";
  } else if (unmetPasswordRule) {
    errors.password = `La contraseña debe tener: ${unmetPasswordRule.label.toLowerCase()}`;
  }

  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Las contraseñas no coinciden";
  }

  return errors;
}
