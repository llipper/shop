"use client";

import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Search, CheckCircle2, Box, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

function getCorreiosTrackingUrl(code: string) {
  return `https://rastreamento.correios.com.br/app/index.php?objetos=${encodeURIComponent(code)}`;
}

function isLikelyTrackingCode(code: string) {
  const normalized = code.trim().toUpperCase();
  return /^[A-Z]{2}\d{9}[A-Z]{2}$/.test(normalized) || /^\d{10,14}$/.test(normalized);
}

export function TrackingPage() {
  const { isAuthenticated, orders, isLoading } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const trackingFromOrders = useMemo(
    () =>
      orders.flatMap((order) =>
        order.tracking.map((item) => ({
          orderName: order.name,
          statusUrl: order.statusUrl,
          ...item,
        })),
      ),
    [orders],
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const normalized = code.trim().toUpperCase();
    setError(null);

    if (!normalized) {
      setError("Informe um código de rastreio.");
      return;
    }

    if (!isLikelyTrackingCode(normalized)) {
      setError("Código inválido. Use o formato dos Correios (ex: AA123456789BR).");
      return;
    }

    window.open(getCorreiosTrackingUrl(normalized), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-medium text-foreground mb-2">Rastrear Pedido</h1>
        <p className="text-muted-foreground">
          Consulte o rastreio pelos Correios ou veja seus pedidos na conta ROUHI.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Box className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full border border-border rounded-md pl-10 pr-4 py-3 bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            placeholder="Ex: AA123456789BR"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-primary text-primary-foreground py-3 px-6 rounded-md text-sm font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" /> Consultar nos Correios
        </button>
      </form>

      {error && (
        <div className="p-4 border border-red-200 bg-red-500/10 text-red-500 text-sm rounded-md">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-border bg-secondary/20 p-5 text-sm text-muted-foreground">
        O código de rastreio é enviado por e-mail quando o pedido for despachado. Você também
        pode acompanhar pelo status do pedido na sua conta.
      </div>

      {!isLoading && isAuthenticated && trackingFromOrders.length > 0 && (
        <div className="border border-border rounded-lg p-6 space-y-4 bg-secondary/10">
          <h2 className="text-lg font-medium text-foreground">Seus rastreios recentes</h2>
          {trackingFromOrders.map((item, index) => (
            <div
              key={`${item.orderName}-${item.number}-${index}`}
              className="flex flex-col gap-3 border border-border rounded-lg p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{item.orderName}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {item.company}: <span className="font-mono">{item.number}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href={item.url ?? getCorreiosTrackingUrl(item.number)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  Rastrear <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href={item.statusUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  Status do pedido
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && !isAuthenticated && (
        <div className="border border-border rounded-lg p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Tem conta ROUHI?</p>
              <p className="text-sm text-muted-foreground">
                Entre para ver pedidos e rastreios sincronizados com a Shopify.
              </p>
            </div>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Entrar na conta
          </Link>
        </div>
      )}
    </div>
  );
}