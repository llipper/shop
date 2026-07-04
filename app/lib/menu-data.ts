import { buildProductsHref } from "@/lib/product-filters";

type MenuLink = { label: string; href: string };

type MenuColumn = { title: string; links: MenuLink[] };

type MenuCategory = {
  featured: {
    title: string;
    description: string;
    image: string;
    href: string;
  };
  columns: MenuColumn[];
};

export const menuData: Record<string, MenuCategory> = {
  Masculino: {
    featured: {
      title: "Essentials Collection",
      description: "O básico que todo homem precisa",
      image: "/product/camiseta_01.png",
      href: buildProductsHref("Masculino"),
    },
    columns: [
      {
        title: "Roupas",
        links: [
          { label: "Camisetas", href: buildProductsHref("Masculino", "Camisetas") },
          { label: "Camisas", href: buildProductsHref("Masculino", "Camisas") },
          { label: "Calças", href: buildProductsHref("Masculino", "Calças") },
          { label: "Bermudas", href: buildProductsHref("Masculino", "Bermudas") },
          { label: "Moletons", href: buildProductsHref("Masculino", "Moletons") },
        ],
      },
      {
        title: "Acessórios",
        links: [
          { label: "Bonés", href: buildProductsHref("Masculino", "Bonés") },
          { label: "Meias", href: buildProductsHref("Masculino", "Meias") },
          { label: "Carteiras", href: buildProductsHref("Masculino", "Carteiras") },
          { label: "Cintos", href: buildProductsHref("Masculino", "Cintos") },
        ],
      },
    ],
  },
  Feminino: {
    featured: {
      title: "Summer Vibes",
      description: "Peças leves e elegantes",
      image: "/product/camiseta_03.png",
      href: buildProductsHref("Feminino"),
    },
    columns: [
      {
        title: "Roupas",
        links: [
          { label: "Camisetas", href: buildProductsHref("Feminino", "Camisetas") },
          { label: "Blusas", href: buildProductsHref("Feminino", "Blusas") },
          { label: "Vestidos", href: buildProductsHref("Feminino", "Vestidos") },
          { label: "Calças", href: buildProductsHref("Feminino", "Calças") },
          { label: "Saias", href: buildProductsHref("Feminino", "Saias") },
        ],
      },
      {
        title: "Acessórios",
        links: [
          { label: "Bolsas", href: buildProductsHref("Feminino", "Bolsas") },
          { label: "Bijuterias", href: buildProductsHref("Feminino", "Bijuterias") },
          { label: "Lenços", href: buildProductsHref("Feminino", "Lenços") },
          { label: "Óculos", href: buildProductsHref("Feminino", "Óculos") },
        ],
      },
    ],
  },
  Objetos: {
    featured: {
      title: "Workspace Essentials",
      description: "Para um escritório minimalista",
      image: "/product/camiseta_05.png",
      href: buildProductsHref("Objetos"),
    },
    columns: [
      {
        title: "Escritório",
        links: [
          { label: "Cadernos", href: buildProductsHref("Objetos", "Cadernos") },
          { label: "Canetas", href: buildProductsHref("Objetos", "Canetas") },
          { label: "Organizadores", href: buildProductsHref("Objetos", "Organizadores") },
          { label: "Mouse Pads", href: buildProductsHref("Objetos", "Mouse Pads") },
        ],
      },
      {
        title: "Lifestyle",
        links: [
          { label: "Canecas", href: buildProductsHref("Objetos", "Canecas") },
          { label: "Garrafas", href: buildProductsHref("Objetos", "Garrafas") },
          { label: "Quadros", href: buildProductsHref("Objetos", "Quadros") },
        ],
      },
    ],
  },
};

export const novidadesHref = "/produtos?tag=novo";
export const saleHref = "/produtos?tag=sale";