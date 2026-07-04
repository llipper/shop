import { mockProducts } from "@/data/products";
import { fetchShopifyProducts } from "@/lib/shopify-products.server";

export async function fetchStoreCatalog(limit = 48) {
  const { products, shop, error } = await fetchShopifyProducts(limit);
  const usingMockData = products.length === 0;

  return {
    catalog: usingMockData ? mockProducts : products,
    shop,
    error: usingMockData ? null : error,
    usingMockData,
  };
}