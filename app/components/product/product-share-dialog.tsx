"use client";

import type { Product } from "@/types/product";
import Image from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/format";
import {
  getProductShareDescription,
  getProductShareUrl,
} from "@/lib/share-url";
import { Check, Copy, Share2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface ProductShareDialogProps {
  product: Product;
  shareImage: string;
  sharePrice: number;
  selectedColor?: string;
  selectedSize?: string;
}

export function ProductShareDialog({
  product,
  shareImage,
  sharePrice,
  selectedColor,
  selectedSize,
}: ProductShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const shareUrl = useMemo(
    () =>
      getProductShareUrl(product.handle, undefined, {
        cor: selectedColor,
        tamanho: selectedSize,
      }),
    [product.handle, selectedColor, selectedSize],
  );

  const priceLabel = formatPrice(sharePrice, product.currencyCode);
  const shareDescription = getProductShareDescription(
    product.title,
    product.category,
    priceLabel,
  );
  const shareHost = useMemo(() => {
    try {
      return new URL(shareUrl).host;
    } catch {
      return "roccius.com";
    }
  }, [shareUrl]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copiado");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar o link");
    }
  }

  async function handleNativeShare() {
    if (!navigator.share) {
      await handleCopy();
      return;
    }

    try {
      await navigator.share({
        title: `${product.title} | ROCCIUS`,
        text: shareDescription,
        url: shareUrl,
      });
      setOpen(false);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("Não foi possível compartilhar");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex h-[52px] w-[52px] items-center justify-center rounded-xl border border-border text-muted-foreground transition-all hover:border-foreground hover:text-foreground"
          aria-label="Compartilhar produto"
        >
          <Share2 className="h-5 w-5" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-md gap-0 overflow-hidden p-0">
        <DialogHeader className="space-y-1 border-b border-border px-6 py-5 text-left">
          <DialogTitle>Compartilhar produto</DialogTitle>
          <DialogDescription>
            Veja como o link aparece para quem receber.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 py-5">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="relative aspect-[16/9] w-full bg-secondary">
              <Image
                src={shareImage}
                alt={product.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-2 p-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {shareHost}
              </p>
              <p className="text-base font-medium leading-snug text-foreground">
                {product.title}
              </p>
              <p className="text-sm text-muted-foreground">
                {priceLabel}
                {selectedColor ? ` · ${selectedColor}` : ""}
                {selectedSize ? ` · ${selectedSize}` : ""}
              </p>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {shareDescription}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Link do produto
            </p>
            <p className="break-all text-sm text-foreground">{shareUrl}</p>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleCopy}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copiado" : "Copiar link"}
            </Button>
            <Button type="button" className="flex-1 gap-2" onClick={handleNativeShare}>
              <Share2 className="h-4 w-4" />
              Compartilhar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}