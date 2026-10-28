import { useState, type ChangeEvent, type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage, getErrorStatus } from "../api/errors";
import { TextField } from "../components/TextField";
import { RequirementsHint } from "../components/RequirementsHint";
import { AuthLayout } from "../layouts/AuthLayout";
import {
  hasErrors,
  PASSWORD_REQUIREMENTS,
  USERNAME_REQUIREMENTS,
  validateRegister,
  type FieldErrors,
  type RegisterFormValues,
} from "../utils/validation";

const INITIAL_VALUES: RegisterFormValues = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [userTaken, setUserTaken] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormError(null);
    setUserTaken(false);
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (userTaken) return;
    setFormError(null);

    const validationErrors = validateRegister(values);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    setSubmitting(true);
    try {
      await register({
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      navigate("/", { replace: true });
    } catch (err) {
      const taken = getErrorStatus(err) === 409;
      setUserTaken(taken);
      setFormError(
        taken
          ? "El nombre de usuario o el correo ya están registrados"
          : getErrorMessage(err),
      );
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Crear cuenta"
      subtitle="Regístrate para empezar tu colección"
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link
            to="/login"
            className="font-medium text-red-600 hover:underline"
          >
            Inicia sesión
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
          label="Nombre de usuario"
          name="username"
          autoComplete="username"
          value={values.username}
          onChange={handleChange}
          error={errors.username}
          hint={
            <RequirementsHint
              title="El nombre de usuario debe tener:"
              requirements={USERNAME_REQUIREMENTS}
              value={values.username}
              note="Se guardará en minúsculas."
            />
          }
        />
        <TextField
          label="Correo electrónico"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
        />
        <TextField
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          hint={
            <RequirementsHint
              title="La contraseña debe tener:"
              requirements={PASSWORD_REQUIREMENTS}
              value={values.password}
            />
          }
        />
        <TextField
          label="Confirmar contraseña"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-lg bg-red-600 px-4 py-2.5 font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
        >
          {submitting ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>
    </AuthLayout>
  );
}
