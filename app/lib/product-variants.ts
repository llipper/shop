import type { Product, ProductVariant } from "@/types/product";
import { sortBrazilianSizes } from "@/lib/size-utils";

export function getSizesForColor(
  variants: ProductVariant[],
  color: string,
): string[] {
  return sortBrazilianSizes([
    ...new Set(
      variants.filter((v) => v.color === color).map((v) => v.size),
    ),
  ]);
}

export function getColorsForSize(
  variants: ProductVariant[],
  size: string,
): string[] {
  return [
    ...new Set(
      variants.filter((v) => v.size === size).map((v) => v.color),
    ),
  ];
}

export function findVariant(
  variants: ProductVariant[],
  color: string,
  size: string,
): ProductVariant | undefined {
  return variants.find((v) => v.color === color && v.size === size);
}

export function getUniqueColors(variants: ProductVariant[]): string[] {
  return [...new Set(variants.map((v) => v.color))];
}

export function getVariantImageForColor(
  variants: ProductVariant[],
  color: string,
): string | undefined {
  return variants.find((v) => v.color === color)?.image;
}

export function getInitialSelection(product: Product): {
  color: string;
  size: string;
} {
  const variants = product.variants ?? [];
  if (variants.length === 0) {
    return {
      color: product.color || "Único",
      size: product.sizes?.[0] ?? "Único",
    };
  }

  const color = product.colors?.[0] ?? variants[0].color;
  const sizes = getSizesForColor(variants, color);
  return {
    color,
    size: sizes[0] ?? variants[0].size,
  };
}