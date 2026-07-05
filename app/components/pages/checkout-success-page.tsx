"use client";

import { useEffect } from "react";
import { Link } from "react-router";
import { CheckCircle2, Package, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/cart-context";

type CheckoutSuccessPageProps = {
  orderName?: string | null;
  orderId?: string | null;
  email?: string | null;
};

export function CheckoutSuccessPage({
  orderName,
  orderId,
  email,
}: CheckoutSuccessPageProps) {
  const { clearCart } = useCart();

  // Run once on mount — do not depend on clearCart identity (avoids infinite re-render loop).
  useEffect(() => {
    clearCart();
  }, []);

  const hasOrderReference = Boolean(orderName || orderId);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b border-border px-6 md:px-12 py-5 flex items-center justify-between">
        <Link to="/store" className="text-2xl font-semibold tracking-widest uppercase text-foreground">
          ROUHI
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-8">
          <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
        </div>

        <h1 className="text-3xl md:text-4xl font-medium text-foreground mb-3">Pedido confirmado!</h1>
        <p className="text-muted-foreground mb-2 max-w-md">
          {hasOrderReference
            ? "Recebemos seu pedido com sucesso. Você também receberá a confirmação por e-mail."
            : "Seu pagamento foi processado com sucesso. Em instantes você receberá a confirmação por e-mail."}
        </p>

        {hasOrderReference && (
          <p className="text-sm text-muted-foreground mb-10">
            Referência:{" "}
            <span className="font-medium text-foreground">
              {orderName ?? orderId}
            </span>
          </p>
        )}

        {email && (
          <p className="text-sm text-muted-foreground mb-10">
            Confirmação enviada para <span className="font-medium text-foreground">{email}</span>
          </p>
        )}

        <div className="flex items-center gap-3 mb-12">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">Pedido</span>
          </div>
          <div className="h-px w-16 bg-border" />
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center">
              <Package className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">Preparando</span>
          </div>
          <div className="h-px w-16 bg-border" />
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">Entregue</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/store"
            className="px-8 py-4 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-all"
          >
            Continuar comprando
          </Link>
          <Link
            to="/conta"
            className="px-8 py-4 border border-border rounded-md font-medium hover:bg-secondary transition-colors text-foreground"
          >
            Ver meus pedidos
          </Link>
        </div>
      </div>
    </div>
  );
}