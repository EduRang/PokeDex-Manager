// Estado que viaja con el enlace a una ficha para saber desde dónde se abrió.
// Así "Volver" dice a dónde lleva y la pestaña activa coincide
export interface DetailLinkState {
  from: "collection";
}

export function isFromCollection(state: unknown): boolean {
  return (state as DetailLinkState | null)?.from === "collection";
}
