import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { Header } from "@/components/layout/header";
import { CheckoutContent } from "@/components/checkout/checkout-content";
import { getInstalledShopDomain } from "@/lib/shop.server";
import { getPublicStorefrontUrl } from "@/lib/storefront-url.server";
import {
  createStorefrontCheckout,
  type CheckoutLine,
} from "@/lib/shopify-checkout.server";

export const loader = async (_args: LoaderFunctionArgs) => {
  const shop = getInstalledShopDomain();
  return { shop, storefrontUrl: getPublicStorefrontUrl() };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const itemsRaw = formData.get("items");

  if (typeof itemsRaw !== "string" || !itemsRaw) {
    return { error: "Carrinho inválido." };
  }

  let payload: { items?: CheckoutLine[]; buyerEmail?: string };
  try {
    payload = JSON.parse(itemsRaw) as { items?: CheckoutLine[]; buyerEmail?: string };
  } catch {
    return { error: "Carrinho inválido." };
  }

  const result = await createStorefrontCheckout(payload.items ?? [], {
    buyerEmail: payload.buyerEmail,
  });

  if (result.error && !result.checkoutUrl) {
    return { error: result.error };
  }

  return {
    checkoutUrl: result.checkoutUrl,
    warning: result.warning ?? null,
  };
};

export default function StoreCheckout() {
  const { shop, storefrontUrl } = useLoaderData<typeof loader>();

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <Header />
      <CheckoutContent shop={shop} storefrontUrl={storefrontUrl} />
    </main>
  );
}