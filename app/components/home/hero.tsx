"use client";

import { Link } from "react-router";
import Image from "@/components/ui/image";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative w-full h-[600px]  flex items-center justify-center overflow-hidden">
      {/* bg-[#C5A898] */}
      {/* Imagem Real */}
      <motion.div 
        initial={{ scale: 1.05, opacity: 6 }}
        animate={{ scale: 1, opacity: 9 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 pointer-events-none"
      >
        <Image 
          src="/banner.png" 
          alt="Banner Principal"
          fill
          className="object-cover"
          priority 
        />
      </motion.div>
      
      {/* The actual text overlay */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="absolute bottom-12 left-12 text-white"
      >
        <h2 className="text-2xl font-semibold mb-2">Novas Camisetas Essenciais</h2>
        <Link to="/store" className="inline-flex items-center text-sm font-medium hover:underline group">
          Saiba mais
          <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
        </Link>
      </motion.div>
    </section>
  );
}
