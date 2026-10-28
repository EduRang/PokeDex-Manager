import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ConfirmDialog } from "../components/ConfirmDialog";

export function AppLayout() {
  const { user, logout } = useAuth();
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-red-600 text-white shadow">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="text-lg font-bold sm:text-xl">
            PokéDex Manager
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm sm:inline">
              Hola, <strong>{user?.username}</strong>
            </span>
            <button
              type="button"
              onClick={() => setConfirmingLogout(true)}
              className="rounded-lg bg-white/15 px-3 py-1.5 text-sm font-medium transition hover:bg-white/25"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>

      <ConfirmDialog
        open={confirmingLogout}
        title="¿Cerrar sesión?"
        message="Tendrás que volver a iniciar sesión para acceder a tu colección."
        confirmLabel="Cerrar sesión"
        loading={loggingOut}
        loadingLabel="Saliendo..."
        onConfirm={handleLogout}
        onCancel={() => setConfirmingLogout(false)}
      />
    </div>
  );
}
