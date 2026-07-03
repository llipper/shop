import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { Header } from "@/components/layout/header";
import { Hero } from "@/components/home/hero";
import { CategoryFilter } from "@/components/home/category-filter";
import { ProductGrid } from "@/components/home/product-grid";
import { fetchShopifyProducts } from "@/lib/shopify-products.server";

export const loader = async (_args: LoaderFunctionArgs) => {
  return fetchShopifyProducts(24);
};

export default function StoreHome() {
  const { products, shop, error } = useLoaderData<typeof loader>();

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <Header />
      <Hero />
      <div className="max-w-[1440px] mx-auto">
        {error && (
          <p className="mx-12 mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {!error && shop && products.length === 0 && (
          <p className="mx-12 mb-6 text-sm text-muted-foreground">
            Nenhum produto ativo na loja{" "}
            <strong className="text-foreground">{shop}</strong>. Cadastre
            produtos no admin da Shopify.
          </p>
        )}

        <CategoryFilter />
        <ProductGrid products={products} />
      </div>
    </main>
  );
}