import { useEffect, useRef, useState, type ReactNode } from "react";
import type { PokemonType } from "../types/pokemon";
import { Button } from "./Button";
import { Panel } from "./Panel";
import { TypeBadge } from "./TypeBadge";

const SEARCH_DEBOUNCE_MS = 300;

const MAX_SELECTED_TYPES = 2; // Un Pokémon tiene como mucho 2 tipos

const fieldClass =
  "w-full rounded-sm border-2 border-dex-frame bg-white px-3 py-2 transition focus:outline-4 focus:outline-offset-1 focus:outline-dex-accent";

interface PokemonFiltersProps {
  name: string;
  selectedTypes: string[];
  typeOptions: PokemonType[];
  typeLabels: Record<string, string>;
  onNameChange: (name: string) => void;
  onTypesChange: (types: string[]) => void;
  onClear: () => void;
  className?: string;
}

export function PokemonFilters({
  name,
  selectedTypes,
  typeOptions,
  typeLabels,
  onNameChange,
  onTypesChange,
  onClear,
  className = "",
}: PokemonFiltersProps) {
  const [text, setText] = useState(name);
  const [syncedName, setSyncedName] = useState(name);
  const [typesOpen, setTypesOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Si el nombre cambia desde fuera (botón atrás, "Limpiar filtros"), se
  // actualiza el campo. Se compara sin espacios para no borrar el que el
  // usuario acaba de escribir entre palabras ("mr " mientras escribe "mr mime")
  if (name !== syncedName) {
    setSyncedName(name);
    if (name !== text.trim()) setText(name);
  }

  useEffect(() => {
    const trimmed = text.trim();
    if (trimmed === name) return;
    const timeout = setTimeout(() => onNameChange(trimmed), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [text, name, onNameChange]);

  const hasFilters = Boolean(name || selectedTypes.length || text.trim());
  const maxReached = selectedTypes.length >= MAX_SELECTED_TYPES;

  function toggleType(type: string) {
    onTypesChange(
      selectedTypes.includes(type)
        ? selectedTypes.filter((t) => t !== type)
        : [...selectedTypes, type],
    );
  }

  // Borra al momento, sin esperar al debounce, y deja el foco en el campo
  // para poder escribir otra búsqueda
  function clearSearch() {
    setText("");
    onNameChange("");
    searchRef.current?.focus();
  }

  function closeTypes() {
    setTypesOpen(false);
    toggleRef.current?.focus();
  }

  // Panel flotante:
  // Se cierra con Escape o con un clic fuera de él.
  // Al abrir, el foco pasa a la primera opción.
  useEffect(() => {
    if (!typesOpen) return;
    popoverRef.current?.querySelector("input")?.focus();

    function handlePointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (
        !popoverRef.current?.contains(target) &&
        !toggleRef.current?.contains(target)
      ) {
        setTypesOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setTypesOpen(false);
        toggleRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [typesOpen]);

  return (
    // El panel de tipos se posiciona respecto a la barra
    <div className={`relative ${className}`}>
      <Panel contentClassName="p-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div role="search" className="relative flex-1">
            <label htmlFor="pokemon-search" className="sr-only">
              Buscar por nombre
            </label>
            {/* La X nativa de type="search" se oculta: no cambia el cursor ni
                reacciona al pasar el ratón, y Firefox no la muestra. En su
                lugar va un botón propio, igual en todos los navegadores */}
            <input
              ref={searchRef}
              id="pokemon-search"
              type="search"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Buscar por nombre…"
              maxLength={50}
              autoComplete="off"
              spellCheck={false}
              className={`${fieldClass} pr-11 [&::-webkit-search-cancel-button]:appearance-none`}
            />
            {text && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Borrar búsqueda"
                title="Borrar búsqueda"
                className="absolute top-1/2 right-1.5 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-sm text-dex-muted transition hover:bg-dex-cell hover:text-dex-text focus-visible:outline-4 focus-visible:outline-offset-1 focus-visible:outline-dex-accent active:bg-dex-panel"
              >
                <span aria-hidden="true">✕</span>
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {/* Cerrado muestra los tipos elegidos, para que el filtro no se pierda de vista */}
            <Button
              ref={toggleRef}
              variant="secondary"
              aria-expanded={typesOpen}
              aria-controls="type-filter-panel"
              onClick={() => setTypesOpen((open) => !open)}
              className="flex-1 sm:flex-none"
            >
              Tipo
              {selectedTypes.length > 0 ? (
                selectedTypes.map((t) => (
                  <TypeBadge key={t} type={t} label={typeLabels[t]} />
                ))
              ) : (
                <span className="text-dex-muted">: Todos</span>
              )}
              {/* Una sola flecha que gira 180° al abrir y cerrar, con la misma
                  duración que el panel */}
              <span
                aria-hidden="true"
                className={`inline-block transition-transform duration-150 ease-out motion-reduce:transition-none ${typesOpen ? "rotate-180" : ""}`}
              >
                ▼
              </span>
            </Button>

            {hasFilters && (
              <Button variant="secondary" onClick={onClear}>
                Limpiar
              </Button>
            )}
          </div>
        </div>
      </Panel>

      {/* transition-discrete retrasa el display: none hasta que termina la
          animación. Sin animación si el sistema pide reducir movimiento */}
      <div
        ref={popoverRef}
        id="type-filter-panel"
        className={`absolute top-full right-0 left-0 z-20 mt-2 transition-[opacity,translate,display] transition-discrete duration-150 ease-out motion-reduce:transition-none sm:left-auto sm:w-[26rem] ${
          typesOpen
            ? "block translate-y-0 opacity-100 starting:-translate-y-2 starting:opacity-0"
            : "hidden -translate-y-2 opacity-0"
        }`}
      >
        <Panel contentClassName="p-3">
          <div className="mb-2 flex items-center justify-between gap-3 border-b-2 border-dex-edge pb-2">
            <p id="type-filter-label">Elige hasta {MAX_SELECTED_TYPES} tipos</p>
            <Button size="sm" onClick={closeTypes}>
              Listo
            </Button>
          </div>

          <div
            role="group"
            aria-labelledby="type-filter-label"
            className="flex max-h-[60vh] flex-wrap gap-1.5 overflow-y-auto p-1.5 sm:gap-2 sm:p-2.5"
          >
            <TypeOption
              checked={selectedTypes.length === 0}
              onChange={() => onTypesChange([])}
            >
              <span className="inline-block rounded-xs border-2 border-black/30 bg-white px-2.5 py-1 font-display leading-5 tracking-wide whitespace-nowrap text-dex-text uppercase">
                Todos
              </span>
            </TypeOption>
            {typeOptions.map((t) => {
              const checked = selectedTypes.includes(t.name);
              return (
                <TypeOption
                  key={t.name}
                  checked={checked}
                  // Con 2 elegidos, el resto se bloquea hasta quitar uno
                  disabled={!checked && maxReached}
                  onChange={() => toggleType(t.name)}
                >
                  <TypeBadge type={t.name} label={t.label} size="md" />
                </TypeOption>
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
}

interface TypeOptionProps {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  children: ReactNode;
}

function TypeOption({
  checked,
  disabled = false,
  onChange,
  children,
}: TypeOptionProps) {
  return (
    <label
      className={`shrink-0 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="peer sr-only"
      />
      <span className="block rounded-xs transition peer-checked:ring-3 peer-checked:ring-dex-frame-dark peer-checked:ring-offset-1 peer-checked:ring-offset-dex-panel peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-dex-accent sm:peer-checked:ring-4 sm:peer-checked:ring-offset-2 sm:peer-focus-visible:outline-4 sm:peer-focus-visible:outline-offset-4 peer-disabled:opacity-40 peer-enabled:hover:brightness-110">
        {children}
      </span>
    </label>
  );
}
