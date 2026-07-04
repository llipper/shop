/**
 * A cor (nome) vem da Shopify na opção Cor/Color de cada variante.
 * A Shopify não envia código hex — só o texto ("Bordô", "Black", etc.).
 * Este arquivo só ajuda a exibir um swatch quando não há imagem da variante.
 * Não altera variantId, checkout nem estoque.
 */
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
  "verde escuro": "#1A2E2A",
  green: "#22c55e",
  vermelho: "#ef4444",
  red: "#ef4444",
  bordô: "#4B242C",
  bordo: "#4B242C",
  bordeaux: "#4B242C",
  osso: "#E8E6DF",
  carvão: "#3A3D42",
  carvao: "#3A3D42",
  "índigo lavado": "#425C76",
  "indigo lavado": "#425C76",
  oliva: "#6B7C4C",
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
  clear: "#f5f5f5",
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
  if (NAMED_COLORS[key]) return NAMED_COLORS[key];

  const partial = Object.entries(NAMED_COLORS).find(([label]) =>
    key.includes(label),
  );
  if (partial) return partial[1];

  return hashColor(name);
}