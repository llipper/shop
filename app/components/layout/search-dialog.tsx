"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { buildProductsHref } from "@/lib/product-filters";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    onOpenChange(false);
    navigate(buildProductsHref(undefined, undefined, undefined, trimmed));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Buscar produtos</DialogTitle>
          <DialogDescription>
            Pesquise por nome, categoria, cor ou tipo de produto.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ex.: camiseta, masculino, bordô..."
              className="w-full rounded-md border border-border bg-background py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              autoFocus
            />
          </div>

          <Button type="submit" disabled={!query.trim()} className="w-full">
            Buscar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}