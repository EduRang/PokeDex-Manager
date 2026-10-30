import { useState } from "react";
import { Link } from "react-router-dom";
import type { PokemonListItem } from "../types/pokemon";
import { formatPokemonName, formatPokemonNumber } from "../utils/format";
import { TypeBadge } from "./TypeBadge";

interface PokemonCardProps {
  pokemon: PokemonListItem;
  typeLabels: Record<string, string>;
}

export function PokemonCard({ pokemon, typeLabels }: PokemonCardProps) {
  const [spriteLoaded, setSpriteLoaded] = useState(false);
  const [spriteFailed, setSpriteFailed] = useState(false);

  return (
    // Toda la tarjeta es un enlace al detalle
    // Al pasar el ratón se eleva un poco con una sombra más profunda. Al pulsarla se hunde y encoge un poco
    <Link
      to={`/pokemon/${pokemon.id}`}
      className="flex h-full flex-col gap-1 rounded-md border-2 border-dex-frame-dark bg-dex-frame p-1 shadow-[0_3px_0_0_rgb(0_0_0/0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_rgb(0_0_0/0.25)] active:translate-y-0.5 active:scale-[0.97] active:shadow-[0_1px_0_0_rgb(0_0_0/0.2)] active:duration-75 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-dex-accent motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:translate-y-0 motion-reduce:active:scale-100"
    >
      {/* Recuadro blanco con cuadrícula suave */}
      <div className="relative flex h-28 items-center justify-center rounded-sm bg-white bg-[linear-gradient(#e3eef3_1px,transparent_1px),linear-gradient(90deg,#e3eef3_1px,transparent_1px)] bg-size-[12px_12px]">
        {spriteFailed ? (
          <span
            aria-hidden="true"
            className="relative text-dex-lg text-dex-muted"
          >
            ?
          </span>
        ) : (
          <>
            {!spriteLoaded && (
              <div
                aria-hidden="true"
                className="absolute h-16 w-16 animate-pulse rounded-full bg-dex-panel"
              />
            )}
            <img
              src={pokemon.sprite}
              alt={formatPokemonName(pokemon.name)}
              width={96}
              height={96}
              loading="lazy"
              onLoad={() => setSpriteLoaded(true)}
              onError={() => setSpriteFailed(true)}
              className={`relative h-24 w-24 transition-opacity duration-300 [image-rendering:pixelated] ${spriteLoaded ? "opacity-100" : "opacity-0"}`}
            />
          </>
        )}
      </div>

      {/* Placa con número y nombre */}
      <div className="flex flex-1 flex-col items-center gap-1.5 rounded-sm border-2 border-dex-edge bg-dex-panel px-2 py-1.5">
        <h2 className="text-center leading-tight pixel-shadow">
          <span className="font-bold text-dex-frame">
            {formatPokemonNumber(pokemon.id)}
          </span>{" "}
          {formatPokemonName(pokemon.name)}
        </h2>
        <div className="flex flex-wrap justify-center gap-1">
          {pokemon.types.map((type) => (
            <TypeBadge key={type} type={type} label={typeLabels[type]} />
          ))}
        </div>
      </div>
    </Link>
  );
}
