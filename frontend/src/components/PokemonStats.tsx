import type { PokemonStat } from "../types/pokemon";
import { InfoRow, InfoTable, Upright } from "./InfoTable";

// Valor máximo posible de una estadística base: es el 100% de la barra
const MAX_STAT = 255;

// Nombres en español y colores de barra
const STATS: Record<string, { label: string; color: string }> = {
  hp: { label: "PS", color: "bg-green-500" },
  attack: { label: "Ataque", color: "bg-red-500" },
  defense: { label: "Defensa", color: "bg-orange-400" },
  "special-attack": { label: "At. Esp.", color: "bg-pink-400" },
  "special-defense": { label: "Def. Esp.", color: "bg-yellow-400" },
  speed: { label: "Velocidad", color: "bg-blue-500" },
};

interface PokemonStatsProps {
  stats: PokemonStat[];
}

// Una sola tabla con una estadística por fila y barras largas.
export function PokemonStats({ stats }: PokemonStatsProps) {
  return (
    <InfoTable className="[--pitch:3rem] [&>div]:h-12">
      {stats.map((stat, index) => {
        const config = STATS[stat.name] ?? {
          label: stat.name,
          color: "bg-slate-500",
        };
        const percent = Math.min(100, (stat.value / MAX_STAT) * 100);
        return (
          <InfoRow
            key={stat.name}
            label={config.label}
            valueClassName="justify-start md:pr-24"
            upright={false}
            columnsClassName="h-12 grid-cols-[minmax(7rem,38%)_1fr] gap-x-0.5 bg-dex-frame-dark md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
            labelClassName="md:pl-20"
            // La franja "Estadísticas base" es la fila 0
            // Así las etiquetas quedan alineadas con su texto
            alignRow={index + 1}
            alignLabel
          >
            <Upright className="w-9 shrink-0 justify-end font-bold">
              {stat.value}
            </Upright>
            <span
              aria-hidden="true"
              className="h-3.5 flex-1 overflow-hidden rounded-xs border-2 border-dex-frame-dark bg-white"
            >
              <span
                className={`block h-full shadow-[inset_0_-3px_0_0_rgb(0_0_0/0.2)] ${config.color}`}
                style={{ width: `${percent}%` }}
              />
            </span>
          </InfoRow>
        );
      })}
    </InfoTable>
  );
}
