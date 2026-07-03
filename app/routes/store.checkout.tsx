import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { Header } from "@/components/layout/header";
import { CheckoutContent } from "@/components/checkout/checkout-content";
import { getInstalledShopDomain } from "@/lib/shop.server";

export const loader = async (_args: LoaderFunctionArgs) => {
  const shop = await getInstalledShopDomain();
  return { shop };
};

export default function StoreCheckout() {
  const { shop } = useLoaderData<typeof loader>();

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <Header />
      <CheckoutContent shop={shop} />
    </main>
  );
}