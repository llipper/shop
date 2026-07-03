"use client";

import { Product } from "@/types/product";
import Image from "@/components/ui/image";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/contexts/cart-context";
import { toast } from "sonner";
import {
  findVariant,
  getColorsForSize,
  getInitialSelection,
  getSizesForColor,
  getUniqueColors,
  getVariantImageForColor,
} from "@/lib/product-variants";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ProductOverviewProps {
  product: Product;
}

export function ProductOverview({ product }: ProductOverviewProps) {
  const { addItem } = useCart();
  const variants = product.variants ?? [];
  const hasColors = (product.colors?.length ?? 0) > 1 || getUniqueColors(variants).length > 1;
  const hasSizes = (product.sizes?.length ?? 0) > 1;

  const initial = getInitialSelection(product);
  const [selectedColor, setSelectedColor] = useState(initial.color);
  const [selectedSize, setSelectedSize] = useState(initial.size);

  const availableSizes = useMemo(
    () => getSizesForColor(variants, selectedColor),
    [variants, selectedColor],
  );

  const availableColors = useMemo(
    () => getColorsForSize(variants, selectedSize),
    [variants, selectedSize],
  );

  const selectedVariant = useMemo(
    () => findVariant(variants, selectedColor, selectedSize),
    [variants, selectedColor, selectedSize],
  );

  const activeVariant = selectedVariant ?? variants[0];
  const selectedImage = activeVariant?.image ?? product.image;
  const selectedPrice = activeVariant?.price ?? product.price;
  const gallery = product.gallery ?? [product.image];

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    const sizesForColor = getSizesForColor(variants, color);
    if (!sizesForColor.includes(selectedSize)) {
      setSelectedSize(sizesForColor[0] ?? selectedSize);
    }
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    const colorsForSize = getColorsForSize(variants, size);
    if (!colorsForSize.includes(selectedColor)) {
      setSelectedColor(colorsForSize[0] ?? selectedColor);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-12 py-24 pt-36 grid grid-cols-1 lg:grid-cols-2 gap-16">
      <div className="flex flex-col gap-4">
        <div className="relative aspect-[4/5] w-full bg-secondary rounded-xl overflow-hidden group cursor-crosshair">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
            >
              <Image
                src={selectedImage}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {gallery.length > 1 && (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {gallery.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  const match = variants.find((v) => v.image === img);
                  if (match) {
                    setSelectedColor(match.color);
                    setSelectedSize(match.size);
                  }
                }}
                className={cn(
                  "relative w-20 h-24 flex-shrink-0 bg-secondary rounded-md overflow-hidden transition-all",
                  selectedImage === img
                    ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                    : "opacity-70 hover:opacity-100",
                )}
              >
                <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col pt-8 lg:pr-12">
        <h1 className="text-4xl font-medium text-foreground mb-3">{product.title}</h1>

        <p className="text-2xl text-muted-foreground mb-8 font-light">
          R$ {selectedPrice.toFixed(2).replace(".", ",")}
        </p>

        {hasColors && (
          <div className="mb-10">
            <h3 className="text-sm font-medium mb-4">
              Cor:{" "}
              <span className="text-muted-foreground font-normal">{selectedColor}</span>
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
                    onClick={() => handleColorSelect(color)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 transition-all",
                      selectedColor === color
                        ? "opacity-100"
                        : "opacity-70 hover:opacity-100",
                    )}
                  >
                    <span
                      className={cn(
                        "relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all",
                        selectedColor === color
                          ? "border-foreground scale-105"
                          : "border-border hover:border-foreground/50",
                      )}
                    >
                      <Image
                        src={swatchImage}
                        alt={color}
                        fill
                        className="object-cover"
                      />
                    </span>
                    <span className="text-[10px] text-muted-foreground max-w-14 truncate">
                      {color}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {hasSizes && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">
                Tamanho:{" "}
                <span className="text-muted-foreground font-normal">{selectedSize}</span>
              </h3>
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="text-sm text-muted-foreground underline hover:text-foreground transition-colors"
                  >
                    Guia de Tamanhos
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Guia de Tamanhos</DialogTitle>
                    <DialogDescription>
                      Medidas em centímetros (aproximadas).
                    </DialogDescription>
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
            <div className="flex flex-wrap gap-3">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeSelect(size)}
                  className={cn(
                    "min-w-14 h-14 px-3 flex items-center justify-center border rounded-md text-sm font-medium transition-all",
                    selectedSize === size
                      ? "border-foreground text-foreground bg-foreground/5 shadow-sm"
                      : "border-border text-muted-foreground hover:border-foreground",
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          disabled={!activeVariant}
          onClick={() => {
            if (!activeVariant) return;
            addItem(
              product,
              activeVariant.size,
              activeVariant.color,
              activeVariant.image,
              activeVariant.id,
              activeVariant.price,
            );
            toast.success(`${product.title} adicionado ao carrinho!`, {
              description: `Cor: ${activeVariant.color} | Tamanho: ${activeVariant.size}`,
            });
          }}
          className="w-full bg-primary text-primary-foreground py-5 font-medium rounded-md hover:bg-primary/90 transition-all active:scale-[0.98] mb-10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Adicionar ao Carrinho
        </button>

        <div className="prose prose-sm text-muted-foreground border-t border-border pt-8">
          <p className="leading-relaxed">
            {product.description ||
              "A camiseta essencial perfeita para qualquer ocasião. Feita com algodão incrivelmente macio e modelagem moderna, desenhada para se adaptar perfeitamente ao seu corpo."}
          </p>
        </div>
      </div>
    </div>
  );
}