import { useEffect, useId, useRef, useState } from "react";
import { GreatBallIcon } from "./GreatBallIcon";

interface TrainerBadgeProps {
  username: string;
}

// Ficha de entrenador: etiqueta en azul marino y el nombre en celeste
// En móvil no cabe junto al título y "Cerrar sesión", así que solo se ve la
// Super Ball; al pulsarla aparece el nombre en una burbuja
export function TrainerBadge({ username }: TrainerBadgeProps) {
  return (
    <>
      <p className="hidden min-w-0 items-stretch overflow-hidden rounded-md border-2 border-dex-frame-dark shadow-[0_3px_0_0_rgb(0_0_0/0.2)] sm:flex">
        <span className="flex shrink-0 items-center gap-2 bg-dex-frame px-3 py-1 uppercase pixel-shadow-dark">
          <GreatBallIcon aria-hidden="true" className="h-6 w-6 shrink-0" />
          Entrenador
        </span>
        <span className="flex min-w-0 items-center border-l-2 border-dex-frame-dark bg-dex-panel px-3 text-dex-text pixel-shadow">
          {/* Los nombres largos se recortan; el completo queda en el title */}
          <span title={username} className="max-w-48 truncate">
            {username}
          </span>
        </span>
      </p>
      <MobileTrainerBadge username={username} />
    </>
  );
}

function MobileTrainerBadge({ username }: TrainerBadgeProps) {
  const [open, setOpen] = useState(false);
  const bubbleId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  // Se cierra con Escape o con un toque fuera de la burbuja
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (
        !bubbleRef.current?.contains(target) &&
        !buttonRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative sm:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={bubbleId}
        aria-label="Ver nombre de entrenador"
        onClick={() => setOpen((o) => !o)}
        className="flex rounded-md border-2 border-dex-frame-dark bg-dex-frame p-1.5 shadow-[0_3px_0_0_rgb(0_0_0/0.2)] transition hover:bg-dex-select focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-dex-accent focus-visible:ring-2 focus-visible:ring-white active:translate-y-0.5 active:shadow-none"
      >
        <GreatBallIcon className="h-6 w-6" />
      </button>

      {open && (
        <div
          ref={bubbleRef}
          id={bubbleId}
          className="absolute top-full right-0 z-20 mt-3 w-max max-w-[calc(100vw-2rem)] rounded-sm border-2 border-dex-frame bg-white px-3 py-2 text-dex-text shadow-[0_3px_0_0_rgb(0_0_0/0.2)]"
        >
          {/* Flecha que apunta a la Super Ball en celular */}
          <div
            aria-hidden="true"
            className="absolute -top-2 right-4 h-3 w-3 rotate-45 border-t-2 border-l-2 border-dex-frame bg-white"
          />
          <p className="relative break-all">{username}</p>
        </div>
      )}
    </div>
  );
}
