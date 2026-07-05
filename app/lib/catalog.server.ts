import { mockProducts } from "@/data/products";
import { fetchShopifyProducts } from "@/lib/shopify-products.server";

function allowMockCatalog() {
  return process.env.ALLOW_MOCK_CATALOG === "true";
}

export async function fetchStoreCatalog(limit = 48) {
  const { products, shop, error } = await fetchShopifyProducts(limit);

  if (products.length > 0) {
    return {
      catalog: products,
      shop,
      error: null,
      usingMockData: false,
    };
  }

  if (allowMockCatalog()) {
    return {
      catalog: mockProducts,
      shop,
      error: null,
      usingMockData: true,
    };
  }

  return {
    catalog: [],
    shop,
    error:
      error ??
      "Nenhum produto publicado na loja Shopify. Cadastre produtos no canal Online Store.",
    usingMockData: false,
  };
}