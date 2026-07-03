import type { CartItem } from "@/contexts/cart-context";

export function variantIdToNumeric(variantId: string): string | null {
  const match = variantId.match(/ProductVariant\/(\d+)/);
  return match?.[1] ?? null;
}

function buildCartLines(items: CartItem[]): string[] {
  return items
    .map((item) => {
      if (!item.variantId) return null;
      const id = variantIdToNumeric(item.variantId);
      if (!id) return null;
      return `${id}:${item.quantity}`;
    })
    .filter((line): line is string => Boolean(line));
}

/** Abre o carrinho na loja Shopify com os itens preenchidos. */
export function buildShopifyCartUrl(shop: string, items: CartItem[]): string | null {
  const lines = buildCartLines(items);
  if (lines.length === 0) return null;
  return `https://${shop}/cart/${lines.join(",")}`;
}

/** Vai direto para o checkout hospedado da Shopify (pagamento + frete). */
export function buildShopifyCheckoutUrl(shop: string, items: CartItem[]): string | null {
  const lines = buildCartLines(items);
  if (lines.length === 0) return null;
  return `https://${shop}/cart/${lines.join(",")}?checkout`;
}