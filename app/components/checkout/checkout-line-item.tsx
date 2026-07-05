"use client";

import { Minus, Plus, X } from "lucide-react";
import Image from "@/components/ui/image";
import type { CartItem } from "@/contexts/cart-context";
import { cn } from "@/lib/utils";

type CheckoutLineItemProps = {
  item: CartItem;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
};

export function CheckoutLineItem({
  item,
  onDecrease,
  onIncrease,
  onRemove,
}: CheckoutLineItemProps) {
  const lineTotal = item.price * item.quantity;

  return (
    <article className="group relative flex gap-5 rounded-2xl border border-border/80 bg-background p-4 transition-colors hover:border-foreground/15 md:p-5">
      <div className="relative h-28 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-secondary md:h-32 md:w-28">
        <Image
          src={item.image}
          alt={item.product.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {item.product.category}
            </p>
            <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-foreground md:text-base">
              {item.product.title}
            </h3>
            <p className="mt-2 text-xs text-muted-foreground">
              {item.colorName}
              <span className="mx-2 text-border">|</span>
              Tamanho {item.size}
            </p>
          </div>

          <button
            type="button"
            onClick={onRemove}
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Remover item"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex items-end justify-between gap-4">
          <div className="inline-flex items-center rounded-full border border-border bg-secondary/40 p-1">
            <button
              type="button"
              onClick={onDecrease}
              className="flex h-8 w-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-background"
              aria-label="Diminuir quantidade"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-medium tabular-nums">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={onIncrease}
              disabled={item.availableForSale === false}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-background",
                "disabled:pointer-events-none disabled:opacity-40",
              )}
              aria-label="Aumentar quantidade"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Subtotal
            </p>
            <p className="text-base font-medium tabular-nums text-foreground md:text-lg">
              R$ {lineTotal.toFixed(2).replace(".", ",")}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}