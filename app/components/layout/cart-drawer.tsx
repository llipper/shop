"use client";

import { useCart } from "@/contexts/cart-context";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { X, Trash2 } from "lucide-react";
import Image from "@/components/ui/image";
import { Link } from "react-router";

export function CartDrawer() {
  const { isCartOpen, setIsCartOpen, items, removeItem, totalPrice } = useCart();

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 border-l border-border bg-background">
        <SheetHeader className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-medium text-foreground">Seu Carrinho</SheetTitle>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                <svg className="w-6 h-6 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p>Seu carrinho está vazio.</p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="text-primary underline mt-2"
              >
                Continuar comprando
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 group">
                  <div className="relative w-24 h-24 bg-secondary rounded-md overflow-hidden flex-shrink-0">
                    <Image 
                      src={item.image} 
                      alt={item.product.title} 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-foreground line-clamp-1">{item.product.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Cor: {item.colorName} | Tamanho: {item.size}
                        </p>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                        aria-label="Remover item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex justify-between items-end mt-2">
                      <span className="text-sm text-muted-foreground">Qtd: {item.quantity}</span>
                      <span className="font-medium text-foreground">
                        R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-border bg-secondary/30">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-medium text-foreground">Subtotal</span>
              <span className="text-xl font-medium text-foreground">
                R$ {totalPrice.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <Link
              to="/store/checkout"
              onClick={() => setIsCartOpen(false)}
              className="w-full bg-primary text-primary-foreground py-4 rounded-md font-medium hover:bg-primary/90 transition-all active:scale-[0.98] flex items-center justify-center"
            >
              Revisar pedido
            </Link>
            <p className="text-center text-xs text-muted-foreground mt-4">
              Frete e impostos calculados no checkout.
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
