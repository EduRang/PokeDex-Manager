import { useState, type ChangeEvent, type SubmitEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage, getErrorStatus } from "../api/errors";
import { showErrorToast } from "../utils/toast";
import { TextField } from "../components/TextField";
import { AuthLayout } from "../layouts/AuthLayout";
import { Button } from "../components/Button";
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
      // Credenciales incorrectas: en el formulario, porque es lo que hay que corregir
      // Otros fallos (sin conexión, servidor caído) usan el aviso flotante
      const rejected = getErrorStatus(err) === 401;
      setCredentialsRejected(rejected);
      if (rejected) setFormError("Usuario o contraseña incorrectos");
      else showErrorToast(getErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Iniciar sesión"
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <Link
            to="/register"
            className="text-blue-700 underline hover:text-blue-900"
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
            className="rounded-sm border-2 border-dex-error bg-white px-3 py-2 text-dex-error"
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

        <Button type="submit" size="lg" disabled={submitting} className="mt-2">
          {submitting ? "Ingresando..." : "Iniciar sesión"}
        </Button>
      </form>
    </AuthLayout>
  );
}
