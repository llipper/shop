import type { Product } from "@/types/product";

const MATERIAL_BY_CATEGORY: Record<Product["category"], string> = {
  Masculino: "100% algodão penteado de alta densidade, 240 g/m²",
  Feminino: "Malha premium em algodão orgânico com toque acetinado",
  Objetos: "Materiais selecionados com acabamento artesanal",
};

export function getPremiumHighlights(product: Product): string[] {
  const type = product.productType?.toLowerCase() ?? "";
  const isApparel = type.includes("camis") || type.includes("roupa");

  if (isApparel) {
    return [
      "Modelagem oversized com caimento estruturado",
      "Bordado de alta definição com acabamento premium",
      "Costuras reforçadas para maior durabilidade",
    ];
  }

  return [
    "Curadoria exclusiva ROUHI",
    "Acabamento refinado em cada detalhe",
    "Produção limitada por lote",
  ];
}

export function getPremiumFallbackDescription(product: Product): string[] {
  return [
    `${product.title} foi pensada para elevar o essencial do seu guarda-roupa. Cada peça combina conforto, presença visual e qualidade de construção — sem excessos, com identidade.`,
    `Desenvolvida para o dia a dia com estética contemporânea, esta peça traduz o DNA da ROUHI: minimalismo sofisticado, materiais selecionados e caimento impecável.`,
    "Ideal para composições casuais e looks urbanos. Combine com calças estruturadas, jaquetas leves ou acessórios discretos para um visual completo.",
  ];
}

export function getMaterialLine(product: Product): string {
  return MATERIAL_BY_CATEGORY[product.category];
}

export function hasRichDescription(product: Product): boolean {
  const html = product.descriptionHtml?.replace(/<[^>]+>/g, "").trim();
  const text = product.description?.trim();
  return Boolean(html && html.length > 40) || Boolean(text && text.length > 40);
}