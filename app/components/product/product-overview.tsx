"use client";

import type { Product } from "@/types/product";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductPurchasePanel } from "@/components/product/product-purchase-panel";
import { ProductStorySection } from "@/components/product/product-story-section";
import { useCart } from "@/contexts/cart-context";
import { useFavorites } from "@/contexts/favorites-context";
import { formatPrice } from "@/lib/format";
import {
  getInitialSelection,
  getSizesForColor,
  getColorsForSize,
  getVariantImageForColor,
} from "@/lib/product-variants";
import { ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { toast } from "sonner";

interface ProductOverviewProps {
  product: Product;
}

export function ProductOverview({ product }: ProductOverviewProps) {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [searchParams] = useSearchParams();
  const variants = product.variants ?? [];

  const initial = getInitialSelection(product);
  const gallery = product.gallery ?? [product.image];
  const [selectedColor, setSelectedColor] = useState(initial.color);
  const [selectedSize, setSelectedSize] = useState(initial.size);

  useEffect(() => {
    const sharedColor = searchParams.get("cor");
    const sharedSize = searchParams.get("tamanho");
    if (!sharedColor && !sharedSize) return;

    const resolvedColor =
      sharedColor && variants.some((variant) => variant.color === sharedColor)
        ? sharedColor
        : null;

    if (resolvedColor) {
      setSelectedColor(resolvedColor);
      const variantImage = getVariantImageForColor(variants, resolvedColor);
      if (variantImage) setActiveGalleryImage(variantImage);
    }

    if (sharedSize) {
      const colorForSize = resolvedColor ?? initial.color;
      const sizesForColor = getSizesForColor(variants, colorForSize);
      if (sizesForColor.includes(sharedSize)) {
        setSelectedSize(sharedSize);
      }
    }
  }, [searchParams, variants, initial.color]);
  const [activeGalleryImage, setActiveGalleryImage] = useState(
    getVariantImageForColor(variants, initial.color) ?? gallery[0] ?? product.image,
  );

  const activeVariant = useMemo(() => {
    return (
      variants.find((v) => v.color === selectedColor && v.size === selectedSize) ??
      variants[0]
    );
  }, [variants, selectedColor, selectedSize]);

  const selectedPrice = activeVariant?.price ?? product.price;

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    const sizesForColor = getSizesForColor(variants, color);
    if (!sizesForColor.includes(selectedSize)) {
      setSelectedSize(sizesForColor[0] ?? selectedSize);
    }
    const variantImage = getVariantImageForColor(variants, color);
    if (variantImage) setActiveGalleryImage(variantImage);
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    const colorsForSize = getColorsForSize(variants, size);
    if (!colorsForSize.includes(selectedColor)) {
      setSelectedColor(colorsForSize[0] ?? selectedColor);
    }
  };

  const handleImageSelect = (image: string) => {
    setActiveGalleryImage(image);
    const match = variants.find((v) => v.image === image);
    if (match) {
      setSelectedColor(match.color);
      setSelectedSize(match.size);
    }
  };

  const handleAddToCart = (variant = activeVariant) => {
    if (!variant) return;
    if (variant.availableForSale === false) {
      toast.error("Esta variante está esgotada.");
      return;
    }

    addItem(
      product,
      variant.size,
      variant.color,
      variant.image,
      variant.id,
      variant.price,
      variant.availableForSale,
    );
    toast.success(`${product.title} adicionado ao carrinho`, {
      description: `${variant.color} · ${variant.size}`,
    });
  };

  return (
    <>
      <div className="mx-auto max-w-[1440px] px-6 pb-10 pt-28 md:px-12 md:pb-16 md:pt-32">
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
        >
          <Link to="/store" className="transition-colors hover:text-foreground">
            Loja
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>{product.category}</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <ProductGallery
              title={product.title}
              images={gallery}
              activeImage={activeGalleryImage}
              onImageSelect={handleImageSelect}
            />
          </div>

          <div className="lg:col-span-5">
            <ProductPurchasePanel
              product={product}
              selectedColor={selectedColor}
              selectedSize={selectedSize}
              onColorSelect={handleColorSelect}
              onSizeSelect={handleSizeSelect}
              onAddToCart={handleAddToCart}
              isFavorite={isFavorite(product.id)}
              onToggleFavorite={() => toggleFavorite(product)}
            />
          </div>
        </div>
      </div>

      <ProductStorySection product={product} />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-4 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{product.title}</p>
            <p className="text-sm text-muted-foreground">
              {formatPrice(selectedPrice, product.currencyCode)}
            </p>
          </div>
          <button
            type="button"
            disabled={!activeVariant || activeVariant.availableForSale === false}
            onClick={() => handleAddToCart()}
            className="shrink-0 rounded-xl bg-primary px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground disabled:opacity-50"
          >
            Comprar
          </button>
        </div>
      </div>
    </>
  );
}