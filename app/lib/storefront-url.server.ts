const DEFAULT_STORE_PATH = "/store";

export function getPublicStorefrontUrl(): string {
  const base = process.env.PUBLIC_STOREFRONT_URL?.trim().replace(/\/$/, "");
  if (!base) return DEFAULT_STORE_PATH;
  return `${base}${DEFAULT_STORE_PATH}`;
}

export function getPublicStorefrontOrigin(): string | null {
  const base = process.env.PUBLIC_STOREFRONT_URL?.trim().replace(/\/$/, "");
  return base || null;
}