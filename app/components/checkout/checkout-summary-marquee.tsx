"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type CheckoutSummaryMarqueeProps = {
  items: Array<{ image: string; title: string }>;
  className?: string;
};

const BRAND_TICKER = [
  "ROCCIUS",
  "Moda minimalista",
  "Curadoria exclusiva",
  "Frete grátis acima de R$ 200",
  "Checkout seguro",
  "Peças essenciais",
] as const;

export function CheckoutSummaryProductMarquee({
  items,
  className,
}: CheckoutSummaryMarqueeProps) {
  if (!items.length) return null;

  const loop = [...items, ...items];

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background to-transparent" />

      <motion.div
        className="flex w-max gap-2.5 py-1"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: Math.max(18, items.length * 6), repeat: Infinity, ease: "linear" }}
      >
        {loop.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-border/70 bg-muted/30"
          >
            <img
              src={item.image}
              alt={item.title}
              className="size-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function CheckoutSummaryBrandTicker({ className }: { className?: string }) {
  const loop = [...BRAND_TICKER, ...BRAND_TICKER];

  return (
    <div className={cn("relative overflow-hidden border-y border-border/50 bg-muted/20 py-2", className)}>
      <motion.div
        className="flex w-max items-center gap-8 px-2"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        {loop.map((label, index) => (
          <span
            key={`${label}-${index}`}
            className="flex shrink-0 items-center gap-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
          >
            {label}
            <span className="size-1 rounded-full bg-foreground/25" aria-hidden />
          </span>
        ))}
      </motion.div>
    </div>
  );
}