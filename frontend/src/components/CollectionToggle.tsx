import { useState } from "react";
import { addToCollection, removeFromCollection } from "../api/collection";
import { getErrorMessage } from "../api/errors";
import { clearCollectionCache } from "../hooks/useCollection";
import { showErrorToast } from "../utils/toast";
import { Button } from "./Button";
import { ConfirmDialog } from "./ConfirmDialog";
import { PokeBallIcon } from "./PokeBallIcon";

interface CollectionToggleProps {
  pokemonId: number;
  pokemonName: string;
  initialInCollection: boolean;
}

// Captura (añade) o libera (quita) el Pokémon de la colección del usuario.
// - Sin capturar: un botón oscuro "Capturar" con la Poké Ball que se balancea.
// - Capturado: una ficha con la Poké Ball en celeste (estado) y el botón
//   "Liberar" en gris carbón (acción)
//   Liberar pide confirmación antes.
// El estado cambia cuando el servidor confirma, no antes, para no mostrar
// algo que no se guardó. Al cambiar de Pokémon se monta de nuevo (key)
export function CollectionToggle({
  pokemonId,
  pokemonName,
  initialInCollection,
}: CollectionToggleProps) {
  const [inCollection, setInCollection] = useState(initialInCollection);
  const [saving, setSaving] = useState(false);
  const [confirmingRelease, setConfirmingRelease] = useState(false);
  // Se anuncia a lectores de pantalla cuando termina
  const [status, setStatus] = useState("");

  async function capture() {
    setSaving(true);
    setStatus("");
    try {
      await addToCollection(pokemonId);
      // La colección cambió: las páginas cacheadas ya no sirven
      clearCollectionCache();
      setInCollection(true);
      setStatus(`${pokemonName} se añadió a tu colección`);
    } catch (err) {
      showErrorToast(
        `No se pudo capturar a ${pokemonName}. ${getErrorMessage(err)}`,
      );
    } finally {
      setSaving(false);
    }
  }

  async function release() {
    setSaving(true);
    setStatus("");
    try {
      await removeFromCollection(pokemonId);
      clearCollectionCache();
      setInCollection(false);
      setStatus(`${pokemonName} se quitó de tu colección`);
    } catch (err) {
      showErrorToast(
        `No se pudo liberar a ${pokemonName}. ${getErrorMessage(err)}`,
      );
    } finally {
      setSaving(false);
      setConfirmingRelease(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      {inCollection ? (
        <div className="flex items-stretch rounded border-2 border-dex-frame-dark bg-dex-frame-dark shadow-[0_3px_0_0_rgb(0_0_0/0.2)]">
          <span
            title="Capturado"
            className="flex items-center rounded-l-xs bg-dex-panel px-3 text-dex-text"
          >
            <PokeBallIcon aria-hidden="true" className="h-6 w-6 shrink-0" />
            <span className="sr-only">Capturado</span>
          </span>
          <button
            type="button"
            onClick={() => setConfirmingRelease(true)}
            aria-label={`Liberar a ${pokemonName}`}
            title="Quitar de mi colección"
            className="rounded-r-xs border-l-2 border-dex-frame-dark bg-dex-ink px-3 pt-1 pb-1.5 text-white pixel-shadow-ink shadow-[inset_0_-4px_0_0_var(--color-dex-ink-dark)] transition hover:bg-dex-select focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-dex-accent focus-visible:ring-2 focus-visible:ring-white active:shadow-none"
          >
            Liberar
          </button>
        </div>
      ) : (
        // Botón oscuro (acción principal).
        // La Poké Ball se balancea al pasar el ratón o con el foco, y
        // tambien se balancea mientras se guarda
        <Button
          size="sm"
          onClick={capture}
          disabled={saving}
          aria-label={`Capturar a ${pokemonName}`}
          title="Añadir a mi colección"
          className="group"
        >
          <PokeBallIcon
            aria-hidden="true"
            className={`h-6 w-6 shrink-0 origin-bottom motion-reduce:animate-none ${
              saving
                ? "animate-wobble"
                : "group-hover:animate-wobble group-focus-visible:animate-wobble"
            }`}
          />
          {saving ? "Capturando…" : "Capturar"}
        </Button>
      )}
      <p aria-live="polite" className="sr-only">
        {status}
      </p>

      <ConfirmDialog
        open={confirmingRelease}
        title={`¿Liberar a ${pokemonName}?`}
        message="Se quitará de tu colección. Podrás volver a capturarlo cuando quieras."
        confirmLabel="Liberar"
        loading={saving}
        loadingLabel="Liberando..."
        onConfirm={release}
        onCancel={() => setConfirmingRelease(false)}
      />
    </div>
  );
}
