import { useState, type ReactNode } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Button } from "../components/Button";
import { TrainerBadge } from "../components/TrainerBadge";
import { isFromCollection } from "../utils/navigation";

export function AppLayout() {
  const { user, logout } = useAuth();
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { pathname, state } = useLocation();
  // Una ficha pertenece a la sección desde la que se abrió
  const inDetail = pathname.startsWith("/pokemon/");
  const inCollectionSection =
    pathname === "/collection" || (inDetail && isFromCollection(state));
  const inPokedex = pathname === "/" || (inDetail && !inCollectionSection);

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

      {/* Pestañas de carpeta: la activa tiene el color del fondo de la página,
          así parece unida al contenido */}
      <nav aria-label="Secciones" className="bg-dex-frame-dark">
        <div className="mx-auto flex max-w-6xl gap-1 px-4 pt-1.5">
          <NavTab to="/" active={inPokedex}>
            Pokédex
          </NavTab>
          <NavTab to="/collection" active={inCollectionSection}>
            Mi colección
          </NavTab>
        </div>
      </nav>

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

interface NavTabProps {
  to: string;
  active: boolean;
  children: ReactNode;
}

function NavTab({ to, active, children }: NavTabProps) {
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={`rounded-t-md px-4 pt-1.5 pb-2 transition focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-dex-accent focus-visible:ring-2 focus-visible:ring-white ${
        active
          ? "bg-dex-bg text-dex-text pixel-shadow"
          : "text-white pixel-shadow-ink hover:bg-dex-frame"
      }`}
    >
      {children}
    </Link>
  );
}
