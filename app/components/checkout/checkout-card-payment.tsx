"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatCardExpiryInput,
  formatCardNumberInput,
  getCardDigits,
  parseCardExpiry,
} from "@/lib/card-format";
import { getCpfDigits } from "@/lib/br-format";
import { getMercadoPagoClientErrorMessage } from "@/lib/mercadopago-error";
import {
  loadMercadoPagoSdk,
  parseInstallmentOptions,
  type MercadoPagoInstallmentOption,
} from "@/lib/mercadopago-sdk";

type CheckoutCardPaymentProps = {
  publicKey: string;
  amount: number;
  payerEmail: string;
  payerDocument: string;
  disabled?: boolean;
  onSubmitCard: (card: {
    token: string;
    paymentMethodId: string;
    installments: number;
  }) => Promise<void>;
};

function formatBRL(value: number) {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

export function CheckoutCardPayment({
  publicKey,
  amount,
  payerEmail,
  payerDocument,
  disabled,
  onSubmitCard,
}: CheckoutCardPaymentProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [installments, setInstallments] = useState("1");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [installmentOptions, setInstallmentOptions] = useState<MercadoPagoInstallmentOption[]>([]);
  const [loadingInstallments, setLoadingInstallments] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cardBin = useMemo(() => getCardDigits(cardNumber).slice(0, 6), [cardNumber]);

  useEffect(() => {
    let cancelled = false;

    loadMercadoPagoSdk()
      .then(() => {
        if (!cancelled) setSdkReady(true);
      })
      .catch(() => {
        if (!cancelled) setError("Não foi possível carregar o Mercado Pago.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!sdkReady || cardBin.length < 6) {
      setInstallmentOptions([]);
      setPaymentMethodId("");
      setInstallments("1");
      return;
    }

    let cancelled = false;

    async function fetchInstallments() {
      setLoadingInstallments(true);
      try {
        if (!window.MercadoPago) return;

        const mp = new window.MercadoPago(publicKey, { locale: "pt-BR" });
        const rows = await mp.getInstallments({
          amount: amount.toFixed(2),
          bin: cardBin,
        });

        if (cancelled) return;

        const parsed = parseInstallmentOptions(rows);
        setPaymentMethodId(parsed.paymentMethodId);
        setInstallmentOptions(parsed.options);
        setInstallments(String(parsed.options[0]?.installments ?? 1));
      } catch {
        if (!cancelled) {
          setInstallmentOptions([
            {
              installments: 1,
              installmentAmount: amount,
              totalAmount: amount,
              label: `1x de ${formatBRL(amount)}`,
            },
          ]);
          setInstallments("1");
        }
      } finally {
        if (!cancelled) setLoadingInstallments(false);
      }
    }

    fetchInstallments();

    return () => {
      cancelled = true;
    };
  }, [amount, cardBin, publicKey, sdkReady]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!sdkReady || submitting || disabled) return;

    const digits = getCardDigits(cardNumber);
    const parsedExpiry = parseCardExpiry(expiry);
    const documentDigits = getCpfDigits(payerDocument);

    if (digits.length < 13) {
      setError("Informe um número de cartão válido.");
      return;
    }
    if (!parsedExpiry) {
      setError("Informe a validade no formato MM/AA.");
      return;
    }
    if (securityCode.length < 3) {
      setError("Informe o CVV do cartão.");
      return;
    }
    if (!cardholderName.trim()) {
      setError("Informe o nome do titular.");
      return;
    }
    if (!documentDigits) {
      setError("CPF do titular ausente. Volte ao passo de entrega.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (!window.MercadoPago) {
        throw new Error("Mercado Pago indisponível.");
      }

      const mp = new window.MercadoPago(publicKey, { locale: "pt-BR" });
      const tokenResult = await mp.createCardToken({
        cardNumber: digits,
        cardholderName: cardholderName.trim(),
        cardExpirationMonth: parsedExpiry.month,
        cardExpirationYear: parsedExpiry.year,
        securityCode,
        identificationType: "CPF",
        identificationNumber: documentDigits,
        cardholderEmail: payerEmail,
      });

      const token = tokenResult.id;
      const methodId = tokenResult.payment_method_id || paymentMethodId;

      if (!token || !methodId) {
        throw new Error("Não foi possível validar o cartão. Confira os dados.");
      }

      await onSubmitCard({
        token,
        paymentMethodId: methodId,
        installments: Number(installments) || 1,
      });
    } catch (submitError) {
      setError(getMercadoPagoClientErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  const installmentsHint =
    cardBin.length < 6
      ? "Digite os 6 primeiros dígitos do cartão para ver as parcelas."
      : loadingInstallments
        ? "Buscando parcelas..."
        : installmentOptions.length
          ? null
          : "Parcelas indisponíveis para este cartão.";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Dados do cartão
        </p>

        <div>
          <Label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Número do cartão
          </Label>
          <Input
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumberInput(e.target.value))}
            placeholder="0000 0000 0000 0000"
            inputMode="numeric"
            autoComplete="cc-number"
            className="h-10"
            maxLength={19}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Validade
            </Label>
            <Input
              value={expiry}
              onChange={(e) => setExpiry(formatCardExpiryInput(e.target.value))}
              placeholder="MM/AA"
              inputMode="numeric"
              autoComplete="cc-exp"
              className="h-10"
              maxLength={5}
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              CVV
            </Label>
            <Input
              value={securityCode}
              onChange={(e) => setSecurityCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="123"
              inputMode="numeric"
              autoComplete="cc-csc"
              className="h-10"
              maxLength={4}
            />
          </div>
        </div>

        <div>
          <Label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Nome do titular
          </Label>
          <Input
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            placeholder="Como no cartão (ex.: APRO)"
            autoComplete="cc-name"
            className="h-10"
          />
        </div>

        <p className="text-xs text-muted-foreground">
          CPF e e-mail ({payerEmail}) já foram informados na entrega.
        </p>
      </div>

      <div className="space-y-4 border-t border-border/60 pt-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Parcelamento
        </p>

        <div>
          <Label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Parcelas
          </Label>
          <Select
            value={installments}
            onValueChange={setInstallments}
            disabled={!installmentOptions.length || loadingInstallments || disabled}
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue placeholder="Selecione as parcelas" />
            </SelectTrigger>
            <SelectContent>
              {installmentOptions.map((option) => (
                <SelectItem key={option.installments} value={String(option.installments)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {installmentsHint ? (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              {loadingInstallments ? <Loader2 className="size-3 animate-spin" /> : null}
              {installmentsHint}
            </p>
          ) : null}
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button
        type="submit"
        className="h-12 w-full rounded-full text-sm font-medium tracking-wide"
        disabled={!sdkReady || disabled || submitting}
      >
        {submitting ? "Processando pagamento..." : "Pagar com cartão"}
      </Button>
    </form>
  );
}