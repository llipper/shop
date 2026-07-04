const INTERNATIONAL_TO_BR: Record<string, string> = {
  xs: "PP",
  "x-s": "PP",
  "extra small": "PP",
  s: "P",
  small: "P",
  m: "M",
  medium: "M",
  l: "G",
  large: "G",
  xl: "GG",
  "x-l": "GG",
  "extra large": "GG",
  "2xl": "XGG",
  "2x": "XGG",
  xxl: "XGG",
  "xx-l": "XGG",
  "double extra large": "XGG",
  "3xl": "GGG",
  "3x": "GGG",
  xxxl: "GGG",
};

const BRAZILIAN_SIZES = new Set([
  "PP",
  "XP",
  "P",
  "M",
  "G",
  "GG",
  "XG",
  "XGG",
  "GGG",
  "G1",
  "G2",
  "ÚNICO",
  "UNICO",
  "ONE SIZE",
]);

export const BRAZILIAN_SIZE_ORDER = [
  "PP",
  "XP",
  "P",
  "M",
  "G",
  "GG",
  "XG",
  "XGG",
  "GGG",
  "G1",
  "G2",
  "Único",
] as const;

function normalizeSizeKey(size: string): string {
  return size.trim().toLowerCase().replace(/\s+/g, " ");
}

export function toBrazilianSize(size: string): string {
  const trimmed = size.trim();
  if (!trimmed) return "Único";

  const upper = trimmed.toUpperCase();
  if (upper === "UNICO" || upper === "ONE SIZE") return "Único";
  if (BRAZILIAN_SIZES.has(upper)) return upper;

  const key = normalizeSizeKey(trimmed);
  const compact = key.replace(/\s+/g, "");

  return INTERNATIONAL_TO_BR[key] ?? INTERNATIONAL_TO_BR[compact] ?? trimmed;
}

export function normalizeBrazilianSizes(sizes: string[]): string[] {
  const seen = new Set<string>();

  return sizes.reduce<string[]>((result, size) => {
    const converted = toBrazilianSize(size);
    if (!seen.has(converted)) {
      seen.add(converted);
      result.push(converted);
    }
    return result;
  }, []);
}

export function sortBrazilianSizes(sizes: string[]): string[] {
  return [...sizes].sort((left, right) => {
    const leftIndex = BRAZILIAN_SIZE_ORDER.indexOf(
      left as (typeof BRAZILIAN_SIZE_ORDER)[number],
    );
    const rightIndex = BRAZILIAN_SIZE_ORDER.indexOf(
      right as (typeof BRAZILIAN_SIZE_ORDER)[number],
    );

    if (leftIndex === -1 && rightIndex === -1) {
      return left.localeCompare(right, "pt-BR");
    }
    if (leftIndex === -1) return 1;
    if (rightIndex === -1) return -1;
    return leftIndex - rightIndex;
  });
}