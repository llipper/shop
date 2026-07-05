"use client";

import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, Loader2, QrCode } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import {
  buildCheckoutSuccessSnapshot,
  saveCheckoutSuccessSnapshot,
} from "@/lib/checkout-success-snapshot";
import { cn } from "@/lib/utils";

type PixPaymentProps = {
  orderId: string;
  qrCode: string | null;
  qrCodeBase64: string | null;
  ticketUrl: string | null;
  email: string;
};

const STEPS = [
  { step: 1, label: "Abra o app do seu banco" },
  { step: 2, label: "Escaneie o QR ou cole o código" },
  { step: 3, label: "Aguarde a confirmação automática" },
] as const;

export function PixPayment({
  orderId,
  qrCode,
  qrCodeBase64,
  ticketUrl,
  email,
}: PixPaymentProps) {
  const navigate = useNavigate();
  const { items } = useCart();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/mercadopago/order?id=${orderId}`);
        const payload = (await response.json()) as {
          ok?: boolean;
          status?: string;
          orderName?: string | null;
        };

        if (payload.status === "approved") {
          if (items.length > 0) {
            saveCheckoutSuccessSnapshot(buildCheckoutSuccessSnapshot(items));
          }
          const params = new URLSearchParams();
          if (payload.orderName) params.set("order", payload.orderName);
          params.set("email", email);
          navigate(`/store/checkout/sucesso?${params.toString()}`, { replace: true });
        }
      } catch {
        // polling silencioso
      }
    }, 4000);

    return () => window.clearInterval(interval);
  }, [email, items, navigate, orderId]);

  const handleCopy = async () => {
    if (!qrCode) return;
    await navigator.clipboard.writeText(qrCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center gap-3 rounded-full border border-border/70 bg-background px-4 py-2.5 text-sm text-muted-foreground">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/60 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
        </span>
        <Loader2 className="h-4 w-4 animate-spin text-foreground/60" />
        Aguardando confirmação do pagamento
      </div>

      <div className="grid gap-8 md:grid-cols-[minmax(0,220px)_1fr] md:items-start md:gap-10">
        <div className="mx-auto w-full max-w-[220px] md:mx-0">
          <div className="overflow-hidden rounded-2xl border border-border bg-white p-4 shadow-[0_16px_48px_-24px_rgba(0,0,0,0.25)]">
            {qrCodeBase64 ? (
              <img
                src={`data:image/png;base64,${qrCodeBase64}`}
                alt="QR Code Pix"
                className="aspect-square w-full object-contain"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center bg-secondary/30">
                <QrCode className="h-14 w-14 text-muted-foreground/50" strokeWidth={1.25} />
              </div>
            )}
          </div>
          <p className="mt-3 text-center text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            QR Code Pix
          </p>
        </div>

        <div className="min-w-0 space-y-5">
          {qrCode && (
            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Pix copia e cola
              </p>
              <div className="rounded-xl border border-border/80 bg-secondary/20 p-4">
                <p className="max-h-24 overflow-y-auto break-all font-mono text-xs leading-relaxed text-foreground/90">
                  {qrCode}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full rounded-full text-sm font-medium sm:w-auto sm:min-w-[200px]"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4 text-emerald-600" />
                    Código copiado
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar código Pix
                  </>
                )}
              </Button>
            </div>
          )}

          <ol className="space-y-3 border-t border-border/60 pt-5">
            {STEPS.map(({ step, label }) => (
              <li key={step} className="flex items-start gap-3 text-sm">
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
                    step === 3
                      ? "border-foreground/20 bg-foreground text-primary-foreground"
                      : "border-border bg-background text-muted-foreground",
                  )}
                >
                  {step}
                </span>
                <span className="pt-0.5 text-muted-foreground">{label}</span>
              </li>
            ))}
          </ol>

          {ticketUrl && (
            <a
              href={ticketUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
            >
              <ExternalLink className="h-4 w-4" />
              Abrir instruções do Pix
            </a>
          )}
        </div>
      </div>

      <p className="text-center text-xs leading-relaxed text-muted-foreground md:text-left">
        Após pagar, a confirmação pode levar alguns segundos. Mantenha esta página aberta.
      </p>
    </div>
  );
}