import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { Header } from "@/components/layout/header";
import { ProductOverview } from "@/components/product/product-overview";
import { fetchShopifyProductByHandle } from "@/lib/shopify-products.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const handle = params.handle;
  if (!handle) {
    return { product: null, error: "Produto inválido." };
  }
  return fetchShopifyProductByHandle(handle);
};

export default function StoreProductPage() {
  const { product, error } = useLoaderData<typeof loader>();

  if (error || !product) {
    return (
      <main className="min-h-screen bg-background pt-32 text-center">
        <Header />
        <p className="text-muted-foreground">
          {error ?? "Produto não encontrado."}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-24 font-sans text-foreground lg:pb-0">
      <Header />
      <ProductOverview product={product} />
    </main>
  );
}