"use client";

import { Link } from "react-router";
import { Search, ShoppingCart, User, Menu, Heart } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { useFavorites } from "@/contexts/favorites-context";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { SearchDialog } from "@/components/layout/search-dialog";
import { buildProductsHref } from "@/lib/product-filters";
import { menuData, maisVendidosHref, novidadesHref, saleHref } from "@/lib/menu-data";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Header() {
  const { isAuthenticated } = useAuth();
  const { setIsCartOpen, totalItems } = useCart();
  const { totalFavorites } = useFavorites();
  const accountHref = isAuthenticated ? "/conta" : "/login";
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="max-w-[1440px] mx-auto flex items-center justify-between px-6 md:px-12">
        {/* Left: Logo + Navigation */}
        <div className="flex items-center gap-10">
          <Link to="/store" className="text-2xl font-semibold tracking-widest uppercase text-foreground">
            ROUHI
          </Link>

          {/* Desktop Navigation Menu */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList className="gap-1">
              {Object.entries(menuData).map(([category, data]) => (
                <NavigationMenuItem key={category}>
                  <NavigationMenuTrigger className="text-sm font-medium text-foreground/80 hover:text-foreground bg-transparent hover:bg-transparent data-popup-open:bg-transparent focus:bg-transparent">
                    {category}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid grid-cols-[220px_1fr] gap-0 w-[580px]">
                      {/* Featured item */}
                      <Link
                        to={data.featured.href}
                        className="relative group/featured flex flex-col justify-end rounded-l-md overflow-hidden bg-secondary p-5"
                      >
                        <div
                          className="absolute inset-0 bg-cover bg-center opacity-30 group-hover/featured:opacity-50 transition-opacity duration-300"
                          style={{ backgroundImage: `url(${data.featured.image})` }}
                        />
                        <div className="relative z-10">
                          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Destaque</p>
                          <p className="text-base font-medium text-foreground leading-snug">{data.featured.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{data.featured.description}</p>
                        </div>
                      </Link>

                      {/* Columns */}
                      <div className="flex gap-6 p-5">
                        {data.columns.map((col) => (
                          <div key={col.title}>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                              {col.title}
                            </p>
                            <ul className="space-y-1.5">
                              {col.links.map((link) => (
                                <li key={link.label}>
                                  <NavigationMenuLink asChild>
                                    <Link
                                      to={link.href}
                                      className="block text-sm text-foreground/70 hover:text-foreground transition-colors py-1"
                                    >
                                      {link.label}
                                    </Link>
                                  </NavigationMenuLink>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}

              {/* Simple links */}
              <NavigationMenuItem>
                <Link
                  to={novidadesHref}
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors px-2.5 py-1.5"
                >
                  Novidades
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link
                  to={saleHref}
                  className="text-sm font-medium text-red-500 hover:text-red-400 transition-colors px-2.5 py-1.5"
                >
                  Sale
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-5">
          <button
            type="button"
            aria-label="Buscar produtos"
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex hover:text-foreground/70 transition-colors text-foreground"
          >
            <Search className="w-[18px] h-[18px]" />
          </button>
          <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
          <Link to="/favoritos" className="hidden md:flex relative hover:text-foreground/70 transition-colors text-foreground">
            <Heart className="w-[18px] h-[18px]" />
            {totalFavorites > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center leading-none">
                {totalFavorites}
              </span>
            )}
          </Link>
          <Link
            to={accountHref}
            title={isAuthenticated ? "Minha conta" : "Entrar"}
            className="hidden md:flex hover:text-foreground/70 transition-colors text-foreground"
          >
            <User className="w-[18px] h-[18px]" />
          </Link>

          <button
            className="relative hover:text-foreground/70 transition-colors text-foreground"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="w-[18px] h-[18px]" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2.5 bg-red-500 text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center leading-none">
                {totalItems}
              </span>
            )}
          </button>

          <ThemeToggle />

          {/* Mobile Menu */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button className="hover:text-foreground/70 transition-colors text-foreground">
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:w-[400px] bg-background p-0 overflow-y-auto">
                <SheetHeader className="p-6 pb-0">
                  <SheetTitle className="text-left text-2xl font-semibold tracking-widest uppercase">
                    ROUHI
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col p-6 pt-8">
                  {Object.entries(menuData).map(([category, data]) => (
                    <div key={category} className="mb-6">
                      <Link
                        to={buildProductsHref(category)}
                        className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block hover:text-foreground"
                      >
                        {category}
                      </Link>
                      <div className="flex flex-col">
                        {data.columns.flatMap((col) => col.links).map((link) => (
                          <Link key={link.label} to={link.href} className="text-base text-foreground/80 hover:text-foreground py-2 transition-colors">
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="h-px bg-border my-4" />
                  <Link to={novidadesHref} className="text-base text-foreground/80 hover:text-foreground py-2 transition-colors">
                    Novidades
                  </Link>
                  <Link to={maisVendidosHref} className="text-base text-foreground/80 hover:text-foreground py-2 transition-colors">
                    Mais Vendidos
                  </Link>
                  <Link to={saleHref} className="text-base text-red-500 hover:text-red-400 py-2 transition-colors">
                    Sale
                  </Link>
                  <div className="h-px bg-border my-4" />
                  <Link to="/favoritos" className="flex items-center gap-3 text-base text-foreground/80 hover:text-foreground py-2 transition-colors">
                    <Heart className="w-5 h-5" /> Favoritos {totalFavorites > 0 && `(${totalFavorites})`}
                  </Link>
                  <Link to={accountHref} className="flex items-center gap-3 text-base text-foreground/80 hover:text-foreground py-2 transition-colors">
                    <User className="w-5 h-5" /> {isAuthenticated ? "Minha conta" : "Entrar"}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSearchOpen(true)}
                    className="flex items-center gap-3 text-base text-foreground/80 hover:text-foreground py-2 transition-colors"
                  >
                    <Search className="w-5 h-5" /> Buscar
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}