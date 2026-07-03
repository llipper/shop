import { StorefrontShell } from "@/components/layout/storefront-shell";
import { FavoritesPage } from "@/components/pages/favorites-page";

export default function FavoritesRoute() {
  return (
    <StorefrontShell>
      <FavoritesPage />
    </StorefrontShell>
  );
}