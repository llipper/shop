const NAMED_COLORS: Record<string, string> = {
  preto: "#1a1a1a",
  black: "#1a1a1a",
  branco: "#f5f5f5",
  white: "#f5f5f5",
  pink: "#f9a8d4",
  rosa: "#f9a8d4",
  azul: "#3b82f6",
  blue: "#3b82f6",
  verde: "#22c55e",
  green: "#22c55e",
  vermelho: "#ef4444",
  red: "#ef4444",
  amarelo: "#eab308",
  yellow: "#eab308",
  cinza: "#9ca3af",
  grey: "#9ca3af",
  gray: "#9ca3af",
  marrom: "#92400e",
  brown: "#92400e",
  bege: "#d6c4a8",
  beige: "#d6c4a8",
  navy: "#1e3a5f",
  marinho: "#1e3a5f",
  laranja: "#f97316",
  orange: "#f97316",
  roxo: "#a855f7",
  purple: "#a855f7",
  lilás: "#c084fc",
  lilac: "#c084fc",
};

function hashColor(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 45%, 55%)`;
}

export function colorToHex(name: string): string {
  const key = name.toLowerCase().trim();
  return NAMED_COLORS[key] ?? hashColor(name);
}