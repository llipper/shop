"use client";

import Image from "@/components/ui/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface ProductGalleryProps {
  title: string;
  images: string[];
  activeImage: string;
  onImageSelect: (image: string) => void;
}

export function ProductGallery({
  title,
  images,
  activeImage,
  onImageSelect,
}: ProductGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const activeIndex = Math.max(0, images.indexOf(activeImage));

  const goTo = useCallback(
    (direction: -1 | 1) => {
      const next = (activeIndex + direction + images.length) % images.length;
      onImageSelect(images[next]);
    },
    [activeIndex, images, onImageSelect],
  );

  useEffect(() => {
    if (!lightboxOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") goTo(-1);
      if (event.key === "ArrowRight") goTo(1);
      if (event.key === "Escape") setLightboxOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, goTo]);

  return (
    <>
      <div className="flex flex-col gap-5 lg:flex-row lg:gap-6">
        {images.length > 1 && (
          <div className="order-2 flex gap-3 overflow-x-auto pb-1 lg:order-1 lg:w-24 lg:flex-col lg:overflow-visible">
            {images.map((img, idx) => (
              <button
                key={`${img}-${idx}`}
                type="button"
                onClick={() => onImageSelect(img)}
                className={cn(
                  "relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary transition-all lg:h-28 lg:w-full",
                  activeImage === img
                    ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                    : "opacity-60 hover:opacity-100",
                )}
              >
                <Image src={img} alt={`${title} ${idx + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="relative order-1 flex-1 lg:order-2">
          <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-secondary">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0"
              >
                <Image
                  src={activeImage}
                  alt={title}
                  fill
                  className="object-cover"
                  priority
                />
              </motion.div>
            </AnimatePresence>

            <div className="absolute right-4 top-4 flex items-center gap-2">
              <span className="rounded-full bg-background/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-foreground backdrop-blur-md">
                {activeIndex + 1} / {images.length}
              </span>
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground backdrop-blur-md transition-colors hover:bg-background"
                aria-label="Ver imagem em tela cheia"
              >
                <Expand className="h-4 w-4" />
              </button>
            </div>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goTo(-1)}
                  className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground opacity-100 backdrop-blur-md transition-opacity md:opacity-0 md:group-hover:opacity-100"
                  aria-label="Imagem anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(1)}
                  className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground opacity-100 backdrop-blur-md transition-opacity md:opacity-0 md:group-hover:opacity-100"
                  aria-label="Próxima imagem"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          showCloseButton={false}
          className="fixed inset-0 flex h-[100dvh] max-h-[100dvh] w-[100vw] max-w-[100vw] translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 bg-black/95 p-0 sm:max-w-[100vw]"
        >
          <DialogTitle className="sr-only">{title} — visualização em tela cheia</DialogTitle>

          <div className="flex items-center justify-between px-4 py-4 text-white">
            <span className="text-xs uppercase tracking-[0.2em] text-white/70">
              {activeIndex + 1} / {images.length}
            </span>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center px-4 pb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImage}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative h-full w-full max-w-5xl"
              >
                <Image
                  src={activeImage}
                  alt={title}
                  fill
                  className="object-contain"
                />
              </motion.div>
            </AnimatePresence>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goTo(-1)}
                  className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                  aria-label="Imagem anterior"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(1)}
                  className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                  aria-label="Próxima imagem"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto px-4 pb-6">
              {images.map((img, idx) => (
                <button
                  key={`lightbox-${img}-${idx}`}
                  type="button"
                  onClick={() => onImageSelect(img)}
                  className={cn(
                    "relative h-16 w-14 shrink-0 overflow-hidden rounded-md",
                    activeImage === img ? "ring-2 ring-white" : "opacity-50 hover:opacity-100",
                  )}
                >
                  <Image src={img} alt={`${title} ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}