import { getSiteOrigin, toAbsoluteUrl } from "@/lib/share-url";

export const ROOT_SITE_ORIGIN_KEY = "siteOrigin";

export const SITE_NAME = "ROUHI";
export const SITE_TAGLINE =
  "Roupas minimalistas, essenciais e projetadas para durar.";
export const SITE_DESCRIPTION =
  "ROUHI é uma marca de moda e lifestyle com peças minimalistas, materiais selecionados e estética contemporânea para o dia a dia urbano.";

type MetaMatch = {
  data?: unknown;
};

type BuildMetaOptions = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  request?: Request;
  origin?: string;
  matches?: MetaMatch[];
};

export function resolveSiteOrigin(options: {
  origin?: string;
  request?: Request;
  matches?: MetaMatch[];
}): string {
  if (options.origin) return options.origin;
  if (options.request) return new URL(options.request.url).origin;

  for (const match of options.matches ?? []) {
    const data = match.data as Record<string, unknown> | undefined;
    const fromRoot = data?.[ROOT_SITE_ORIGIN_KEY];
    if (typeof fromRoot === "string" && fromRoot) return fromRoot;
  }

  return getSiteOrigin(options.request);
}

export function buildPageTitle(title?: string): string {
  if (!title) return `${SITE_NAME} | Moda minimalista e essencial`;
  return `${title} | ${SITE_NAME}`;
}

export function buildMetaTags({
  title,
  description = SITE_DESCRIPTION,
  path = "/",
  image = "/banner.png",
  noIndex = false,
  request,
  origin,
  matches,
}: BuildMetaOptions = {}) {
  const resolvedOrigin = resolveSiteOrigin({ origin, request, matches });
  const pageTitle = buildPageTitle(title);
  const canonical = toAbsoluteUrl(path, resolvedOrigin);
  const ogImage = toAbsoluteUrl(image, resolvedOrigin);

  return [
    { title: pageTitle },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: canonical },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: pageTitle },
    { property: "og:description", content: description },
    { property: "og:url", content: canonical },
    { property: "og:image", content: ogImage },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: pageTitle },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },
    ...(noIndex ? [{ name: "robots", content: "noindex, nofollow" }] : []),
  ];
}