import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { Header } from "@/components/layout/header";
import { CheckoutContent } from "@/components/checkout/checkout-content";
import { getInstalledShopDomain } from "@/lib/shop.server";
import {
  createStorefrontCheckout,
  type CheckoutLine,
} from "@/lib/shopify-checkout.server";

export const loader = async (_args: LoaderFunctionArgs) => {
  const shop = getInstalledShopDomain();
  return { shop };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const itemsRaw = formData.get("items");

  if (typeof itemsRaw !== "string" || !itemsRaw) {
    return { error: "Carrinho inválido." };
  }

  let items: CheckoutLine[];
  try {
    items = JSON.parse(itemsRaw) as CheckoutLine[];
  } catch {
    return { error: "Carrinho inválido." };
  }

  const result = await createStorefrontCheckout(items);

  if (result.error && !result.checkoutUrl) {
    return { error: result.error };
  }

  return {
    checkoutUrl: result.checkoutUrl,
    warning: result.warning ?? null,
  };
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