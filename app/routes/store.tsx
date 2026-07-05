import { useLocation } from "react-router";
import { StorefrontShell } from "@/components/layout/storefront-shell";

export default function StoreLayout() {
  const { pathname } = useLocation();
  const isCheckoutSuccess = pathname === "/store/checkout/sucesso";

  return (
    <StorefrontShell showFooter={!isCheckoutSuccess} showCart={!isCheckoutSuccess} />
  );
}