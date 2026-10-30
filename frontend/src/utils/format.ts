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

// Formato numérico mexicano (es-MX), con hasta un decimal: 0.4 -> "0.4", 6 -> "6"
const decimalFormat = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 1,
});

// (0.4, "m") -> "0.4 m"
export function formatMeasure(value: number, unit: string): string {
  return `${decimalFormat.format(value)} ${unit}`;
}
