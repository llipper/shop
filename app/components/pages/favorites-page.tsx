"use client";

import { Link } from "react-router";
import { useFavorites } from "@/contexts/favorites-context";
import { Header } from "@/components/layout/header";
import { ProductCard } from "@/components/home/product-card";
import { Heart } from "lucide-react";

export function FavoritesPage() {
  const { favorites } = useFavorites();

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-24">
        <h1 className="text-3xl font-medium text-foreground mb-2">Meus Favoritos</h1>
        <p className="text-muted-foreground mb-12">
          {favorites.length > 0
            ? `${favorites.length} ${favorites.length === 1 ? "item salvo" : "itens salvos"}`
            : ""}
        </p>

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-medium text-foreground mb-2">Nenhum favorito ainda</h2>
            <p className="text-muted-foreground max-w-sm mb-8">
              Explore nossa coleção e clique no coração dos produtos que você mais gostar para salvá-los aqui.
            </p>
            <Link
              to="/store"
              className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-medium hover:bg-primary/90 transition-all"
            >
              Explorar Produtos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
            {favorites.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}