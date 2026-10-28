import { useState, type ChangeEvent, type SubmitEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage, getErrorStatus } from "../api/errors";
import { TextField } from "../components/TextField";
import { AuthLayout } from "../layouts/AuthLayout";
import {
  hasErrors,
  validateLogin,
  type FieldErrors,
} from "../utils/validation";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/";

  const [values, setValues] = useState({ identifier: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [credentialsRejected, setCredentialsRejected] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormError(null);
    setCredentialsRejected(false);
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (credentialsRejected) return;
    setFormError(null);

    const validationErrors = validateLogin(values);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    setSubmitting(true);
    try {
      await login(values);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const rejected = getErrorStatus(err) === 401;
      setCredentialsRejected(rejected);
      setFormError(
        rejected ? "Usuario o contraseña incorrectos" : getErrorMessage(err),
      );
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Iniciar sesión"
      subtitle="Accede para gestionar tu colección de Pokémon"
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <Link
            to="/register"
            className="font-medium text-red-600 hover:underline"
          >
            Regístrate
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {formError && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {formError}
          </p>
        )}

        <TextField
          label="Correo o nombre de usuario"
          name="identifier"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          value={values.identifier}
          onChange={handleChange}
          error={errors.identifier}
        />
        <TextField
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
        />

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-lg bg-red-600 px-4 py-2.5 font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
        >
          {submitting ? "Ingresando..." : "Iniciar sesión"}
        </button>
      </form>
    </AuthLayout>
  );
}
