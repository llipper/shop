export interface ProductVariant {
  id: string;
  color: string;
  size: string;
  image: string;
  hex: string;
  price: number;
  compareAtPrice?: number;
  availableForSale?: boolean;
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  price: number;
  maxPrice?: number;
  currencyCode?: string;
  image: string;
  color: string;
  category: "Masculino" | "Feminino" | "Objetos";
  productType?: string;
  vendor?: string;
  description?: string;
  descriptionHtml?: string;
  colors?: string[];
  sizes?: string[];
  gallery?: string[];
  variants?: ProductVariant[];
  badge?: "Novo" | "Mais Vendido" | "Limitado";
  tags?: string[];
}