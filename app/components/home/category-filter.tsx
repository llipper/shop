"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { productCategories } from "@/lib/product-filters";

interface CategoryFilterProps {
  active: string;
  onChange: (category: string) => void;
}

export function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  return (
    <div className="flex items-center justify-center gap-12 py-12">
      {productCategories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onChange(category)}
          className={cn(
            "relative text-sm font-medium pb-1 transition-colors",
            active === category
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {category}
          {active === category && (
            <motion.div
              layoutId="active-category"
              className="absolute left-0 right-0 bottom-0 h-[2px] bg-foreground"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}