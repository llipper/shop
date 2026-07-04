import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { StoreCatalogPage } from "@/components/pages/store-catalog-page";
import { fetchStoreCatalog } from "@/lib/catalog.server";
import { buildMetaTags, SITE_DESCRIPTION } from "@/lib/seo";

export const loader = async (_args: LoaderFunctionArgs) => {
  return fetchStoreCatalog(24);
};

export const meta: MetaFunction = () =>
  buildMetaTags({
    title: "Loja",
    description: SITE_DESCRIPTION,
    path: "/store",
    image: "/banner.png",
  });

export default function StoreHome() {
  return <StoreCatalogPage />;
}