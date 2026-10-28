import { isAxiosError } from "axios";

export function getErrorStatus(err: unknown): number | null {
  return isAxiosError(err) ? (err.response?.status ?? null) : null;
}

// Generic user-facing message
export function getErrorMessage(err: unknown): string {
  if (isAxiosError(err) && !err.response) {
    return "No se pudo conectar con el servidor. Inténtalo de nuevo.";
  }
  return "Algo salió mal. Inténtalo de nuevo.";
}
