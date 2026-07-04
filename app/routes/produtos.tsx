import type { LoaderFunctionArgs } from "react-router";
import { ProductsPage } from "@/components/pages/products-page";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { fetchStoreCatalog } from "@/lib/catalog.server";

export const loader = async (_args: LoaderFunctionArgs) => {
  return fetchStoreCatalog(48);
};

export default function ProdutosRoute() {
  return (
    <StorefrontShell showCart>
      <ProductsPage />
    </StorefrontShell>
  );
}