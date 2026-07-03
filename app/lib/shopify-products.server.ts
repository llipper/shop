import { unauthenticated } from "../shopify.server";
import type { Product } from "../types/product";
import { colorToHex } from "./color-utils";
import { getInstalledShopDomain } from "./shop.server";

type ShopifyProductNode = {
  id: string;
  title: string;
  handle: string;
  description: string;
  productType: string;
  tags: string[];
  featuredImage: { url: string } | null;
  images: { edges: Array<{ node: { url: string } }> };
  options: Array<{ name: string; values: string[] }>;
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        price: string;
        availableForSale: boolean;
        selectedOptions: Array<{ name: string; value: string }>;
        image: { url: string } | null;
      };
    }>;
  };
  priceRangeV2: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
};

const PRODUCTS_QUERY = `#graphql
  query PapirarStoreProducts($first: Int!) {
    products(first: $first, query: "status:active") {
      edges {
        node {
          id
          title
          handle
          description
          productType
          tags
          featuredImage { url }
          images(first: 10) {
            edges { node { url } }
          }
          options { name values }
          variants(first: 100) {
            edges {
              node {
                id
                title
                price
                availableForSale
                selectedOptions { name value }
                image { url }
              }
            }
          }
          priceRangeV2 {
            minVariantPrice { amount currencyCode }
          }
        }
      }
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = `#graphql
  query PapirarStoreProduct($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      handle
      description
      productType
      tags
      featuredImage { url }
      images(first: 10) {
        edges { node { url } }
      }
      options { name values }
      variants(first: 100) {
        edges {
          node {
            id
            title
            price
            availableForSale
            selectedOptions { name value }
            image { url }
          }
        }
      }
      priceRangeV2 {
        minVariantPrice { amount currencyCode }
      }
    }
  }
`;

function mapCategory(productType: string, tags: string[]): Product["category"] {
  const value = `${productType} ${tags.join(" ")}`.toLowerCase();
  if (value.includes("femin")) return "Feminino";
  if (value.includes("objet")) return "Objetos";
  return "Masculino";
}

function mapBadge(tags: string[]): Product["badge"] {
  const normalized = tags.map((t) => t.toLowerCase());
  if (normalized.includes("novo")) return "Novo";
  if (normalized.includes("mais-vendido")) return "Mais Vendido";
  if (normalized.includes("limitado")) return "Limitado";
  return undefined;
}

const COLOR_OPTION_NAMES = ["cor", "color", "colour"];
const SIZE_OPTION_NAMES = ["tamanho", "size"];

function getOptionValue(
  selectedOptions: Array<{ name: string; value: string }>,
  names: string[],
  fallback: string,
): string {
  const match = selectedOptions.find((o) =>
    names.includes(o.name.toLowerCase()),
  );
  return match?.value ?? fallback;
}

function mapShopifyProduct(node: ShopifyProductNode): Product {
  const gallery = node.images.edges.map((edge) => edge.node.url);
  const featured = node.featuredImage?.url ?? gallery[0] ?? "";
  const colorOption = node.options.find((o) =>
    COLOR_OPTION_NAMES.includes(o.name.toLowerCase()),
  );
  const sizeOption = node.options.find((o) =>
    SIZE_OPTION_NAMES.includes(o.name.toLowerCase()),
  );

  const variants = node.variants.edges.map((edge) => {
    const { node: variant } = edge;
    const color = getOptionValue(
      variant.selectedOptions,
      COLOR_OPTION_NAMES,
      colorOption?.values[0] ?? "Único",
    );
    const size = getOptionValue(
      variant.selectedOptions,
      SIZE_OPTION_NAMES,
      sizeOption?.values[0] ?? "Único",
    );

    return {
      id: variant.id,
      color,
      size,
      image: variant.image?.url ?? featured,
      hex: colorToHex(color),
      price: parseFloat(variant.price),
      availableForSale: variant.availableForSale,
    };
  });

  const colors = colorOption?.values ?? [...new Set(variants.map((v) => v.color))];
  const sizes = sizeOption?.values ?? [...new Set(variants.map((v) => v.size))];
  const firstVariant = variants[0];

  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    price: parseFloat(node.priceRangeV2.minVariantPrice.amount),
    currencyCode: node.priceRangeV2.minVariantPrice.currencyCode,
    image: featured,
    color: firstVariant?.color ?? colors[0] ?? "",
    category: mapCategory(node.productType, node.tags),
    description: node.description,
    colors,
    sizes,
    gallery: gallery.length > 0 ? gallery : [featured],
    variants,
    badge: mapBadge(node.tags),
    tags: node.tags,
  };
}

async function getAdminClient() {
  const shop = await getInstalledShopDomain();
  if (!shop) return { shop: null, admin: null };
  const { admin } = await unauthenticated.admin(shop);
  return { shop, admin };
}

export async function fetchShopifyProducts(limit = 24) {
  const { shop, admin } = await getAdminClient();
  if (!shop || !admin) {
    return {
      shop: null,
      products: [] as Product[],
      error:
        "Instale o app na loja com shopify app dev para carregar produtos reais.",
    };
  }

  try {
    const response = await admin.graphql(PRODUCTS_QUERY, {
      variables: { first: limit },
    });
    const json = await response.json();
    if (json.errors?.length) {
      return { shop, products: [] as Product[], error: json.errors[0].message };
    }
    const products = (json.data?.products?.edges ?? []).map(
      (edge: { node: ShopifyProductNode }) => mapShopifyProduct(edge.node),
    );
    return { shop, products, error: null };
  } catch (error) {
    return {
      shop,
      products: [] as Product[],
      error: error instanceof Error ? error.message : "Erro ao buscar produtos",
    };
  }
}

export async function fetchShopifyProductByHandle(handle: string) {
  const { shop, admin } = await getAdminClient();
  if (!shop || !admin) {
    return { shop: null, product: null, error: "App não instalado na loja." };
  }

  try {
    const response = await admin.graphql(PRODUCT_BY_HANDLE_QUERY, {
      variables: { handle },
    });
    const json = await response.json();
    if (json.errors?.length) {
      return { shop, product: null, error: json.errors[0].message };
    }
    const node = json.data?.productByHandle;
    if (!node) return { shop, product: null, error: null };
    return { shop, product: mapShopifyProduct(node), error: null };
  } catch (error) {
    return {
      shop,
      product: null,
      error: error instanceof Error ? error.message : "Erro ao buscar produto",
    };
  }
}