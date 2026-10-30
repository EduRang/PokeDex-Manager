import { PokeBallIcon } from "./PokeBallIcon";

export function Spinner({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <PokeBallIcon
      role="status"
      aria-label="Cargando"
      className={`origin-bottom animate-wobble ${className}`}
    />
  );
}

// Mientras carga el contenido de una página (listado, colección, ficha)
export function SectionSpinner() {
  return (
    <div className="flex justify-center py-20">
      <Spinner />
    </div>
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner className="h-14 w-14" />
    </div>
  );
}
