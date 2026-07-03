import { Outlet } from "react-router";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { SupportLayout } from "@/components/pages/support/support-layout";

export default function SuporteLayoutRoute() {
  return (
    <StorefrontShell>
      <SupportLayout>
        <Outlet />
      </SupportLayout>
    </StorefrontShell>
  );
}