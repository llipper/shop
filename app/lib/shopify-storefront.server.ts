import { createStorefrontApiClient } from "@shopify/storefront-api-client";

const API_VERSION = "2025-10";

export function getShopDomain(): string | null {
  const domain = process.env.SHOP_STORE_DOMAIN?.trim();
  if (!domain) return null;
  return domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function getStorefrontClient() {
  const storeDomain = getShopDomain();
  const publicAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim();

  if (!storeDomain || !publicAccessToken) {
    return null;
  }

  return createStorefrontApiClient({
    storeDomain,
    apiVersion: API_VERSION,
    publicAccessToken,
  });
}

export function getStorefrontConfigError(): string | null {
  if (!getShopDomain()) {
    return "Defina SHOP_STORE_DOMAIN no .env (ex: papirar.myshopify.com).";
  }
  if (!process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim()) {
    return "Defina SHOPIFY_STOREFRONT_ACCESS_TOKEN no .env (token da Storefront API).";
  }
  return null;
}