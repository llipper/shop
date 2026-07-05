"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Product } from "@/types/product";

export interface CartItem {
  id: string;
  product: Product;
  variantId?: string;
  size: string;
  colorName: string;
  image: string;
  price: number;
  quantity: number;
  availableForSale?: boolean;
}

interface CartContextType {
  items: CartItem[];
  addItem: (
    product: Product,
    size: string,
    colorName: string,
    image: string,
    variantId?: string,
    price?: number,
    availableForSale?: boolean,
  ) => void;
  removeItem: (id: string) => void;
  updateItemQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  totalItems: number;
  totalPrice: number;
}

const STORAGE_KEY = "rouhi-cart";

const CartContext = createContext<CartContextType | undefined>(undefined);

function isValidCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as CartItem;
  return (
    typeof item.id === "string" &&
    typeof item.size === "string" &&
    typeof item.colorName === "string" &&
    typeof item.image === "string" &&
    typeof item.price === "number" &&
    typeof item.quantity === "number" &&
    item.quantity > 0 &&
    item.product != null &&
    typeof item.product.id === "string" &&
    typeof item.product.title === "string"
  );
}

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isValidCartItem);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

function persistCart(items: CartItem[]) {
  if (typeof window === "undefined") return;

  if (items.length === 0) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartReady, setIsCartReady] = useState(false);

  useEffect(() => {
    setItems(readStoredCart());
    setIsCartReady(true);
  }, []);

  useEffect(() => {
    if (!isCartReady) return;
    persistCart(items);
  }, [items, isCartReady]);

  const addItem = (
    product: Product,
    size: string,
    colorName: string,
    image: string,
    variantId?: string,
    price?: number,
    availableForSale?: boolean,
  ) => {
    const itemId = variantId ?? `${product.id}-${size}-${colorName}`;
    const unitPrice = price ?? product.price;

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === itemId);

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [
        ...currentItems,
        {
          id: itemId,
          product,
          variantId,
          size,
          colorName,
          image,
          price: unitPrice,
          quantity: 1,
          availableForSale,
        },
      ];
    });

    setIsCartOpen(true);
  };

  const removeItem = (id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  const updateItemQuantity = (id: string, quantity: number) => {
    setItems((currentItems) => {
      if (quantity <= 0) {
        return currentItems.filter((item) => item.id !== id);
      }

      return currentItems.map((item) =>
        item.id === id ? { ...item, quantity } : item,
      );
    });
  };

  const clearCart = () => {
    setItems([]);
    setIsCartOpen(false);
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateItemQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}