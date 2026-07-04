import { Outlet } from "react-router";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { CartProvider } from "@/contexts/cart-context";
import { FavoritesProvider } from "@/contexts/favorites-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";

interface StorefrontShellProps {
  showFooter?: boolean;
  showCart?: boolean;
  children?: React.ReactNode;
}

export function StorefrontShell({
  showFooter = true,
  showCart = true,
  children,
}: StorefrontShellProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <TooltipProvider>
            {children ?? <Outlet />}
            {showCart && <CartDrawer />}
            {showFooter && <Footer />}
            <CookieConsent />
            <Toaster position="top-right" />
            </TooltipProvider>
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}