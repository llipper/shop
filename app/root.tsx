import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { buildMetaTags, ROOT_SITE_ORIGIN_KEY, SITE_NAME } from "@/lib/seo";
import "./globals.css";

export const loader = ({ request }: LoaderFunctionArgs) => ({
  [ROOT_SITE_ORIGIN_KEY]: new URL(request.url).origin,
});

export const meta: MetaFunction<typeof loader> = ({ data, matches }) => [
  ...buildMetaTags({
    origin: data?.siteOrigin,
    matches,
  }),
  { name: "application-name", content: SITE_NAME },
  { name: "theme-color", content: "#111111" },
  { charSet: "utf-8" },
];

export default function App() {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}