"use client";

import type { Product, ProductVariant } from "@/types/product";
import Image from "@/components/ui/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatInstallments, formatPrice } from "@/lib/format";
import {
  findVariant,
  getColorsForSize,
  getSizesForColor,
  getUniqueColors,
  getVariantImageForColor,
} from "@/lib/product-variants";
import { cn } from "@/lib/utils";
import { Heart, Package, RefreshCw, ShieldCheck, Truck } from "lucide-react";
import { useMemo } from "react";

interface ProductPurchasePanelProps {
  product: Product;
  selectedColor: string;
  selectedSize: string;
  onColorSelect: (color: string) => void;
  onSizeSelect: (size: string) => void;
  onAddToCart: (variant: ProductVariant) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function ProductPurchasePanel({
  product,
  selectedColor,
  selectedSize,
  onColorSelect,
  onSizeSelect,
  onAddToCart,
  isFavorite,
  onToggleFavorite,
}: ProductPurchasePanelProps) {
  const variants = product.variants ?? [];
  const hasColors =
    (product.colors?.length ?? 0) > 1 || getUniqueColors(variants).length > 1;
  const hasSizes = (product.sizes?.length ?? 0) > 1;

  const availableSizes = useMemo(
    () => getSizesForColor(variants, selectedColor),
    [variants, selectedColor],
  );

  const availableColors = useMemo(
    () => getColorsForSize(variants, selectedSize),
    [variants, selectedSize],
  );

  const activeVariant = useMemo(
    () => findVariant(variants, selectedColor, selectedSize) ?? variants[0],
    [variants, selectedColor, selectedSize],
  );

  const price = activeVariant?.price ?? product.price;
  const compareAt = activeVariant?.compareAtPrice;
  const discount =
    compareAt && compareAt > price
      ? Math.round(((compareAt - price) / compareAt) * 100)
      : null;

  return (
    <div className="lg:sticky lg:top-28 lg:self-start">
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {product.badge && (
          <span className="rounded-full border border-foreground/10 bg-foreground px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-background">
            {product.badge}
          </span>
        )}
        <span className="rounded-full border border-border px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {product.category}
        </span>
        {product.vendor && (
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            por {product.vendor}
          </span>
        )}
      </div>

      <h1 className="text-3xl font-medium tracking-tight text-foreground md:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
        {product.title}
      </h1>

      <div className="mt-6 border-b border-border pb-6">
        <div className="flex flex-wrap items-end gap-3">
          <p className="text-3xl font-light tracking-tight text-foreground">
            {formatPrice(price, product.currencyCode)}
          </p>
          {compareAt && compareAt > price && (
            <>
              <p className="pb-1 text-lg text-muted-foreground line-through">
                {formatPrice(compareAt, product.currencyCode)}
              </p>
              {discount && (
                <span className="mb-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  -{discount}%
                </span>
              )}
            </>
          )}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {formatInstallments(price)}
        </p>
      </div>

      {hasColors && (
        <div className="mt-8">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
            Cor <span className="font-normal text-muted-foreground">· {selectedColor}</span>
          </h3>
          <div className="flex flex-wrap gap-3">
            {availableColors.map((color) => {
              const swatchImage =
                getVariantImageForColor(variants, color) ?? product.image;
              return (
                <button
                  key={color}
                  type="button"
                  title={color}
                  onClick={() => onColorSelect(color)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 transition-all",
                    selectedColor === color ? "opacity-100" : "opacity-70 hover:opacity-100",
                  )}
                >
                  <span
                    className={cn(
                      "relative h-14 w-14 overflow-hidden rounded-full border-2 transition-all",
                      selectedColor === color
                        ? "border-foreground scale-105"
                        : "border-border hover:border-foreground/50",
                    )}
                  >
                    <Image src={swatchImage} alt={color} fill className="object-cover" />
                  </span>
                  <span className="max-w-16 truncate text-[10px] text-muted-foreground">
                    {color}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {hasSizes && (
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
              Tamanho <span className="font-normal text-muted-foreground">· {selectedSize}</span>
            </h3>
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="text-xs uppercase tracking-[0.12em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Guia de tamanhos
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Guia de Tamanhos</DialogTitle>
                  <DialogDescription>Medidas aproximadas em centímetros.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <table className="w-full text-sm text-left">
                    <thead className="border-b border-border text-foreground">
                      <tr>
                        <th className="py-2 font-medium">Tamanho</th>
                        <th className="py-2 font-medium">Peito</th>
                        <th className="py-2 font-medium">Comprimento</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-muted-foreground">
                      {["P", "M", "G", "GG", "XG", "G1", "G2"].map((size, i) => (
                        <tr key={size}>
                          <td className="py-3">{size}</td>
                          <td className="py-3">{50 + i * 3} cm</td>
                          <td className="py-3">{70 + i * 2} cm</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {availableSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onSizeSelect(size)}
                className={cn(
                  "min-w-14 h-12 px-4 flex items-center justify-center border rounded-lg text-sm font-medium transition-all",
                  selectedSize === size
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground",
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          disabled={!activeVariant || activeVariant.availableForSale === false}
          onClick={() => activeVariant && onAddToCart(activeVariant)}
          className="flex-1 rounded-xl bg-primary py-4 text-sm font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {activeVariant?.availableForSale === false ? "Indisponível" : "Adicionar ao carrinho"}
        </button>
        <button
          type="button"
          onClick={onToggleFavorite}
          className={cn(
            "flex h-[52px] w-[52px] items-center justify-center rounded-xl border transition-all",
            isFavorite
              ? "border-red-200 bg-red-50 text-red-500"
              : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
          )}
          aria-label="Adicionar aos favoritos"
        >
          <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { icon: Truck, label: "Frete expresso", detail: "Entrega rastreada em todo o Brasil" },
          { icon: RefreshCw, label: "Troca facilitada", detail: "30 dias para primeira troca" },
          { icon: ShieldCheck, label: "Compra segura", detail: "Checkout oficial Shopify" },
        ].map(({ icon: Icon, label, detail }) => (
          <div
            key={label}
            className="rounded-xl border border-border/80 bg-muted/30 px-4 py-3"
          >
            <Icon className="mb-2 h-4 w-4 text-foreground" />
            <p className="text-xs font-semibold uppercase tracking-[0.12em]">{label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
          </div>
        ))}
      </div>

      {activeVariant?.availableForSale === false && (
        <p className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Variante esgotada. Escolha outra cor ou tamanho, ou reponha o estoque no admin da Shopify.
        </p>
      )}

      <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Package className="h-4 w-4" />
        <span>Envio em até 2 dias úteis após confirmação do pagamento.</span>
      </div>
    </div>
  );
}