import { useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { usePokemonDetail } from "../hooks/usePokemonDetail";
import { usePokemonTypes } from "../hooks/usePokemonTypes";
import { Button } from "../components/Button";
import { Panel } from "../components/Panel";
import {
  InfoRow,
  InfoSectionTitle,
  InfoSheet,
  InfoTable,
  SkewedBlock,
  Upright,
} from "../components/InfoTable";
import { PokemonStats } from "../components/PokemonStats";
import { Spinner } from "../components/Spinner";
import { TypeBadge } from "../components/TypeBadge";
import {
  formatMeasure,
  formatPokemonName,
  formatPokemonNumber,
} from "../utils/format";
import type { PokemonDetail } from "../types/pokemon";

const APP_TITLE = "PokéDex Manager";

export function PokemonDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { pokemon, error, notFound, retry } = usePokemonDetail(id);
  const { labels } = usePokemonTypes();

  // Nombre del Pokémon en la pestaña del navegador
  useEffect(() => {
    if (!pokemon) return;
    document.title = `${formatPokemonName(pokemon.name)} · ${APP_TITLE}`;
    return () => {
      document.title = APP_TITLE;
    };
  }, [pokemon]);

  // Volver atrás en el historial conserva la página, la búsqueda y los tipos de la lista
  // Si se entró directamente (enlace compartido), no hay a dónde
  // volver dentro de la app, así que se va a la lista
  function goBack() {
    if (location.key !== "default") navigate(-1);
    else navigate("/");
  }

  let content: ReactNode;
  if (notFound) {
    content = (
      <Panel className="mx-auto max-w-md" contentClassName="p-6 text-center">
        <p>Pokémon no encontrado.</p>
        <Button onClick={() => navigate("/")} className="mt-4">
          Ir a la Pokédex
        </Button>
      </Panel>
    );
  } else if (error) {
    content = (
      <Panel className="mx-auto max-w-md" contentClassName="p-6 text-center">
        <p>{error}</p>
        <Button onClick={retry} className="mt-4">
          Reintentar
        </Button>
      </Panel>
    );
  } else if (!pokemon) {
    content = (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  } else {
    content = <PokemonDetailView pokemon={pokemon} typeLabels={labels} />;
  }

  return (
    <section className="space-y-4">
      <Button variant="secondary" onClick={goBack}>
        <span aria-hidden="true">◀</span> Volver a la Pokédex
      </Button>
      {content}
    </section>
  );
}

interface PokemonDetailViewProps {
  pokemon: PokemonDetail;
  typeLabels: Record<string, string>;
}

function PokemonDetailView({ pokemon, typeLabels }: PokemonDetailViewProps) {
  const name = formatPokemonName(pokemon.name);
  const number = formatPokemonNumber(pokemon.id);

  // Una fila por habilidad. Si hay varias normales se numeran ("Habilidad 1", "Habilidad 2").
  // Si solo hay una, va sin número, y la oculta va aparte
  const regularAbilities = pokemon.abilities.filter((a) => !a.isHidden);
  const abilityRows = [
    ...regularAbilities.map((ability, index) => ({
      label:
        regularAbilities.length > 1 ? `Habilidad ${index + 1}` : "Habilidad",
      value: formatPokemonName(ability.name),
    })),
    ...pokemon.abilities
      .filter((ability) => ability.isHidden)
      .map((ability) => ({
        label: "Hab. oculta",
        value: formatPokemonName(ability.name),
      })),
  ];

  const dataRowCount = 3 + abilityRows.length;

  // Algunos no tienen sprite
  const [spriteFailed, setSpriteFailed] = useState(false);

  return (
    <InfoSheet title="Ficha Pokémon">
      {/* El eje de la inclinación pasa por el centro de la franja "Estadísticas base".
          Así su texto queda alineado con el título */}
      <SkewedBlock originY={`calc(${dataRowCount} * 3.5rem + 2px + 1.5rem)`}>
        <div className="grid gap-0.5 bg-dex-frame-dark md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* Recuadro del Pokémon: arriba la placa con número y nombre y,
              debajo, el sprite */}
          <section className="flex flex-col">
            {/* Placa del nombre: mide lo mismo que una fila de datos (h-14).
                El nombre completo sigue en el texto para lectores de pantalla */}
            <div className="flex h-14 items-center border-b-2 border-dex-frame-dark bg-linear-to-b from-white to-[#eef2f7] px-3 md:pl-12">
              <Upright className="min-w-0 flex-1 justify-center">
                <h1 className="min-w-0 truncate text-dex-lg pixel-shadow">
                  <span className="font-bold text-dex-muted">{number}</span>{" "}
                  {name}
                </h1>
              </Upright>
            </div>

            {/* Sin altura mínima: el recuadro se estira hasta la altura de la
                tabla de datos y ambos terminan a la vez */}
            <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-dex-cell py-4 md:pl-8">
              {/* Misma cuadrícula que las tarjetas de la lista, en un tono más
                  oscuro. Va en su propia capa enderezada (skew inverso) para que
                  las líneas queden rectas aunque el recuadro esté inclinado.
                  Es más ancha que el recuadro para cubrirlo entero */}
              <div
                aria-hidden="true"
                className="absolute inset-y-0 -inset-x-16 bg-[linear-gradient(#c9d4e0_1px,transparent_1px),linear-gradient(90deg,#c9d4e0_1px,transparent_1px)] bg-size-[16px_16px] md:skew-x-6"
              />
              {/* Sprite del Pokémon */}
              <Upright className="relative justify-center md:absolute md:inset-0 md:py-4 md:pl-8">
                {pokemon.sprite && !spriteFailed ? (
                  <img
                    src={pokemon.sprite}
                    alt={name}
                    width={192}
                    height={192}
                    onError={() => setSpriteFailed(true)}
                    // Mide 192 px (el doble del original) salvo que no quepa: max-h-full lo
                    // limita al alto disponible y object-contain lo encoge sin deformarlo.
                    // Así los Pokémon que llenan todo su lienzo (algunas megaevoluciones)
                    // caben en recuadros bajos. En móvil el alto no está limitado y siempre es 192
                    className="h-48 max-h-full w-48 object-contain [image-rendering:pixelated]"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="text-dex-lg text-dex-muted"
                  >
                    ?
                  </span>
                )}
              </Upright>
            </div>
          </section>

          {/* Filas de alto fijo para centrar los valores en una columna recta */}
          <InfoTable className="[--pitch:3.5rem] [&>div]:h-14">
            <InfoRow label="Tipo" alignRow={0} alignValue>
              {pokemon.types.map((type) => (
                <TypeBadge
                  key={type}
                  type={type}
                  label={typeLabels[type]}
                  size="md"
                />
              ))}
            </InfoRow>
            <InfoRow label="Altura" alignRow={1} alignValue>
              {formatMeasure(pokemon.heightMeters, "m")}
            </InfoRow>
            <InfoRow label="Peso" alignRow={2} alignValue>
              {formatMeasure(pokemon.weightKg, "kg")}
            </InfoRow>
            {abilityRows.map((row, index) => (
              <InfoRow
                key={`${row.label}-${index}`}
                label={row.label}
                alignRow={3 + index}
                alignValue
              >
                {row.value}
              </InfoRow>
            ))}
          </InfoTable>
        </div>

        <InfoSectionTitle>Estadísticas base</InfoSectionTitle>
        <PokemonStats stats={pokemon.stats} />
      </SkewedBlock>
    </InfoSheet>
  );
}
