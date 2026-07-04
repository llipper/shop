"use client";

import * as React from "react";
import { useLoaderData, useNavigate, useSearchParams } from "react-router";
import { Header } from "@/components/layout/header";
import { ProductCard } from "@/components/home/product-card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  defaultProductSizes,
  filterColorSwatches,
  filterProducts,
  productCategories,
  productSubcategories,
} from "@/lib/product-filters";
import type { Product } from "@/types/product";

export type ProductsPageLoaderData = {
  catalog: Product[];
  shop: string | null;
  error: string | null;
};

function getCatalogPriceBounds(catalog: Product[]) {
  if (catalog.length === 0) {
    return { min: 30, max: 150 };
  }

  const prices = catalog.map((product) => product.maxPrice ?? product.price);
  const min = Math.floor(Math.min(...prices));
  const max = Math.ceil(Math.max(...prices));

  return {
    min: Math.max(0, min),
    max: Math.max(max, 150),
  };
}

export function ProductsPage() {
  const { catalog = [], error } = useLoaderData<ProductsPageLoaderData>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const paramCategory = searchParams.get("categoria") || "";
  const paramSubcategory = searchParams.get("subcategoria") || "";
  const paramTag = searchParams.get("tag") || "";

  const priceBounds = React.useMemo(
    () => getCatalogPriceBounds(catalog),
    [catalog],
  );

  const [selectedCategory, setSelectedCategory] = React.useState(paramCategory);
  const [selectedSubcategory, setSelectedSubcategory] = React.useState(paramSubcategory);
  const [selectedSizes, setSelectedSizes] = React.useState<string[]>([]);
  const [selectedColors, setSelectedColors] = React.useState<string[]>([]);
  const [priceRange, setPriceRange] = React.useState<number[]>([priceBounds.max]);

  React.useEffect(() => {
    setSelectedCategory(paramCategory);
    setSelectedSubcategory(paramSubcategory);
  }, [paramCategory, paramSubcategory]);

  React.useEffect(() => {
    setPriceRange([priceBounds.max]);
  }, [priceBounds.max]);

  const filteredProducts = React.useMemo(() => {
    const urlFiltered = filterProducts(catalog, {
      categoria: selectedCategory || undefined,
      subcategoria: selectedSubcategory || undefined,
      tag: paramTag || undefined,
    });

    return urlFiltered.filter((product) => {
      if (selectedSizes.length > 0) {
        const productSizes = product.sizes ?? defaultProductSizes;
        if (!selectedSizes.some((size) => productSizes.includes(size))) {
          return false;
        }
      }

      if (selectedColors.length > 0) {
        const matchesColor =
          selectedColors.includes(product.color) ||
          product.variants?.some((variant) => selectedColors.includes(variant.color));

        if (!matchesColor) return false;
      }

      if (product.price > priceRange[0]) {
        return false;
      }

      return true;
    });
  }, [
    catalog,
    selectedCategory,
    selectedSubcategory,
    paramTag,
    selectedSizes,
    selectedColors,
    priceRange,
  ]);

  function pushFilters(category: string, subcategory: string, tag = paramTag) {
    if (!category && !subcategory && !tag) {
      navigate("/produtos");
      return;
    }

    const params = new URLSearchParams();
    if (category) params.set("categoria", category);
    if (subcategory) params.set("subcategoria", subcategory);
    if (tag) params.set("tag", tag);
    navigate(`/produtos?${params.toString()}`);
  }

  function handleSizeToggle(size: string) {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((value) => value !== size) : [...prev, size],
    );
  }

  function handleColorToggle(colorName: string) {
    setSelectedColors((prev) =>
      prev.includes(colorName)
        ? prev.filter((value) => value !== colorName)
        : [...prev, colorName],
    );
  }

  function clearAllFilters() {
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange([priceBounds.max]);
    navigate("/produtos");
  }

  const pageTitle = paramTag === "novo"
    ? "Novidades"
    : paramTag === "sale"
      ? "Sale"
      : selectedCategory || "Todos os Produtos";

  const FilterSidebarContent = () => (
    <div className="space-y-8">
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Categorias
        </h3>
        <div className="flex flex-col gap-2">
          {productCategories.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => {
                  const newCategory = isSelected ? "" : category;
                  setSelectedCategory(newCategory);
                  setSelectedSubcategory("");
                  pushFilters(newCategory, "");
                }}
                className={cn(
                  "text-left text-sm py-1.5 transition-colors font-medium flex items-center justify-between",
                  isSelected
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {category}
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
              </button>
            );
          })}
        </div>
      </div>

      {selectedCategory && productSubcategories[selectedCategory] && (
        <div className="space-y-3 border-t border-border pt-6 animate-in fade-in duration-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Subcategorias
          </h3>
          <div className="flex flex-col gap-2">
            {productSubcategories[selectedCategory].map((subcategory) => {
              const isSelected = selectedSubcategory === subcategory;
              return (
                <button
                  key={subcategory}
                  type="button"
                  onClick={() => {
                    const newSubcategory = isSelected ? "" : subcategory;
                    setSelectedSubcategory(newSubcategory);
                    pushFilters(selectedCategory, newSubcategory);
                  }}
                  className={cn(
                    "text-left text-sm py-1.5 transition-colors font-medium flex items-center justify-between",
                    isSelected
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {subcategory}
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-3 border-t border-border pt-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Tamanhos
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {defaultProductSizes.map((size) => {
            const isSelected = selectedSizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => handleSizeToggle(size)}
                className={cn(
                  "h-10 rounded border text-xs font-semibold flex items-center justify-center transition-all",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground font-bold shadow-xs"
                    : "border-border text-muted-foreground hover:border-foreground",
                )}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 border-t border-border pt-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Cores
        </h3>
        <div className="flex flex-wrap gap-2.5">
          {filterColorSwatches.map((color) => {
            const isSelected = selectedColors.includes(color.name);
            return (
              <button
                key={color.name}
                type="button"
                onClick={() => handleColorToggle(color.name)}
                title={color.name}
                className={cn(
                  "size-8 rounded-full border border-border flex items-center justify-center transition-all",
                  isSelected
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "hover:scale-110",
                )}
              >
                <span
                  className="size-6 rounded-full border border-black/10"
                  style={{ backgroundColor: color.hex }}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4 border-t border-border pt-6">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <span>Preço Máximo</span>
          <span className="text-foreground normal-case font-semibold">
            R$ {priceRange[0]}
          </span>
        </div>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={priceBounds.max}
          min={priceBounds.min}
          step={5}
          className="py-2"
        />
      </div>

      {(selectedCategory ||
        selectedSubcategory ||
        selectedSizes.length > 0 ||
        selectedColors.length > 0 ||
        priceRange[0] < priceBounds.max) && (
        <Button
          onClick={clearAllFilters}
          variant="outline"
          size="sm"
          className="w-full gap-2 text-xs"
        >
          <RotateCcw className="size-3.5" /> Limpar Filtros
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="max-w-[1440px] w-full mx-auto px-6 md:px-12 pt-32 pb-24 flex-1 flex flex-col">
        {error && (
          <p className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex items-end justify-between border-b border-border pb-5 mb-8">
          <div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Coleção
            </span>
            <h1 className="text-4xl font-medium text-foreground mt-1">{pageTitle}</h1>
            {selectedSubcategory && (
              <span className="text-xs text-muted-foreground font-medium block mt-1">
                Subcategoria: {selectedSubcategory}
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "produto encontrado" : "produtos encontrados"}
          </span>
        </div>

        <div className="flex items-center justify-between lg:hidden mb-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 text-xs font-medium">
                <SlidersHorizontal className="size-4" /> Filtrar e Ordenar
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] overflow-y-auto bg-background p-6">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-left text-lg font-bold">Filtros</SheetTitle>
              </SheetHeader>
              <FilterSidebarContent />
            </SheetContent>
          </Sheet>
          <span className="text-xs text-muted-foreground font-medium">
            {filteredProducts.length} item(s)
          </span>
        </div>

        <div className="flex-1 flex gap-12">
          <aside className="hidden lg:block w-[240px] shrink-0 border-r border-border/60 pr-8 space-y-8 h-fit sticky top-28">
            <FilterSidebarContent />
          </aside>

          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-lg font-medium text-foreground mb-1">
                  Nenhum produto encontrado
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Tente mudar seus filtros ou buscar por outra opção.
                </p>
                <Button onClick={clearAllFilters} variant="outline" size="sm" className="gap-2">
                  <RotateCcw className="size-4" /> Resetar Filtros
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-8 gap-y-12">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}