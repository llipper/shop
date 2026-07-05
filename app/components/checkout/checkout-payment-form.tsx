"use client";

import { useState } from "react";
import { ExternalLink, Landmark, Loader2, QrCode, Zap } from "lucide-react";
import { CheckoutCardPayment } from "@/components/checkout/checkout-card-payment";
import {
  CheckoutPaymentMethods,
  type CheckoutPaymentMethod,
} from "@/components/checkout/checkout-payment-methods";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  submitMercadoPagoOrder,
  type MercadoPagoOrderLineItem,
} from "@/lib/mercadopago-order-client";
import type { CheckoutShippingAddress } from "@/types/checkout";

type PixData = {
  qrCode: string | null;
  qrCodeBase64: string | null;
  ticketUrl: string | null;
};

type CheckoutPaymentFormProps = {
  publicKey: string;
  amount: number;
  reference: string;
  shipping: CheckoutShippingAddress;
  items: MercadoPagoOrderLineItem[];
  onApproved: (result: { orderName?: string | null; email?: string | null }) => void;
  onPixPending: (result: { orderId: string; pix: PixData }) => void;
  onError: (message: string) => void;
};

function formatBRL(value: number) {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

export function CheckoutPaymentForm({
  publicKey,
  amount,
  reference,
  shipping,
  items,
  onApproved,
  onPixPending,
  onError,
}: CheckoutPaymentFormProps) {
  const [method, setMethod] = useState<CheckoutPaymentMethod>("card");
  const [submitting, setSubmitting] = useState(false);
  const [ticketUrl, setTicketUrl] = useState<string | null>(null);
  const [cardFormKey, setCardFormKey] = useState(0);

  const processOrderResult = (
    result: Awaited<ReturnType<typeof submitMercadoPagoOrder>>,
    options?: { resetCardForm?: boolean },
  ) => {
    if (!result.ok) {
      if (options?.resetCardForm) {
        setCardFormKey((current) => current + 1);
      }
      onError(result.message ?? "Não foi possível processar o pagamento.");
      return;
    }

    if (result.status === "approved") {
      onApproved({ orderName: result.orderName, email: result.email ?? shipping.email });
      return;
    }

    const orderId = result.orderId ?? result.mpOrderId;
    if (!orderId) {
      onError("Resposta de pagamento inválida.");
      return;
    }

    if (result.pix?.qrCode || result.pix?.qrCodeBase64) {
      onPixPending({
        orderId,
        pix: {
          qrCode: result.pix.qrCode,
          qrCodeBase64: result.pix.qrCodeBase64,
          ticketUrl: result.pix.ticketUrl,
        },
      });
      return;
    }

    if (result.ticketUrl) {
      setTicketUrl(result.ticketUrl);
      return;
    }

    onError("Pagamento pendente sem instruções. Tente novamente.");
  };

  const handleAlternativePayment = async (paymentMethod: "pix" | "ticket") => {
    setSubmitting(true);
    setTicketUrl(null);

    try {
      const result = await submitMercadoPagoOrder({
        reference,
        amount,
        method: paymentMethod,
        payer: shipping,
        items,
      });
      processOrderResult(result, { resetCardForm: false });
    } catch {
      onError("Erro ao processar pagamento.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCardPayment = async (card: {
    token: string;
    paymentMethodId: string;
    installments: number;
  }) => {
    setSubmitting(true);

    try {
      const result = await submitMercadoPagoOrder({
        reference,
        amount,
        method: "card",
        payer: shipping,
        items,
        card,
      });
      processOrderResult(result, { resetCardForm: true });
    } catch {
      setCardFormKey((current) => current + 1);
      onError("Erro ao processar pagamento.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="gap-0 border-border/80 py-0 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.35)]">
      <CardHeader className="space-y-4 border-b border-border/60 px-4 py-4 md:px-6 md:py-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Forma de pagamento
          </p>
          <p className="text-sm font-medium tabular-nums text-foreground">{formatBRL(amount)}</p>
        </div>
        <CheckoutPaymentMethods
          value={method}
          onValueChange={setMethod}
          disabled={submitting}
        />
      </CardHeader>

      <CardContent className="px-4 py-6 md:px-6 md:py-7">
        {method === "card" ? (
          <CheckoutCardPayment
            key={`${reference}-card-${cardFormKey}`}
            publicKey={publicKey}
            amount={amount}
            payerEmail={shipping.email}
            payerDocument={shipping.document}
            disabled={submitting}
            onSubmitCard={handleCardPayment}
          />
        ) : null}

        {method === "pix" ? (
          <div className="mx-auto max-w-md space-y-6 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-border/70 bg-muted/30">
              <QrCode className="size-7 text-foreground" strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium tracking-tight">Pague com Pix</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Gere o QR Code e finalize em segundos. A confirmação é automática.
              </p>
            </div>
            <Button
              type="button"
              className="h-12 w-full rounded-full text-sm font-medium"
              disabled={submitting}
              onClick={() => handleAlternativePayment("pix")}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Gerando Pix...
                </>
              ) : (
                <>
                  <Zap className="mr-2 size-4" />
                  Gerar QR Code Pix
                </>
              )}
            </Button>
          </div>
        ) : null}

        {method === "ticket" ? (
          <div className="mx-auto max-w-md space-y-6 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-border/70 bg-muted/30">
              <Landmark className="size-7 text-foreground" strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium tracking-tight">Boleto bancário</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Compensação em até 3 dias úteis. O pedido confirma após o pagamento.
              </p>
            </div>
            {ticketUrl ? (
              <a
                href={ticketUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                <ExternalLink className="size-4" />
                Abrir boleto
              </a>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full rounded-full text-sm font-medium"
                disabled={submitting}
                onClick={() => handleAlternativePayment("ticket")}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Gerando boleto...
                  </>
                ) : (
                  "Gerar boleto"
                )}
              </Button>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}