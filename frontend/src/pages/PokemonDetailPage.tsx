import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { usePokemonDetail } from "../hooks/usePokemonDetail";
import { usePokemonTypes } from "../hooks/usePokemonTypes";
import { Button, LinkButton } from "../components/Button";
import { MessagePanel } from "../components/Panel";
import { CollectionToggle } from "../components/CollectionToggle";
import {
  InfoRow,
  InfoSectionTitle,
  InfoSheet,
  InfoTable,
  SkewedBlock,
  Upright,
} from "../components/InfoTable";
import { PokemonStats } from "../components/PokemonStats";
import { SectionSpinner } from "../components/Spinner";
import { TypeBadge } from "../components/TypeBadge";
import {
  formatMeasure,
  formatPokemonName,
  formatPokemonNumber,
} from "../utils/format";
import type { PokemonDetail } from "../types/pokemon";
import { isFromCollection } from "../utils/navigation";

const APP_TITLE = "PokéDex Manager";

export function PokemonDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { pokemon, previous, next, inCollection, error, notFound, retry } =
    usePokemonDetail(id);
  const { labels } = usePokemonTypes();

  // Nombre del Pokémon en la pestaña del navegador
  useEffect(() => {
    if (!pokemon) return;
    document.title = `${formatPokemonName(pokemon.name)} · ${APP_TITLE}`;
    return () => {
      document.title = APP_TITLE;
    };
  }, [pokemon]);

  // Si la ficha se abrió desde "Mi colección", "Volver" lleva allí
  const fromCollection = isFromCollection(location.state);

  // Volver atrás en el historial conserva la página, la búsqueda y los tipos de la lista
  // Si se entró directamente (enlace compartido), no hay a dónde
  // volver dentro de la app, así que se va a la lista
  function goBack() {
    if (location.key !== "default") navigate(-1);
    else navigate(fromCollection ? "/collection" : "/");
  }

  let content: ReactNode;
  if (notFound) {
    content = (
      <MessagePanel>
        <p>Pokémon no encontrado.</p>
        <Button onClick={() => navigate("/")} className="mt-4">
          Ir a la Pokédex
        </Button>
      </MessagePanel>
    );
  } else if (error) {
    content = (
      <MessagePanel>
        <p>{error}</p>
        <Button onClick={retry} className="mt-4">
          Reintentar
        </Button>
      </MessagePanel>
    );
  } else if (!pokemon) {
    content = <SectionSpinner />;
  } else {
    content = (
      <PokemonDetailView
        pokemon={pokemon}
        inCollection={inCollection}
        typeLabels={labels}
      />
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="secondary" onClick={goBack}>
          <span aria-hidden="true">◀</span>{" "}
          {fromCollection ? "Volver a mi colección" : "Volver a la Pokédex"}
        </Button>

        {/* replace sustituye la entrada del historial. Se le pasa el mismo
            state para no perder desde dónde se abrió la primera ficha */}
        {(previous || next) && (
          <nav aria-label="Pokémon anterior y siguiente" className="flex gap-2">
            {previous && (
              <LinkButton
                to={`/pokemon/${previous.id}`}
                replace
                state={location.state}
                aria-label={`Anterior: ${formatPokemonNumber(previous.id)} ${formatPokemonName(previous.name)}`}
              >
                <span aria-hidden="true">◀</span>
                {formatPokemonNumber(previous.id)}
                <span className="hidden sm:inline">
                  {formatPokemonName(previous.name)}
                </span>
              </LinkButton>
            )}
            {next && (
              <LinkButton
                to={`/pokemon/${next.id}`}
                replace
                state={location.state}
                aria-label={`Siguiente: ${formatPokemonNumber(next.id)} ${formatPokemonName(next.name)}`}
              >
                {formatPokemonNumber(next.id)}
                <span className="hidden sm:inline">
                  {formatPokemonName(next.name)}
                </span>
                <span aria-hidden="true">▶</span>
              </LinkButton>
            )}
          </nav>
        )}
      </div>
      {content}
    </section>
  );
}

interface PokemonDetailViewProps {
  pokemon: PokemonDetail;
  inCollection: boolean;
  typeLabels: Record<string, string>;
}

function PokemonDetailView({
  pokemon,
  inCollection,
  typeLabels,
}: PokemonDetailViewProps) {
  const name = formatPokemonName(pokemon.name);
  const number = formatPokemonNumber(pokemon.id);

  // Una fila por habilidad. Si hay varias normales se numeran ("Habilidad 1", "Habilidad 2").
  // Si solo hay una, va sin número, y la oculta va aparte
  const regularAbilities = pokemon.abilities.filter((a) => !a.isHidden);
  const abilityRows = [
    ...regularAbilities.map((ability, index) => ({
      label:
        regularAbilities.length > 1 ? `Habilidad ${index + 1}` : "Habilidad",
      value: ability.label,
    })),
    ...pokemon.abilities
      .filter((ability) => ability.isHidden)
      .map((ability) => ({
        label: "Hab. oculta",
        value: ability.label,
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
                tabla de datos y ambos terminan a la vez.
                En móvil mide lo que el sprite, así que pt-14 deja sitio arriba
                para el botón de la colección sin taparlo. Desde tablet no se
                reserva: el alto lo marca la tabla y achicaría el sprite */}
            <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-dex-cell pt-14 pb-4 md:py-4 md:pl-8">
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

              {/* Botón de la colección en la esquina superior izquierda. */}
              <Upright
                className="absolute top-3 left-3 z-10 md:left-[calc(3rem+(5-var(--rows))*3.5rem*tan(6deg))]"
                style={{ "--rows": dataRowCount } as CSSProperties}
              >
                <CollectionToggle
                  key={pokemon.id}
                  pokemonId={pokemon.id}
                  pokemonName={name}
                  initialInCollection={inCollection}
                />
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
