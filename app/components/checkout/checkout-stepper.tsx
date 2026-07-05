"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type CheckoutStepId = "review" | "shipping" | "payment" | "pix";

const STEPS: Array<{ id: CheckoutStepId; number: number; label: string }> = [
  { id: "review", number: 1, label: "Revisão" },
  { id: "shipping", number: 2, label: "Entrega" },
  { id: "payment", number: 3, label: "Pagamento" },
];

function stepIndex(step: CheckoutStepId) {
  if (step === "pix") return 2;
  return STEPS.findIndex((s) => s.id === step);
}

type CheckoutStepperProps = {
  step: CheckoutStepId;
};

export function CheckoutStepper({ step }: CheckoutStepperProps) {
  const activeIndex = stepIndex(step);

  return (
    <nav aria-label="Progresso do checkout" className="mb-12">
      <ol className="flex items-center justify-between gap-2">
        {STEPS.map((item, index) => {
          const isComplete = index < activeIndex;
          const isActive = index === activeIndex;

          return (
            <li key={item.id} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-2 min-w-0">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold transition-all",
                    isComplete && "border-foreground bg-foreground text-primary-foreground",
                    isActive && "border-foreground bg-background text-foreground ring-4 ring-foreground/5",
                    !isComplete && !isActive && "border-border bg-background text-muted-foreground",
                  )}
                >
                  {isComplete ? <Check className="h-4 w-4" strokeWidth={2.5} /> : item.number}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-[0.16em] whitespace-nowrap",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </span>
              </div>

              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-3 mb-5 h-px flex-1 transition-colors",
                    index < activeIndex ? "bg-foreground" : "bg-border",
                  )}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

type CheckoutHeaderProps = {
  step: CheckoutStepId;
};

const HEADER_COPY: Record<
  CheckoutStepId,
  { eyebrow: string; title: string; description: string }
> = {
  review: {
    eyebrow: "Checkout seguro",
    title: "Seu pedido",
    description:
      "Revise cada peça com calma. Pagamento e entrega ficam 100% no site ROCCIUS, com proteção Mercado Pago.",
  },
  shipping: {
    eyebrow: "Entrega",
    title: "Para onde enviamos?",
    description: "Informe o endereço de entrega. O frete é calculado automaticamente no resumo.",
  },
  payment: {
    eyebrow: "Pagamento",
    title: "Pagamento",
    description: "",
  },
  pix: {
    eyebrow: "Pix",
    title: "Pix",
    description: "Escaneie o QR Code ou copie o código. A confirmação é automática.",
  },
};

export function CheckoutHeader({ step }: CheckoutHeaderProps) {
  const copy = HEADER_COPY[step];
  const stepNumber = step === "pix" ? 3 : STEPS.findIndex((s) => s.id === step) + 1;
  const isCompact = step === "payment" || step === "pix";

  return (
    <header
      className={cn(
        "mb-10 border-b border-border/80 pb-10",
        isCompact && "mb-8 pb-6",
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Passo {stepNumber} de 3 · {copy.eyebrow}
      </p>
      {!isCompact && copy.title ? (
        <h1 className="mt-3 text-3xl font-medium tracking-tight text-foreground md:text-4xl md:leading-[1.1]">
          {copy.title}
        </h1>
      ) : null}
      {copy.description ? (
        <p
          className={cn(
            "max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base",
            isCompact ? "mt-2" : "mt-3",
          )}
        >
          {copy.description}
        </p>
      ) : null}
    </header>
  );
}