import type { LoaderFunctionArgs } from "react-router";
import { StoreCatalogPage } from "@/components/pages/store-catalog-page";
import { fetchStoreCatalog } from "@/lib/catalog.server";

export const loader = async (_args: LoaderFunctionArgs) => {
  return fetchStoreCatalog(24);
};

export default function StoreHome() {
  return <StoreCatalogPage />;
}