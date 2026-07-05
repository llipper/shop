"use client";

import { motion } from "framer-motion";
import { Lock, Package, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { CheckoutBrandMark } from "@/components/checkout/checkout-brand-mark";
import {
  CheckoutSummaryBrandTicker,
  CheckoutSummaryProductMarquee,
} from "@/components/checkout/checkout-summary-marquee";
import Image from "@/components/ui/image";
import { getShippingLabel } from "@/lib/shipping";
import type { CheckoutSuccessSnapshot } from "@/lib/checkout-success-snapshot";
import { cn } from "@/lib/utils";

function formatBRL(value: number) {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

const TRUST_ITEMS = [
  { icon: Lock, text: "Pagamento protegido pelo Mercado Pago" },
  { icon: Truck, text: "Envio com rastreio após confirmação" },
  { icon: ShieldCheck, text: "Checkout exclusivo ROUHI" },
] as const;

type CheckoutSuccessOrderCardProps = {
  snapshot: CheckoutSuccessSnapshot;
  orderName?: string | null;
  className?: string;
};

export function CheckoutSuccessOrderCard({
  snapshot,
  orderName,
  className,
}: CheckoutSuccessOrderCardProps) {
  const previewItems = snapshot.items.map((item) => ({
    image: item.image,
    title: item.title,
  }));
  const visibleItems = snapshot.items.slice(0, 3);
  const hiddenCount = Math.max(0, snapshot.items.length - visibleItems.length);

  return (
    <motion.aside
      initial={{ opacity: 0, y: 28, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-secondary/60 via-background to-background shadow-[0_32px_100px_-48px_rgba(0,0,0,0.45)]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent"
        aria-hidden
      />
      <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-foreground/[0.03] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 size-56 rounded-full bg-emerald-500/[0.04] blur-3xl" />

      <div className="space-y-5 p-6 md:p-8">
        <CheckoutBrandMark itemCount={snapshot.itemCount} />

        {orderName ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/80 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-foreground text-background">
                <Package className="size-4" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Seu pedido
                </p>
                <p className="text-sm font-medium text-foreground">{orderName}</p>
              </div>
            </div>
            <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
              Pago
            </span>
          </motion.div>
        ) : null}

        {previewItems.length > 0 ? (
          <CheckoutSummaryProductMarquee items={previewItems} />
        ) : null}

        <div className="space-y-3">
          {visibleItems.map((item, index) => (
            <motion.article
              key={`${item.title}-${item.size}-${index}`}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.08, duration: 0.45 }}
              className="flex items-center gap-4 rounded-2xl border border-border/70 bg-background/70 p-3"
            >
              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-secondary">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                {item.category ? (
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {item.category}
                  </p>
                ) : null}
                <p className="line-clamp-1 text-sm font-medium text-foreground">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.colorName} · Tam. {item.size} · Qtd. {item.quantity}
                </p>
              </div>
              <p className="shrink-0 text-sm font-medium tabular-nums text-foreground">
                {formatBRL(item.price * item.quantity)}
              </p>
            </motion.article>
          ))}

          {hiddenCount > 0 ? (
            <p className="text-center text-xs text-muted-foreground">
              + {hiddenCount} {hiddenCount === 1 ? "peça" : "peças"} neste pedido
            </p>
          ) : null}
        </div>

        <CheckoutSummaryBrandTicker />

        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium tabular-nums">{formatBRL(snapshot.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {getShippingLabel(snapshot.shippingCost)}
            </span>
            <span
              className={cn(
                "font-medium",
                snapshot.shippingCost === 0 ? "text-emerald-700" : "tabular-nums",
              )}
            >
              {snapshot.shippingCost === 0 ? "Grátis" : formatBRL(snapshot.shippingCost)}
            </span>
          </div>
        </div>

        <div className="flex items-end justify-between border-t border-border/70 pt-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Total pago
            </p>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="mt-1 text-3xl font-light tracking-tight text-foreground"
            >
              {formatBRL(snapshot.total)}
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
          >
            <Sparkles className="size-3.5 text-foreground" />
            5–10 dias úteis
          </motion.div>
        </div>

        <div className="space-y-3 border-t border-border/70 pt-5">
          {TRUST_ITEMS.map(({ icon: Icon, text }, index) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.65 + index * 0.06 }}
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
    </motion.aside>
  );
}