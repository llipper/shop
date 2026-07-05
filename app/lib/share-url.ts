function readPublicStorefrontUrl(): string | null {
  if (typeof process === "undefined") return null;
  const value = process.env.PUBLIC_STOREFRONT_URL?.trim().replace(/\/$/, "");
  return value || null;
}

export function getSiteOrigin(request?: Request): string {
  if (request) {
    return new URL(request.url).origin;
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  const envOrigin = readPublicStorefrontUrl();
  if (envOrigin) return envOrigin;

  return "http://localhost:3000";
}

export function toAbsoluteUrl(pathOrUrl: string, origin?: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const base =
    origin ??
    (typeof window !== "undefined" ? window.location.origin : getSiteOrigin());

  return `${base}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

export function getProductSharePath(handle: string): string {
  return `/store/product/${handle}`;
}

export function getProductShareUrl(
  handle: string,
  origin?: string,
  params?: Record<string, string | undefined>,
): string {
  const url = new URL(toAbsoluteUrl(getProductSharePath(handle), origin));

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value) url.searchParams.set(key, value);
    }
  }

  return url.toString();
}

export function getProductShareDescription(
  title: string,
  category: string,
  priceLabel: string,
): string {
  return `${title} · ${priceLabel} · ${category}. Confira na ROCCIUS.`;
}