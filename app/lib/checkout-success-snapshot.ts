import type { CartItem } from "@/contexts/cart-context";
import { calculateShipping } from "@/lib/shipping";

const STORAGE_KEY = "roccius-checkout-success";

export type CheckoutSuccessSnapshot = {
  items: Array<{
    image: string;
    title: string;
    category?: string;
    colorName: string;
    size: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shippingCost: number;
  total: number;
  itemCount: number;
  savedAt: number;
};

export function buildCheckoutSuccessSnapshot(
  items: CartItem[],
): CheckoutSuccessSnapshot {
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const shippingCost = calculateShipping(subtotal);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return {
    items: items.map((item) => ({
      image: item.image,
      title: item.product.title,
      category: item.product.category,
      colorName: item.colorName,
      size: item.size,
      quantity: item.quantity,
      price: item.price,
    })),
    subtotal,
    shippingCost,
    total: subtotal + shippingCost,
    itemCount,
    savedAt: Date.now(),
  };
}

export function saveCheckoutSuccessSnapshot(snapshot: CheckoutSuccessSnapshot) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

export function readCheckoutSuccessSnapshot(): CheckoutSuccessSnapshot | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CheckoutSuccessSnapshot;
    if (Date.now() - parsed.savedAt > 60 * 60 * 1000) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearCheckoutSuccessSnapshot() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}