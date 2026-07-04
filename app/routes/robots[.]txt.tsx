import type { LoaderFunctionArgs } from "react-router";
import { getSiteOrigin } from "@/lib/share-url";

export async function loader({ request }: LoaderFunctionArgs) {
  const origin = getSiteOrigin(request);

  const body = `User-agent: *
Allow: /
Disallow: /store/checkout
Disallow: /conta
Disallow: /login
Disallow: /cadastro

Sitemap: ${origin}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}