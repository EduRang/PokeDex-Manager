// "mr-mime" -> "Mr Mime"
export function formatPokemonName(name: string): string {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// 25 -> "#0025"
export function formatPokemonNumber(id: number): string {
  return `#${String(id).padStart(4, "0")}`;
}
