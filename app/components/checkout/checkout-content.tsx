"use client";

import { Link } from "react-router";
import { ArrowLeft, ExternalLink, Lock, ShieldCheck, Truck } from "lucide-react";
import Image from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { buildShopifyCheckoutUrl } from "@/lib/shopify-cart";

interface CheckoutContentProps {
  shop: string | null;
}

export function CheckoutContent({ shop }: CheckoutContentProps) {
  const { items, totalPrice, removeItem } = useCart();
  const checkoutUrl = shop ? buildShopifyCheckoutUrl(shop, items) : null;
  const missingVariants = items.some((item) => !item.variantId);

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
          Passo 2 de 3 — Revisão
        </p>
        <h1 className="text-3xl font-medium mb-3">Revisar pedido</h1>
        <p className="text-muted-foreground leading-relaxed">
          Esta página só confere os itens do seu carrinho. O{" "}
          <strong className="text-foreground">pagamento, endereço e frete</strong> são
          preenchidos no checkout oficial da Shopify
          {shop ? (
            <>
              {" "}
              (<span className="text-foreground">{shop}</span>)
            </>
          ) : null}
          .
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
          3. Pagamento na Shopify
        </span>
      </div>

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

        {checkoutUrl ? (
          <Button asChild className="w-full h-12 text-base">
            <a href={checkoutUrl}>
              Continuar para pagamento na Shopify
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </Button>
        ) : (
          <p className="text-sm text-destructive text-center">
            {missingVariants
              ? "Alguns itens não têm variante Shopify. Remova e adicione novamente pela página do produto."
              : "Loja não configurada. Rode shopify app dev com o app instalado na loja."}
          </p>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Você será redirecionado para{" "}
          <strong className="text-foreground">{shop ?? "sua loja Shopify"}</strong> para
          informar endereço, escolher frete e pagar.
        </p>
      </div>
    </div>
  );
}