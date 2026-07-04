"use client";

import { Link, useLocation } from "react-router";
import { ArrowLeft, Home, Search } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";

export function NotFoundContent() {
  const { pathname } = useLocation();

  return (
    <div className="flex flex-col items-center justify-center px-2 py-8 text-center md:py-12">
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-muted-foreground">
        Erro 404
      </p>

      <h1 className="mb-4 text-6xl font-medium tracking-tight text-foreground md:text-7xl">
        404
      </h1>

      <h2 className="mb-3 text-xl font-medium text-foreground md:text-2xl">
        Página não encontrada
      </h2>

      <p className="mb-2 max-w-md text-sm text-muted-foreground leading-relaxed md:text-base">
        A página que você procura não existe, foi movida ou o endereço está incorreto.
      </p>

      {pathname !== "/" && (
        <p className="mb-8 max-w-md break-all text-sm text-muted-foreground">
          Caminho acessado:{" "}
          <span className="font-medium text-foreground">{pathname}</span>
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button asChild size="lg" className="min-w-44 gap-2">
          <Link to="/store">
            <Home className="h-4 w-4" />
            Ir para a loja
          </Link>
        </Button>

        <Button asChild variant="outline" size="lg" className="min-w-44 gap-2">
          <Link to="/produtos">
            <Search className="h-4 w-4" />
            Ver produtos
          </Link>
        </Button>
      </div>

      <button
        type="button"
        onClick={() => window.history.back()}
        className="mt-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar à página anterior
      </button>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <Header />
      <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center px-6 pb-24 pt-32">
        <NotFoundContent />
      </div>
    </main>
  );
}