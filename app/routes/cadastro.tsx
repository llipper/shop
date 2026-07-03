import { StorefrontShell } from "@/components/layout/storefront-shell";
import { RegisterPage } from "@/components/pages/register-page";

export default function RegisterRoute() {
  return (
    <StorefrontShell showFooter={false} showCart={false}>
      <RegisterPage />
    </StorefrontShell>
  );
}