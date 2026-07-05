"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  Package,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import { motion } from "framer-motion";
import { CheckoutSuccessOrderCard } from "@/components/checkout/checkout-success-order-card";
import { useCart } from "@/contexts/cart-context";
import {
  buildCheckoutSuccessSnapshot,
  clearCheckoutSuccessSnapshot,
  readCheckoutSuccessSnapshot,
  type CheckoutSuccessSnapshot,
} from "@/lib/checkout-success-snapshot";
import { cn } from "@/lib/utils";

type CheckoutSuccessPageProps = {
  orderName?: string | null;
  orderId?: string | null;
  email?: string | null;
};

const TIMELINE_STEPS = [
  { key: "confirmed", label: "Pedido confirmado", icon: CheckCircle2 },
  { key: "preparing", label: "Preparando envio", icon: Package },
  { key: "delivered", label: "Entrega", icon: ShoppingBag },
] as const;

const FLOATING_PARTICLES = [
  { left: "8%", top: "18%", delay: 0, size: 6 },
  { left: "88%", top: "22%", delay: 0.4, size: 4 },
  { left: "72%", top: "68%", delay: 0.8, size: 5 },
  { left: "14%", top: "74%", delay: 1.1, size: 3 },
  { left: "48%", top: "12%", delay: 0.6, size: 4 },
] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

export function CheckoutSuccessPage({
  orderName,
  orderId,
  email,
}: CheckoutSuccessPageProps) {
  const { items, clearCart } = useCart();
  const [snapshot, setSnapshot] = useState<CheckoutSuccessSnapshot | null>(null);

  useEffect(() => {
    const stored = readCheckoutSuccessSnapshot();
    if (stored) {
      setSnapshot(stored);
    } else if (items.length > 0) {
      setSnapshot(buildCheckoutSuccessSnapshot(items));
    }

    clearCart();
    clearCheckoutSuccessSnapshot();
  }, []);

  const hasOrderReference = Boolean(orderName || orderId);
  const displayReference = orderName ?? orderId;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(0,0,0,0.06),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(255,255,255,0.06),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(rgba(0,0,0,0.08)_1px,transparent_1px)] [background-size:24px_24px] dark:[background-image:radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)]"
        aria-hidden
      />

      {FLOATING_PARTICLES.map((particle) => (
        <motion.span
          key={`${particle.left}-${particle.top}`}
          className="pointer-events-none absolute rounded-full bg-foreground/10"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.7, 0.4], scale: [0, 1.2, 1], y: [0, -12, 0] }}
          transition={{
            delay: particle.delay,
            duration: 3.2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          aria-hidden
        />
      ))}

      <header className="relative z-10 border-b border-border/80 px-6 py-5 md:px-12">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link
            to="/store"
            className="text-2xl font-semibold tracking-[0.28em] text-foreground uppercase transition-opacity hover:opacity-80"
          >
            ROUHI
          </Link>
          <span className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-[10px] font-semibold tracking-[0.18em] text-emerald-700 uppercase sm:inline-flex">
            <Sparkles className="size-3.5" />
            Compra aprovada
          </span>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-12 md:px-12 md:py-16">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16">
          <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center text-center lg:items-start lg:text-left"
          >
            <motion.div variants={itemVariants} className="relative mb-8">
              <motion.span
                className="absolute inset-0 rounded-full border border-emerald-500/30"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.45, opacity: 0 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                aria-hidden
              />
              <motion.span
                className="absolute inset-0 rounded-full border border-emerald-500/20"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 1.8, delay: 0.35, repeat: Infinity, ease: "easeOut" }}
                aria-hidden
              />
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                className="relative flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent ring-1 ring-emerald-500/20"
              >
                <CheckCircle2 className="size-12 text-emerald-600 dark:text-emerald-400" />
              </motion.div>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="mb-3 text-[10px] font-semibold tracking-[0.24em] text-muted-foreground uppercase"
            >
              Obrigado pela sua compra
            </motion.p>

            <motion.h1
              variants={itemVariants}
              className="mb-4 text-4xl font-medium tracking-tight text-foreground md:text-5xl"
            >
              Pedido confirmado!
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mb-6 max-w-lg text-base leading-relaxed text-muted-foreground"
            >
              {hasOrderReference
                ? "Recebemos seu pedido com sucesso. Em breve você receberá atualizações por e-mail."
                : "Seu pagamento foi processado com sucesso. Em instantes você receberá a confirmação por e-mail."}
            </motion.p>

            {hasOrderReference ? (
              <motion.div
                variants={itemVariants}
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-sm text-muted-foreground shadow-sm"
              >
                <Package className="size-4 text-foreground" />
                Referência{" "}
                <span className="font-medium text-foreground">{displayReference}</span>
              </motion.div>
            ) : null}

            {email ? (
              <motion.div
                variants={itemVariants}
                className="mb-10 inline-flex items-center gap-2 rounded-full border border-border/80 bg-secondary/50 px-4 py-2 text-sm text-muted-foreground"
              >
                <Mail className="size-4 shrink-0 text-foreground" />
                Confirmação enviada para{" "}
                <span className="font-medium text-foreground">{email}</span>
              </motion.div>
            ) : (
              <div className="mb-10" />
            )}

            <motion.div
              variants={itemVariants}
              className="mb-12 w-full max-w-md rounded-2xl border border-border/70 bg-background/60 p-5 backdrop-blur-sm lg:max-w-none"
            >
              <p className="mb-5 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                Acompanhe seu pedido
              </p>
              <div className="flex items-center justify-between gap-2">
                {TIMELINE_STEPS.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index === 0;
                  const isNext = index === 1;

                  return (
                    <div key={step.key} className="flex flex-1 items-center gap-2">
                      <div className="flex flex-col items-center gap-2">
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3 + index * 0.12 }}
                          className={cn(
                            "relative flex size-11 items-center justify-center rounded-full border transition-colors",
                            isActive
                              ? "border-foreground bg-foreground text-background"
                              : isNext
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                                : "border-border bg-secondary text-muted-foreground",
                          )}
                        >
                          {isNext ? (
                            <motion.span
                              className="absolute inset-0 rounded-full border border-emerald-500/40"
                              animate={{ scale: [1, 1.25], opacity: [0.6, 0] }}
                              transition={{ duration: 1.6, repeat: Infinity }}
                              aria-hidden
                            />
                          ) : null}
                          <Icon className="size-5" />
                        </motion.div>
                        <span
                          className={cn(
                            "max-w-[5.5rem] text-center text-[10px] leading-tight font-medium",
                            isActive ? "text-foreground" : "text-muted-foreground",
                          )}
                        >
                          {step.label}
                        </span>
                      </div>

                      {index < TIMELINE_STEPS.length - 1 ? (
                        <div className="relative mb-6 h-px flex-1 overflow-hidden bg-border">
                          <motion.div
                            className="absolute inset-y-0 left-0 bg-foreground"
                            initial={{ width: "0%" }}
                            animate={{ width: index === 0 ? "100%" : "0%" }}
                            transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 }}
                className="mt-5 flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-left text-xs text-muted-foreground"
              >
                <Truck className="size-4 shrink-0 text-foreground" />
                Estamos separando suas peças. O código de rastreio será enviado assim que o pedido
                for despachado.
              </motion.div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start"
            >
              <Link
                to="/store"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
              >
                Continuar comprando
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/conta"
                className="inline-flex h-12 items-center justify-center rounded-full border border-border px-8 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Ver meus pedidos
              </Link>
            </motion.div>
          </motion.section>

          {snapshot ? (
            <CheckoutSuccessOrderCard snapshot={snapshot} orderName={orderName} />
          ) : (
            <motion.aside
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="rounded-3xl border border-dashed border-border/80 bg-secondary/20 p-8 text-center"
            >
              <Package className="mx-auto mb-4 size-10 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Resumo do pedido</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Os detalhes completos chegarão no seu e-mail em instantes.
              </p>
            </motion.aside>
          )}
        </div>
      </main>
    </div>
  );
}