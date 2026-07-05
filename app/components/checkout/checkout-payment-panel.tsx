"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CheckoutPaymentPanelProps = {
  variant?: "payment" | "pix";
  children: ReactNode;
};

export function CheckoutPaymentPanel({
  variant = "payment",
  children,
}: CheckoutPaymentPanelProps) {
  const isPix = variant === "pix";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border/80 bg-background shadow-[0_24px_80px_-40px_rgba(0,0,0,0.35)]",
        isPix && "bg-gradient-to-b from-secondary/30 to-background",
      )}
    >
      <div className={cn("p-4 md:p-6", isPix && "md:p-8")}>{children}</div>
    </div>
  );
}