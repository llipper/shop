"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const categories = ["Masculino", "Feminino", "Objetos"];

export function CategoryFilter() {
  const [active, setActive] = useState("Masculino");

  return (
    <div className="flex items-center justify-center gap-12 py-12">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => setActive(category)}
          className={cn(
            "relative text-sm font-medium pb-1 transition-colors",
            active === category
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
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
