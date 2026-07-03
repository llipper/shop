"use client";

import { useState } from "react";
import { Search, CheckCircle2, Box } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrackingStep {
  title: string;
  description: string;
  date: string;
}

const mockTrackingResults: Record<string, TrackingStep[]> = {
  PAP123456789BR: [
    { title: "Objeto entregue ao destinatário", description: "São Paulo - SP", date: "Hoje às 14:32" },
    { title: "Objeto saiu para entrega", description: "São Paulo - SP", date: "Hoje às 08:15" },
    { title: "Objeto encaminhado", description: "Cajamar - SP para São Paulo", date: "Ontem às 22:10" },
    { title: "Objeto postado", description: "São Paulo - SP", date: "2 dias atrás às 10:00" },
  ],
  PAP987654321BR: [
    { title: "Objeto saiu para entrega", description: "Rio de Janeiro - RJ", date: "Hoje às 09:20" },
    { title: "Objeto encaminhado", description: "Cajamar - SP para Rio de Janeiro", date: "Ontem às 18:45" },
    { title: "Objeto postado", description: "São Paulo - SP", date: "Ontem às 11:30" },
  ],
};

export function TrackingPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackingStep[] | null>(null);
  const [error, setError] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!code) return;

    setLoading(true);
    setError(false);
    setResult(null);

    setTimeout(() => {
      setLoading(false);
      const trackingResult = mockTrackingResults[code.toUpperCase().trim()];
      if (trackingResult) {
        setResult(trackingResult);
      } else {
        setError(true);
      }
    }, 1000);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-medium text-foreground mb-2">Rastrear Pedido</h1>
        <p className="text-muted-foreground">Insira seu código de rastreamento para acompanhar a sua entrega.</p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Box className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full border border-border rounded-md pl-10 pr-4 py-3 bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            placeholder="Ex: PAP123456789BR"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-primary-foreground py-3 px-6 rounded-md text-sm font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-75"
        >
          <Search className="w-4 h-4" /> Buscar
        </button>
      </form>

      {!result && !error && !loading && (
        <div className="bg-secondary/40 border border-border rounded-lg p-4 text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Códigos de teste:</p>
          <ul className="list-disc pl-4 mt-1.5 space-y-1 font-mono">
            <li>PAP123456789BR</li>
            <li>PAP987654321BR</li>
          </ul>
        </div>
      )}

      {result && (
        <div className="border border-border rounded-lg p-6 space-y-8 bg-secondary/10">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <span className="text-sm font-medium text-foreground">Código: {code.toUpperCase()}</span>
            <span className="text-xs text-green-500 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Em andamento
            </span>
          </div>

          <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
            {result.map((step, idx) => (
              <div key={idx} className="relative flex gap-4">
                <div
                  className={cn(
                    "absolute -left-[20px] top-1 w-3 h-3 rounded-full border-2 bg-background",
                    idx === 0 ? "border-primary scale-125" : "border-muted-foreground/60",
                  )}
                />
                <div>
                  <h4 className={cn("text-sm font-medium", idx === 0 ? "text-foreground" : "text-muted-foreground")}>
                    {step.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                  <span className="text-[10px] text-muted-foreground/80 block mt-1">{step.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 border border-red-200 bg-red-500/10 text-red-500 text-sm rounded-md">
          Nenhuma encomenda encontrada com o código informado.
        </div>
      )}
    </div>
  );
}