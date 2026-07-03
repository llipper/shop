import { StorefrontShell } from "@/components/layout/storefront-shell";
import { LoginPage } from "@/components/pages/login-page";

export default function LoginRoute() {
  return (
    <StorefrontShell showFooter={false} showCart={false}>
      <LoginPage />
    </StorefrontShell>
  );
}