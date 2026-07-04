import type { LoaderFunctionArgs } from "react-router";
import { fetchStoreCatalog } from "@/lib/catalog.server";
import { getSiteOrigin } from "@/lib/share-url";
import type { Product } from "@/types/product";

function xmlEscape(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function loader({ request }: LoaderFunctionArgs) {
  const origin = getSiteOrigin(request);
  const { catalog } = await fetchStoreCatalog(100);

  const staticPaths = [
    "/store",
    "/produtos",
    "/suporte",
    "/suporte/faq",
    "/suporte/envio-e-prazos",
    "/suporte/trocas-e-devolucoes",
    "/suporte/rastreio",
    "/suporte/contato",
    "/privacidade",
    "/termos",
  ];

  const urls = [
    ...staticPaths.map((path) => `${origin}${path}`),
    ...catalog.map((product: Product) => `${origin}/store/product/${product.handle}`),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${xmlEscape(url)}</loc>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}