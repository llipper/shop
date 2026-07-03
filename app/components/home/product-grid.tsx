"use client";

import { ProductCard } from "./product-card";
import { Product } from "@/types/product";
import { motion, Variants } from "framer-motion";

interface ProductGridProps {
  products: Product[];
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12 px-12 pb-24"
    >
      {products.map((product) => (
        <motion.div key={product.id} variants={item}>
           <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
}
