"use client";

import { CreditCard, Landmark, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

export type CheckoutPaymentMethod = "card" | "pix" | "ticket";

type CheckoutPaymentMethodsProps = {
  value: CheckoutPaymentMethod;
  onValueChange: (value: CheckoutPaymentMethod) => void;
  disabled?: boolean;
};

const METHODS: Array<{
  value: CheckoutPaymentMethod;
  label: string;
  detail?: string;
  icon: typeof CreditCard;
}> = [
  { value: "card", label: "Cartão", detail: "até 6x", icon: CreditCard },
  { value: "pix", label: "Pix", icon: QrCode },
  { value: "ticket", label: "Boleto", icon: Landmark },
];

export function CheckoutPaymentMethods({
  value,
  onValueChange,
  disabled,
}: CheckoutPaymentMethodsProps) {
  return (
    <div
      role="tablist"
      aria-label="Forma de pagamento"
      className={cn(
        "flex gap-2 rounded-xl border border-border/70 bg-muted/25 p-1",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      {METHODS.map(({ value: methodValue, label, detail, icon: Icon }) => {
        const active = value === methodValue;

        return (
          <button
            key={methodValue}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onValueChange(methodValue)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              active
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/80"
                : "text-muted-foreground hover:bg-background/50 hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" strokeWidth={1.75} />
            <span>{label}</span>
            {detail ? (
              <span className="text-[10px] font-normal uppercase tracking-wider text-muted-foreground">
                {detail}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}