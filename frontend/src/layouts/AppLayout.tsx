import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Button } from "../components/Button";
import { TrainerBadge } from "../components/TrainerBadge";

export function AppLayout() {
  const { user, logout } = useAuth();
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
  }

  return (
    <div className="min-h-screen">
      <header className="border-b-4 border-dex-frame-dark bg-dex-accent text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-4">
          <Link
            to="/"
            className="shrink-0 text-lg pixel-shadow-accent sm:text-dex-lg"
          >
            PokéDex Manager
          </Link>

          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {user && <TrainerBadge username={user.username} />}
            <Button
              variant="secondary"
              size="sm"
              className="shrink-0 whitespace-nowrap"
              onClick={() => setConfirmingLogout(true)}
            >
              Cerrar sesión
            </Button>
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
