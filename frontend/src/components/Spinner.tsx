export function Spinner({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Cargando"
      className={`animate-spin rounded-full border-4 border-slate-200 border-t-red-600 ${className}`}
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <Spinner className="h-12 w-12" />
    </div>
  );
}
