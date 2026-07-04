import type { Product } from "../types/product";
import { colorToHex } from "./color-utils";
import { normalizeBrazilianSizes, toBrazilianSize } from "./size-utils";
import {
  getShopDomain,
  getStorefrontClient,
  getStorefrontConfigError,
} from "./shopify-storefront.server";

type Money = { amount: string; currencyCode: string };

type ShopifyProductNode = {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  vendor: string;
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
        price: Money;
        compareAtPrice: Money | null;
        availableForSale: boolean;
        selectedOptions: Array<{ name: string; value: string }>;
        image: { url: string } | null;
      };
    }>;
  };
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
};

const PRODUCTS_QUERY = `#graphql
  query RouhiStoreProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          descriptionHtml
          vendor
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
                price { amount currencyCode }
                compareAtPrice { amount currencyCode }
                availableForSale
                selectedOptions { name value }
                image { url }
              }
            }
          }
          priceRange {
            minVariantPrice { amount currencyCode }
            maxVariantPrice { amount currencyCode }
          }
        }
      }
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = `#graphql
  query RouhiStoreProduct($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      vendor
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
            price { amount currencyCode }
            compareAtPrice { amount currencyCode }
            availableForSale
            selectedOptions { name value }
            image { url }
          }
        }
      }
      priceRange {
        minVariantPrice { amount currencyCode }
        maxVariantPrice { amount currencyCode }
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
    const rawSize = getOptionValue(
      variant.selectedOptions,
      SIZE_OPTION_NAMES,
      sizeOption?.values[0] ?? "Único",
    );
    const size = toBrazilianSize(rawSize);

    const compareAtPrice = variant.compareAtPrice
      ? parseFloat(variant.compareAtPrice.amount)
      : undefined;

    return {
      id: variant.id,
      color,
      size,
      image: variant.image?.url ?? featured,
      hex: colorToHex(color),
      price: parseFloat(variant.price.amount),
      compareAtPrice:
        compareAtPrice && compareAtPrice > parseFloat(variant.price.amount)
          ? compareAtPrice
          : undefined,
      availableForSale: variant.availableForSale,
    };
  });

  const colors = colorOption?.values ?? [...new Set(variants.map((v) => v.color))];
  const sizes = normalizeBrazilianSizes(
    sizeOption?.values ?? variants.map((v) => v.size),
  );
  const firstVariant = variants[0];

  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    price: parseFloat(node.priceRange.minVariantPrice.amount),
    maxPrice: parseFloat(node.priceRange.maxVariantPrice.amount),
    currencyCode: node.priceRange.minVariantPrice.currencyCode,
    image: featured,
    color: firstVariant?.color ?? colors[0] ?? "",
    category: mapCategory(node.productType, node.tags),
    productType: node.productType,
    vendor: node.vendor,
    description: node.description,
    descriptionHtml: node.descriptionHtml,
    colors,
    sizes,
    gallery: gallery.length > 0 ? gallery : [featured],
    variants,
    badge: mapBadge(node.tags),
    tags: node.tags,
  };
}

export async function fetchShopifyProducts(limit = 24) {
  const shop = getShopDomain();
  const configError = getStorefrontConfigError();
  if (configError || !shop) {
    return {
      shop: null,
      products: [] as Product[],
      error: configError ?? "Loja não configurada.",
    };
  }

  const client = getStorefrontClient();
  if (!client) {
    return {
      shop: null,
      products: [] as Product[],
      error: "Storefront API não configurada.",
    };
  }

  try {
    const { data, errors } = await client.request(PRODUCTS_QUERY, {
      variables: { first: limit },
    });

    if (errors) {
      const message =
        errors.message ??
        errors.graphQLErrors?.[0]?.message ??
        "Erro na Storefront API.";
      return { shop, products: [] as Product[], error: message };
    }

    const products = (data?.products?.edges ?? []).map(
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
  const shop = getShopDomain();
  const configError = getStorefrontConfigError();
  if (configError || !shop) {
    return { shop: null, product: null, error: configError ?? "Loja não configurada." };
  }

  const client = getStorefrontClient();
  if (!client) {
    return { shop: null, product: null, error: "Storefront API não configurada." };
  }

  try {
    const { data, errors } = await client.request(PRODUCT_BY_HANDLE_QUERY, {
      variables: { handle },
    });

    if (errors) {
      const message =
        errors.message ??
        errors.graphQLErrors?.[0]?.message ??
        "Erro na Storefront API.";
      return { shop, product: null, error: message };
    }

    const node = data?.product;
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