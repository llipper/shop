"use client";

import { ArrowRight, Lock, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { CheckoutBrandMark } from "@/components/checkout/checkout-brand-mark";
import {
  CheckoutSummaryBrandTicker,
  CheckoutSummaryProductMarquee,
} from "@/components/checkout/checkout-summary-marquee";
import { Button } from "@/components/ui/button";
import { getShippingLabel } from "@/lib/shipping";
import { cn } from "@/lib/utils";

const FREE_SHIPPING_MIN = 200;

export type CheckoutSummaryPreviewItem = {
  image: string;
  title: string;
};

type CheckoutOrderSummaryProps = {
  itemCount: number;
  subtotal: number;
  shippingCost: number;
  previewItems?: CheckoutSummaryPreviewItem[];
  children?: React.ReactNode;
  className?: string;
  compact?: boolean;
};

function formatBRL(value: number) {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

export function CheckoutOrderSummary({
  itemCount,
  subtotal,
  shippingCost,
  previewItems = [],
  children,
  className,
  compact = false,
}: CheckoutOrderSummaryProps) {
  const total = subtotal + shippingCost;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_MIN - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_MIN) * 100);

  return (
    <aside
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-b from-secondary/50 via-background to-background shadow-[0_28px_90px_-44px_rgba(0,0,0,0.4)]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent"
        aria-hidden
      />

      <div className="space-y-5 p-6 md:p-7">
        <CheckoutBrandMark itemCount={itemCount} />

        {previewItems.length > 0 ? (
          <CheckoutSummaryProductMarquee items={previewItems} />
        ) : null}

        <CheckoutSummaryBrandTicker />

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium tabular-nums">{formatBRL(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{getShippingLabel(shippingCost)}</span>
            <span
              className={cn(
                "font-medium",
                shippingCost === 0 ? "text-emerald-700" : "tabular-nums",
              )}
            >
              {shippingCost === 0 ? "Grátis" : formatBRL(shippingCost)}
            </span>
          </div>
        </div>

        {!compact &&
          (remainingForFreeShipping > 0 ? (
            <div className="rounded-xl border border-border/70 bg-background/80 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="size-3.5 text-foreground" />
                Faltam {formatBRL(remainingForFreeShipping)} para frete grátis
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                <motion.div
                  className="h-full rounded-full bg-foreground"
                  initial={{ width: 0 }}
                  animate={{ width: `${freeShippingProgress}%` }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-xs text-emerald-800"
            >
              <Truck className="size-4 shrink-0" />
              Você desbloqueou frete grátis neste pedido.
            </motion.div>
          ))}

        <div className="flex items-end justify-between border-t border-border/70 pt-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Total
            </p>
            <motion.p
              key={total}
              initial={{ opacity: 0.6, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-2xl font-light tracking-tight text-foreground md:text-3xl"
            >
              {formatBRL(total)}
            </motion.p>
          </div>
        </div>

        {children ? <div className="space-y-4">{children}</div> : null}

        <div className="space-y-3 border-t border-border/70 pt-5">
          {(compact
            ? [{ icon: Lock, text: "Pagamento protegido pelo Mercado Pago" }]
            : [
                { icon: Lock, text: "Pagamento protegido pelo Mercado Pago" },
                { icon: Truck, text: "Frete grátis em compras acima de R$ 200" },
                { icon: ShieldCheck, text: "Checkout exclusivo no site ROUHI" },
              ]
          ).map(({ icon: Icon, text }, index) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06 }}
              className="flex items-center gap-3 text-xs text-muted-foreground"
            >
              <span className="flex size-8 items-center justify-center rounded-full border border-border bg-background">
                <Icon className="size-3.5 text-foreground" />
              </span>
              {text}
            </motion.div>
          ))}
        </div>
      </div>
    </aside>
  );
}

type CheckoutPrimaryActionProps = {
  label: string;
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
};

export function CheckoutPrimaryAction({
  label,
  disabled,
  loading,
  onClick,
}: CheckoutPrimaryActionProps) {
  return (
    <Button
      type="button"
      className="h-12 w-full rounded-full text-sm font-medium tracking-wide"
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? "Processando..." : label}
      {!loading && <ArrowRight className="ml-2 size-4" />}
    </Button>
  );
}