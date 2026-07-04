import { getSiteOrigin, toAbsoluteUrl } from "@/lib/share-url";

export const SITE_NAME = "ROUHI";
export const SITE_TAGLINE =
  "Roupas minimalistas, essenciais e projetadas para durar.";
export const SITE_DESCRIPTION =
  "ROUHI é uma marca de moda e lifestyle com peças minimalistas, materiais selecionados e estética contemporânea para o dia a dia urbano.";

type BuildMetaOptions = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  request?: Request;
};

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
}: BuildMetaOptions = {}) {
  const origin = getSiteOrigin(request);
  const pageTitle = buildPageTitle(title);
  const canonical = toAbsoluteUrl(path, origin);
  const ogImage = toAbsoluteUrl(image, origin);

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