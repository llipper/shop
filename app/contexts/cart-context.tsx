"use client";

import { createContext, useContext, useState, ReactNode } from "react";
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
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

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
    setItems((currentItems) => currentItems.filter(item => item.id !== id));
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, isCartOpen, setIsCartOpen, totalItems, totalPrice }}>
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
