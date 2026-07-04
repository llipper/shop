import type { Product } from "@/types/product";

export type ProductFilters = {
  categoria?: string;
  subcategoria?: string;
  tag?: string;
};

export const productCategories = ["Masculino", "Feminino", "Objetos"] as const;

export const productSubcategories: Record<string, string[]> = {
  Masculino: ["Camisetas", "Camisas", "Calças", "Bermudas", "Moletons", "Bonés", "Meias", "Carteiras", "Cintos"],
  Feminino: ["Camisetas", "Blusas", "Vestidos", "Calças", "Saias", "Bolsas", "Bijuterias", "Lenços", "Óculos"],
  Objetos: ["Cadernos", "Canetas", "Organizadores", "Mouse Pads", "Canecas", "Garrafas", "Quadros"],
};

export const defaultProductSizes = ["PP", "P", "M", "G", "GG", "XG", "XGG", "G1", "G2"];

export const filterColorSwatches = [
  { name: "Bordô", hex: "#4B242C" },
  { name: "Verde Escuro", hex: "#1A2E2A" },
  { name: "Osso", hex: "#E8E6DF" },
  { name: "Carvão", hex: "#3A3D42" },
  { name: "Índigo Lavado", hex: "#425C76" },
  { name: "Preto", hex: "#000000" },
];

function searchTerms(value: string): string[] {
  const lower = value.toLowerCase().trim();
  const terms = new Set<string>([lower]);

  if (lower.endsWith("s") && lower.length > 3) {
    terms.add(lower.slice(0, -1));
  }
  if (lower.endsWith("es") && lower.length > 4) {
    terms.add(lower.slice(0, -2));
  }
  if (lower.endsWith("ões")) {
    terms.add(lower.slice(0, -3) + "ão");
  }

  return [...terms];
}

function matchesText(haystack: string, needle: string): boolean {
  return searchTerms(needle).some((term) => haystack.includes(term));
}

function matchesSubcategoria(product: Product, subcategoria: string): boolean {
  const fields = [
    product.productType,
    product.title,
    ...(product.tags ?? []),
  ].filter(Boolean) as string[];

  return fields.some((field) => matchesText(field.toLowerCase(), subcategoria));
}

export function parseProductFilters(
  searchParams: URLSearchParams,
): ProductFilters {
  return {
    categoria: searchParams.get("categoria") ?? undefined,
    subcategoria: searchParams.get("subcategoria") ?? undefined,
    tag: searchParams.get("tag") ?? undefined,
  };
}

export function buildProductsHref(
  categoria: string,
  subcategoria?: string,
  tag?: string,
): string {
  const params = new URLSearchParams();
  params.set("categoria", categoria);
  if (subcategoria) params.set("subcategoria", subcategoria);
  if (tag) params.set("tag", tag);
  return `/produtos?${params.toString()}`;
}

export function filterProducts(
  products: Product[],
  filters: ProductFilters,
): Product[] {
  let result = products;

  if (filters.categoria) {
    result = result.filter((product) => product.category === filters.categoria);
  }

  if (filters.subcategoria) {
    result = result.filter((product) =>
      matchesSubcategoria(product, filters.subcategoria!),
    );
  }

  if (filters.tag) {
    const tag = filters.tag.toLowerCase();
    result = result.filter(
      (product) =>
        product.tags?.some((value) => value.toLowerCase().includes(tag)) ||
        product.badge?.toLowerCase().includes(tag),
    );
  }

  return result;
}

export function getFilterTitle(filters: ProductFilters): string {
  if (filters.subcategoria && filters.categoria) {
    return `${filters.subcategoria} · ${filters.categoria}`;
  }
  if (filters.categoria) return filters.categoria;
  if (filters.tag === "novo") return "Novidades";
  if (filters.tag === "sale") return "Sale";
  return "Todos os produtos";
}