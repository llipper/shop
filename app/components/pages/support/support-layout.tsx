"use client";

import { Link, useLocation } from "react-router";
import { Header } from "@/components/layout/header";
import { cn } from "@/lib/utils";
import {
  HelpCircle,
  Truck,
  RefreshCw,
  MapPin,
  Mail,
  ChevronRight,
} from "lucide-react";

const sidebarLinks = [
  { label: "Central de Ajuda", href: "/suporte", icon: HelpCircle },
  { label: "Perguntas Frequentes (FAQ)", href: "/suporte/faq", icon: HelpCircle },
  { label: "Envio e Prazos", href: "/suporte/envio-e-prazos", icon: Truck },
  { label: "Trocas e Devoluções", href: "/suporte/trocas-e-devolucoes", icon: RefreshCw },
  { label: "Rastrear Pedido", href: "/suporte/rastreio", icon: MapPin },
  { label: "Fale Conosco", href: "/suporte/contato", icon: Mail },
];

export function SupportLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 pt-32 pb-24 flex flex-col lg:flex-row gap-12">
        <aside className="w-full lg:w-[280px] shrink-0">
          <div className="lg:sticky lg:top-28 space-y-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 mb-4">
              Suporte & Atendimento
            </h2>
            <nav className="flex flex-col gap-1">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors justify-between",
                      isActive
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/40",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="flex-1 min-w-0 bg-background border border-border rounded-xl p-6 md:p-10 shadow-xs">
          {children}
        </main>
      </div>
    </div>
  );
}