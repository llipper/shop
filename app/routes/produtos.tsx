import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { ProductsPage } from "@/components/pages/products-page";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { fetchStoreCatalog } from "@/lib/catalog.server";
import { getFilterTitle, parseProductFilters } from "@/lib/product-filters";
import { buildMetaTags } from "@/lib/seo";

export const loader = async (_args: LoaderFunctionArgs) => {
  return fetchStoreCatalog(48);
};

export const meta: MetaFunction<typeof loader> = ({ location, matches }) => {
  const filters = parseProductFilters(new URLSearchParams(location.search));
  const title = getFilterTitle(filters);

  return buildMetaTags({
    title,
    description: `Explore ${title.toLowerCase()} na ROUHI. Moda minimalista, essencial e feita para durar.`,
    path: `${location.pathname}${location.search}`,
    matches,
  });
};

export default function ProdutosRoute() {
  return (
    <StorefrontShell showCart>
      <ProductsPage />
    </StorefrontShell>
  );
}