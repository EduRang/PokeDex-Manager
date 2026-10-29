// Clases completas (no construidas con variables) para que Tailwind las detecte
const TYPE_COLORS: Record<string, string> = {
  normal: "bg-stone-500 text-white",
  fighting: "bg-red-700 text-white",
  flying: "bg-indigo-200 text-indigo-950",
  poison: "bg-purple-600 text-white",
  ground: "bg-amber-700 text-white",
  rock: "bg-yellow-800 text-white",
  bug: "bg-lime-300 text-lime-950",
  ghost: "bg-violet-700 text-white",
  steel: "bg-slate-500 text-white",
  fire: "bg-orange-700 text-white",
  water: "bg-blue-600 text-white",
  grass: "bg-green-700 text-white",
  electric: "bg-yellow-300 text-yellow-950",
  psychic: "bg-pink-700 text-white",
  ice: "bg-cyan-200 text-cyan-950",
  dragon: "bg-indigo-600 text-white",
  dark: "bg-stone-700 text-white",
  fairy: "bg-pink-200 text-pink-950",
};

interface TypeBadgeProps {
  type: string;
  label?: string; // Nombre en español. Si aún no llegó, se muestra el original
}

// Etiqueta rectangular en mayúsculas
export function TypeBadge({ type, label }: TypeBadgeProps) {
  const colors = TYPE_COLORS[type] ?? "bg-slate-500 text-white";
  return (
    <span
      className={`rounded-xs border-2 border-black/30 px-1.5 font-display text-sm leading-5 tracking-wide uppercase ${colors}`}
    >
      {label ?? type}
    </span>
  );
}
