"use client";

import { useMemo, useState } from "react";
import { useLoaderData } from "react-router";
import { Header } from "@/components/layout/header";
import { Hero } from "@/components/home/hero";
import { CategoryFilter } from "@/components/home/category-filter";
import { ProductGrid } from "@/components/home/product-grid";
import { filterProducts } from "@/lib/product-filters";
import type { Product } from "@/types/product";

export type StoreCatalogLoaderData = {
  catalog: Product[];
  shop: string | null;
  error: string | null;
};

export function StoreCatalogPage() {
  const { catalog, shop, error } = useLoaderData<StoreCatalogLoaderData>();
  const [activeCategory, setActiveCategory] = useState("Masculino");

  const visibleProducts = useMemo(
    () => filterProducts(catalog, { categoria: activeCategory }),
    [catalog, activeCategory],
  );

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <Header />
      <Hero />
      <div className="max-w-[1440px] mx-auto">
        {error && (
          <p className="mx-12 mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {!error && shop && catalog.length === 0 && (
          <p className="mx-12 mb-6 text-sm text-muted-foreground">
            Nenhum produto publicado na loja{" "}
            <strong className="text-foreground">{shop}</strong>. Cadastre
            produtos no canal de vendas Online Store no admin da Shopify.
          </p>
        )}

        <CategoryFilter active={activeCategory} onChange={setActiveCategory} />
        {visibleProducts.length === 0 ? (
          <p className="mx-12 mb-24 text-center text-sm text-muted-foreground">
            Nenhum produto em <strong className="text-foreground">{activeCategory}</strong> no momento.
          </p>
        ) : (
          <ProductGrid products={visibleProducts} />
        )}
      </div>
    </main>
  );
}