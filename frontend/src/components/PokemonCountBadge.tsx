import { PokeBallIcon } from "./PokeBallIcon";

// Forma de carpeta con pestaña arriba a la izquierda
const TAB_SHAPE =
  "polygon(0 0, 45% 0, calc(45% + 14px) 14px, 100% 14px, 100% 100%, 0 100%)";

interface PokemonCountBadgeProps {
  total: number;
  label: string; // "Pokémon en total", "Pokémon encontrados", "Pokémon capturados"
}

export function PokemonCountBadge({ total, label }: PokemonCountBadgeProps) {
  return (
    <div className="w-fit max-w-full drop-shadow-[0_3px_0_rgb(0_0_0/0.25)]">
      <div style={{ clipPath: TAB_SHAPE }} className="bg-dex-frame-dark p-0.5">
        <p
          style={{ clipPath: TAB_SHAPE }}
          aria-live="polite"
          className="flex items-center gap-3 bg-dex-select bg-[linear-gradient(115deg,transparent_62%,rgb(0_0_0/0.22)_62%)] pt-6 pr-8 pb-3 pl-4 text-white pixel-shadow-ink"
        >
          <PokeBallIcon
            aria-hidden="true"
            className="h-8 w-8 shrink-0 sm:h-9 sm:w-9"
          />
          <span className="text-dex-lg font-bold">{total}</span>
          <span className="leading-tight uppercase">{label}</span>
        </p>
      </div>
    </div>
  );
}
