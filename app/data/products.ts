import type { Product } from "@/types/product";

const sharedGallery = [
  "/product/camiseta_01.png",
  "/product/camiseta_02.png",
  "/product/camiseta_03.png",
  "/product/camiseta_04.png",
  "/product/camiseta_05.png",
];

const sharedVariants = [
  { id: "v1", color: "Bordô", size: "M", image: "/product/camiseta_01.png", hex: "#4B242C", price: 30 },
  { id: "v2", color: "Verde Escuro", size: "M", image: "/product/camiseta_02.png", hex: "#1A2E2A", price: 30 },
  { id: "v3", color: "Osso", size: "M", image: "/product/camiseta_03.png", hex: "#E8E6DF", price: 30 },
  { id: "v4", color: "Carvão", size: "M", image: "/product/camiseta_04.png", hex: "#3A3D42", price: 30 },
  { id: "v5", color: "Índigo Lavado", size: "M", image: "/product/camiseta_05.png", hex: "#425C76", price: 30 },
];

const defaultSizes = ["P", "M", "G", "GG", "XG", "G1", "G2"];

export const mockProducts: Product[] = [
  { id: "1", handle: "camiseta-essencial-bordo", title: "Camiseta Essencial", price: 30, image: "/product/camiseta_01.png", color: "Bordô", category: "Masculino", productType: "Camisetas", sizes: defaultSizes, gallery: sharedGallery, variants: sharedVariants, badge: "Mais Vendido", tags: ["camiseta", "masculino"] },
  { id: "2", handle: "camiseta-essencial-verde", title: "Camiseta Essencial", price: 30, image: "/product/camiseta_02.png", color: "Verde Escuro", category: "Masculino", productType: "Camisetas", sizes: defaultSizes, gallery: sharedGallery, variants: sharedVariants, tags: ["camiseta", "masculino"] },
  { id: "3", handle: "camiseta-essencial-osso", title: "Camiseta Essencial", price: 30, image: "/product/camiseta_03.png", color: "Osso", category: "Masculino", productType: "Camisetas", sizes: defaultSizes, gallery: sharedGallery, variants: sharedVariants, badge: "Novo", tags: ["camiseta", "masculino", "novo"] },
  { id: "4", handle: "camiseta-essencial-carvao", title: "Camiseta Essencial", price: 30, image: "/product/camiseta_04.png", color: "Carvão", category: "Masculino", productType: "Camisetas", sizes: defaultSizes, gallery: sharedGallery, variants: sharedVariants, tags: ["camiseta", "masculino"] },
  { id: "5", handle: "camiseta-essencial-indigo", title: "Camiseta Essencial", price: 30, image: "/product/camiseta_05.png", color: "Índigo Lavado", category: "Masculino", productType: "Camisetas", sizes: defaultSizes, gallery: sharedGallery, variants: sharedVariants, tags: ["camiseta", "masculino"] },
  { id: "6", handle: "camiseta-essencial-preto", title: "Camiseta Essencial", price: 30, image: "/product/camiseta_01.png", color: "Preto", category: "Masculino", productType: "Camisetas", sizes: defaultSizes, gallery: sharedGallery, variants: sharedVariants, tags: ["camiseta", "masculino"] },
  { id: "7", handle: "camiseta-essencial-cinza", title: "Camiseta Essencial", price: 30, image: "/product/camiseta_02.png", color: "Cinza", category: "Masculino", productType: "Camisetas", sizes: defaultSizes, gallery: sharedGallery, variants: sharedVariants, tags: ["camiseta", "masculino"] },
  { id: "8", handle: "camiseta-essencial-oliva", title: "Camiseta Essencial", price: 30, image: "/product/camiseta_03.png", color: "Oliva", category: "Masculino", productType: "Camisetas", sizes: defaultSizes, gallery: sharedGallery, variants: sharedVariants, tags: ["camiseta", "masculino"] },
  { id: "9", handle: "camiseta-essencial-gola-v", title: "Camiseta Essencial", price: 30, image: "/product/camiseta_04.png", color: "Preto Gola V", category: "Masculino", productType: "Camisetas", sizes: defaultSizes, gallery: sharedGallery, variants: sharedVariants, tags: ["camiseta", "masculino"] },
  { id: "10", handle: "camiseta-essencial-osso-estampada", title: "Camiseta Essencial", price: 30, image: "/product/camiseta_05.png", color: "Osso Estampada", category: "Masculino", productType: "Camisetas", sizes: defaultSizes, gallery: sharedGallery, variants: sharedVariants, badge: "Limitado", tags: ["camiseta", "masculino"] },
  { id: "11", handle: "camiseta-essencial-preto-estampada", title: "Camiseta Essencial", price: 30, image: "/product/camiseta_01.png", color: "Preto Estampada", category: "Masculino", productType: "Camisetas", sizes: defaultSizes, gallery: sharedGallery, variants: sharedVariants, tags: ["camiseta", "masculino"] },
  { id: "12", handle: "camiseta-essencial-bordo-estampada", title: "Camiseta Essencial", price: 30, image: "/product/camiseta_02.png", color: "Bordô Estampada", category: "Masculino", productType: "Camisetas", sizes: defaultSizes, gallery: sharedGallery, variants: sharedVariants, tags: ["camiseta", "masculino"] },
  { id: "13", handle: "blusa-minimal-osso", title: "Blusa Minimal", price: 45, image: "/product/camiseta_03.png", color: "Osso", category: "Feminino", productType: "Blusas", sizes: defaultSizes, gallery: sharedGallery, variants: sharedVariants, badge: "Novo", tags: ["blusa", "feminino", "novo"] },
  { id: "14", handle: "caderno-rouhi-a5", title: "Caderno ROUHI A5", price: 38, image: "/product/camiseta_05.png", color: "Preto", category: "Objetos", productType: "Cadernos", sizes: ["Único"], gallery: ["/product/camiseta_05.png"], variants: [{ id: "v-obj-1", color: "Preto", size: "Único", image: "/product/camiseta_05.png", hex: "#000000", price: 38 }], tags: ["caderno", "objetos", "escritorio"] },
];