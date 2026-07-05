import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { Header } from "@/components/layout/header";
import { CheckoutContent } from "@/components/checkout/checkout-content";
import { getInstalledShopDomain } from "@/lib/shop.server";
import {
  getMercadoPagoConfigError,
  getMercadoPagoPublicKey,
} from "@/lib/mercadopago.server";
import { getShopifyAdminConfigError } from "@/lib/shopify-order.server";

export const loader = async (_args: LoaderFunctionArgs) => {
  const shop = getInstalledShopDomain();
  const publicKey = getMercadoPagoPublicKey();
  const mpConfigured = !getMercadoPagoConfigError();
  const adminConfigured = !getShopifyAdminConfigError();

  return { shop, publicKey, mpConfigured, adminConfigured };
};

export default function StoreCheckout() {
  const { shop, publicKey, mpConfigured, adminConfigured } =
    useLoaderData<typeof loader>();

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <Header />
      <CheckoutContent
        shop={shop}
        publicKey={publicKey}
        mpConfigured={mpConfigured}
        adminConfigured={adminConfigured}
      />
    </main>
  );
}