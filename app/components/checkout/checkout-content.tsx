"use client";

import { Link, useFetcher } from "react-router";
import { ArrowLeft, ExternalLink, Loader2, Lock, ShieldCheck, Truck } from "lucide-react";
import Image from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type CheckoutActionData = {
  checkoutUrl?: string | null;
  error?: string;
  warning?: string | null;
};

interface CheckoutContentProps {
  shop: string | null;
  storefrontUrl: string;
}

export function CheckoutContent({ shop, storefrontUrl }: CheckoutContentProps) {
  const { user } = useAuth();
  const { items, totalPrice, removeItem } = useCart();
  const fetcher = useFetcher<CheckoutActionData>();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const isLoading = fetcher.state !== "idle";

  const unavailableItems = items.filter(
    (item) => item.availableForSale === false,
  );
  const missingVariants = items.some((item) => !item.variantId);
  const canCheckout =
    items.length > 0 &&
    !missingVariants &&
    unavailableItems.length === 0 &&
    Boolean(shop);

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) return;

    if (fetcher.data.checkoutUrl) {
      if (fetcher.data.warning) toast.message(fetcher.data.warning);
      window.location.href = fetcher.data.checkoutUrl;
      return;
    }

    if (fetcher.data.error) {
      setCheckoutError(fetcher.data.error);
      toast.error(fetcher.data.error);
    }
  }, [fetcher.state, fetcher.data]);

  const handleCheckout = () => {
    if (!canCheckout) return;

    setCheckoutError(null);
    fetcher.submit(
      {
        items: JSON.stringify({
          items: items.map((item) => ({
            variantId: item.variantId!,
            quantity: item.quantity,
          })),
          buyerEmail: user?.email,
        }),
      },
      { method: "post" },
    );
  };

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-6 py-32 text-center">
        <h1 className="text-2xl font-medium mb-3">Seu carrinho está vazio</h1>
        <p className="text-muted-foreground mb-8">
          Adicione produtos antes de finalizar a compra.
        </p>
        <Link
          to="/store"
          className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar à loja
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-12 py-32">
      <Link
        to="/store"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-10 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Continuar comprando
      </Link>

      <div className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
          Passo 2 de 3 — Revisão na ROUHI
        </p>
        <h1 className="text-3xl font-medium mb-3">Revisar pedido</h1>
        <p className="text-muted-foreground leading-relaxed">
          Você revisa o pedido aqui no site ROUHI. Na etapa final, a Shopify processa{" "}
          <strong className="text-foreground">pagamento, endereço e frete</strong> de forma
          segura.
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8 overflow-x-auto pb-1">
        <span className="px-3 py-1.5 rounded-full bg-secondary text-foreground whitespace-nowrap">
          1. Carrinho ✓
        </span>
        <span className="text-border">→</span>
        <span className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground whitespace-nowrap">
          2. Revisão
        </span>
        <span className="text-border">→</span>
        <span className="px-3 py-1.5 rounded-full bg-secondary whitespace-nowrap">
          3. Pagamento seguro
        </span>
      </div>

      {unavailableItems.length > 0 && (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Alguns itens estão esgotados ({unavailableItems.map((i) => `${i.colorName} / ${i.size}`).join(", ")}).
          Remova-os ou escolha outra variante na página do produto.
        </div>
      )}

      <div className="bg-secondary/30 border border-border rounded-xl p-6 md:p-8 space-y-6">
        <h2 className="text-lg font-medium">Itens do pedido</h2>

        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
              <div className="relative w-16 h-16 bg-secondary rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.product.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm line-clamp-1">{item.product.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.colorName} · {item.size} · Qtd {item.quantity}
                  {item.availableForSale === false && (
                    <span className="ml-2 text-destructive">· Esgotado</span>
                  )}
                </p>
                <p className="text-sm font-medium mt-1">
                  R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="text-xs text-muted-foreground hover:text-destructive self-start"
              >
                Remover
              </button>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal (estimado)</span>
            <span>R$ {totalPrice.toFixed(2).replace(".", ",")}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Frete e impostos</span>
            <span className="text-muted-foreground">Na próxima etapa</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-background border border-border">
            <Lock className="w-4 h-4 shrink-0 text-foreground" />
            Pagamento seguro Shopify
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-background border border-border">
            <Truck className="w-4 h-4 shrink-0 text-foreground" />
            Frete calculado no checkout
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-background border border-border">
            <ShieldCheck className="w-4 h-4 shrink-0 text-foreground" />
            Dados protegidos pela Shopify
          </div>
        </div>

        <Button
          type="button"
          className="w-full h-12 text-base"
          disabled={!canCheckout || isLoading}
          onClick={handleCheckout}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Preparando pagamento...
            </>
          ) : (
            <>
              Finalizar compra
              <ExternalLink className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>

        {!shop && (
          <p className="text-sm text-destructive text-center">
            Configure SHOP_STORE_DOMAIN no .env para finalizar a compra.
          </p>
        )}

        {missingVariants && (
          <p className="text-sm text-destructive text-center">
            Alguns itens não têm variante Shopify. Remova e adicione novamente pela página do produto.
          </p>
        )}

        {checkoutError && (
          <p className="text-sm text-destructive text-center">{checkoutError}</p>
        )}

        {user?.email ? (
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            Usaremos o e-mail <strong className="text-foreground">{user.email}</strong> no
            pagamento. Se você já comprou na Shopify com esse e-mail, o checkout pode reconhecer
            sua conta.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            <Link to="/login" className="underline hover:text-foreground">
              Entre na sua conta
            </Link>{" "}
            antes de pagar para pré-preencher o e-mail no checkout seguro da Shopify.
          </p>
        )}

        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          No admin Shopify, o logo do checkout deve apontar para{" "}
          <a
            href={storefrontUrl}
            className="font-medium text-foreground underline underline-offset-2"
            target="_blank"
            rel="noreferrer"
          >
            {storefrontUrl}
          </a>
          .
        </p>
      </div>
    </div>
  );
}