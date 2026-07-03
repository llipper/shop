"use client";

import { Product } from "@/types/product";
import Image from "@/components/ui/image";
import { Link } from "react-router";
import { Heart, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/contexts/favorites-context";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const liked = isFavorite(product.id);

  return (
    <div
      className="group flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Area */}
      <Link to={`/store/product/${product.handle}`} className="relative aspect-[3/4] w-full bg-secondary rounded-lg overflow-hidden block">
        <Image
          src={product.image}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Badge */}
        {product.badge && (
          <span className={cn(
            "absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full",
            product.badge === "Novo" && "bg-green-500 text-white",
            product.badge === "Mais Vendido" && "bg-primary text-primary-foreground",
            product.badge === "Limitado" && "bg-amber-500 text-white",
          )}>
            {product.badge}
          </span>
        )}

        {/* Hover Overlay: Quick Actions */}
        <div className={cn(
          "absolute inset-0 bg-black/0 transition-all duration-300 flex flex-col justify-between p-3",
          isHovered ? "bg-black/10" : ""
        )}>
          {/* Wishlist Heart */}
          <div className="flex justify-end">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(product);
              }}
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300",
                isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
                liked ? "bg-red-500 text-white" : "bg-background/90 text-foreground hover:bg-background"
              )}
            >
              <Heart className={cn("w-4 h-4", liked && "fill-current")} />
            </button>
          </div>

          {/* Quick Add Button */}
          <div className={cn(
            "transition-all duration-300",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Navigate to product page for size selection
                window.location.href = `/store/product/${product.handle}`;
              }}
              className="w-full bg-background/95 backdrop-blur-sm text-foreground py-2.5 rounded-md text-xs font-medium hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Comprar Agora
            </button>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="flex flex-col pt-3 px-0.5">
        <Link to={`/store/product/${product.handle}`}>
          <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {product.title}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground mt-1">
          {product.color}
        </p>
        <p className="text-sm font-semibold text-foreground mt-1.5">
          R$ {product.price.toFixed(2).replace('.', ',')}
        </p>

        {(product.colors?.length ?? 0) > 1 && (
          <div className="flex gap-1.5 mt-2.5">
            {(product.colors ?? []).slice(0, 5).map((color) => {
              const variant = product.variants?.find((v) => v.color === color);
              const swatch = variant?.image ?? product.image;
              return (
                <span
                  key={color}
                  title={color}
                  className="relative w-4 h-4 rounded-full border border-foreground/15 overflow-hidden"
                >
                  <Image src={swatch} alt={color} fill className="object-cover" />
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
