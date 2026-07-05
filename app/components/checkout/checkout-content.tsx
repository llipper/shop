"use client";

import { Link, useNavigate } from "react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckoutHeader, CheckoutStepper } from "@/components/checkout/checkout-stepper";
import { CheckoutLineItem } from "@/components/checkout/checkout-line-item";
import {
  CheckoutOrderSummary,
  CheckoutPrimaryAction,
} from "@/components/checkout/checkout-order-summary";
import { CheckoutPaymentForm } from "@/components/checkout/checkout-payment-form";
import { CheckoutPaymentPanel } from "@/components/checkout/checkout-payment-panel";
import { PixPayment } from "@/components/checkout/pix-payment";
import { StateSelect } from "@/components/checkout/state-select";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import {
  formatCpfInput,
  formatPhoneInput,
  getCpfDigits,
  getPhoneDigits,
  isValidBrazilPhone,
  isValidCpf,
} from "@/lib/br-format";
import { formatZipInput, getZipDigits, isValidZip } from "@/lib/cep";
import { calculateShipping } from "@/lib/shipping";
import type { CheckoutPrepareResult, CheckoutShippingAddress } from "@/types/checkout";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type CheckoutStep = "review" | "shipping" | "payment" | "pix";

interface CheckoutContentProps {
  shop: string | null;
  publicKey: string | null;
  mpConfigured: boolean;
  adminConfigured: boolean;
}

const emptyShipping = (): CheckoutShippingAddress => ({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  document: "",
  zip: "",
  address1: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "SP",
});

export function CheckoutContent({
  shop,
  publicKey,
  mpConfigured,
  adminConfigured,
}: CheckoutContentProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, totalPrice, totalItems, removeItem, updateItemQuantity } = useCart();
  const [step, setStep] = useState<CheckoutStep>("review");
  const [shipping, setShipping] = useState<CheckoutShippingAddress>(emptyShipping);
  const [prepareResult, setPrepareResult] = useState<CheckoutPrepareResult | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [pixState, setPixState] = useState<{
    orderId: string;
    qrCode: string | null;
    qrCodeBase64: string | null;
    ticketUrl: string | null;
  } | null>(null);

  const unavailableItems = items.filter((item) => item.availableForSale === false);
  const missingVariants = items.some((item) => !item.variantId);
  const shippingCost = calculateShipping(totalPrice);
  const orderTotal = totalPrice + shippingCost;
  const summaryPreviewItems = items.map((item) => ({
    image: item.image,
    title: item.product.title,
  }));

  const canProceed =
    items.length > 0 &&
    !missingVariants &&
    unavailableItems.length === 0 &&
    Boolean(shop) &&
    mpConfigured &&
    adminConfigured;

  useEffect(() => {
    if (!user) return;

    const [firstName = "", ...rest] = user.name.trim().split(/\s+/);
    setShipping((current) => ({
      ...current,
      firstName: current.firstName || firstName,
      lastName: current.lastName || rest.join(" "),
      email: current.email || user.email,
    }));
  }, [user]);

  const updateShipping = (field: keyof CheckoutShippingAddress, value: string) => {
    setShipping((current) => ({ ...current, [field]: value }));
  };

  const handlePhoneChange = (value: string) => {
    setPhoneError(null);
    updateShipping("phone", formatPhoneInput(value));
  };

  const handlePhoneBlur = (value: string) => {
    if (!getPhoneDigits(value)) {
      setPhoneError("Informe o telefone.");
      return;
    }

    if (!isValidBrazilPhone(value)) {
      setPhoneError("Telefone deve ter DDD + 8 ou 9 dígitos.");
      return;
    }

    setPhoneError(null);
  };

  const handleDocumentChange = (value: string) => {
    setDocumentError(null);
    updateShipping("document", formatCpfInput(value));
  };

  const handleDocumentBlur = (value: string) => {
    if (!getCpfDigits(value)) {
      setDocumentError("Informe o CPF.");
      return;
    }

    if (!isValidCpf(value)) {
      setDocumentError("CPF inválido.");
      return;
    }

    setDocumentError(null);
  };

  const handleZipChange = (value: string) => {
    setZipError(null);
    updateShipping("zip", formatZipInput(value));
  };

  const handleZipBlur = async (rawZip: string) => {
    const digits = getZipDigits(rawZip);

    if (!digits) {
      setZipError("Informe o CEP.");
      return;
    }

    if (!isValidZip(rawZip)) {
      setZipError("CEP deve ter 8 dígitos.");
      return;
    }

    setZipError(null);
    await fetchCep(digits);
  };

  const fetchCep = async (zip: string) => {
    if (!isValidZip(zip)) return;

    setIsFetchingCep(true);
    try {
      const response = await fetch(`/api/cep?zip=${zip}`);
      const result = (await response.json()) as {
        ok?: boolean;
        message?: string;
        zip?: string;
        address1?: string;
        neighborhood?: string;
        city?: string;
        state?: string;
      };

      if (!response.ok || !result.ok) {
        toast.error(result.message ?? "CEP não encontrado.");
        return;
      }

      setShipping((current) => ({
        ...current,
        zip: result.zip ? formatZipInput(result.zip) : current.zip,
        address1: result.address1 || current.address1,
        neighborhood: result.neighborhood || current.neighborhood,
        city: result.city || current.city,
        state: result.state || current.state,
      }));
    } catch {
      toast.error("Não foi possível buscar o CEP.");
    } finally {
      setIsFetchingCep(false);
    }
  };

  const handlePrepareOrder = async () => {
    if (!canProceed) return;

    setIsPreparing(true);
    try {
      const response = await fetch("/api/checkout/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            variantId: item.variantId!,
            quantity: item.quantity,
            title: item.product.title,
            size: item.size,
            colorName: item.colorName,
            unitPrice: item.price,
          })),
          shipping,
        }),
      });

      const result = (await response.json()) as CheckoutPrepareResult;
      if (!response.ok || !result.ok) {
        toast.error(result.message ?? "Não foi possível preparar o pedido.");
        return;
      }

      setPrepareResult(result);
      setStep("payment");
    } catch {
      toast.error("Erro ao preparar o pedido.");
    } finally {
      setIsPreparing(false);
    }
  };

  const handleApproved = (result: { orderName?: string | null; email?: string | null }) => {
    toast.success("Pagamento aprovado! Redirecionando...");
    const params = new URLSearchParams();
    if (result.orderName) params.set("order", result.orderName);
    if (result.email) params.set("email", result.email);
    void navigate(`/store/checkout/sucesso?${params.toString()}`);
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-6 py-32 text-center">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Carrinho
        </p>
        <h1 className="mb-3 text-3xl font-medium tracking-tight">Seu carrinho está vazio</h1>
        <p className="mb-8 text-muted-foreground">
          Adicione peças à sua seleção antes de finalizar a compra.
        </p>
        <Link
          to="/store"
          className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar à loja
        </Link>
      </div>
    );
  }

  const alerts = (
    <>
      {unavailableItems.length > 0 && (
        <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Alguns itens estão esgotados (
          {unavailableItems.map((i) => `${i.colorName} / ${i.size}`).join(", ")}). Remova-os ou
          escolha outra variante na página do produto.
        </div>
      )}

      {!mpConfigured || !adminConfigured ? (
        <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {!mpConfigured && "Configure MERCADOPAGO_ACCESS_TOKEN e MERCADOPAGO_PUBLIC_KEY no .env. "}
          {!adminConfigured && "Configure SHOPIFY_ADMIN_ACCESS_TOKEN no .env."}
        </div>
      ) : null}
    </>
  );

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-28 md:px-12 md:pt-32">
      <Link
        to="/store"
        className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Continuar comprando
      </Link>

      <CheckoutHeader step={step} />
      <CheckoutStepper step={step} />
      {alerts}

      {(step === "review" || step === "shipping") && (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-12">
          <section className="min-w-0">
            {step === "review" ? (
              <div className="space-y-4">
                <div className="mb-5 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Seleção
                    </p>
                    <h2 className="mt-1 text-lg font-medium text-foreground">
                      Peças no pedido
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {totalItems} {totalItems === 1 ? "unidade" : "unidades"}
                  </p>
                </div>

                {items.map((item) => (
                  <CheckoutLineItem
                    key={item.id}
                    item={item}
                    onDecrease={() => updateItemQuantity(item.id, item.quantity - 1)}
                    onIncrease={() => updateItemQuantity(item.id, item.quantity + 1)}
                    onRemove={() => removeItem(item.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-border/80 bg-background p-6 md:p-8">
                <div className="mb-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Endereço
                  </p>
                  <h2 className="mt-1 text-lg font-medium text-foreground">Dados de entrega</h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      Nome
                    </label>
                    <Input
                      value={shipping.firstName}
                      onChange={(e) => updateShipping("firstName", e.target.value)}
                      className="h-10"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      Sobrenome
                    </label>
                    <Input
                      value={shipping.lastName}
                      onChange={(e) => updateShipping("lastName", e.target.value)}
                      className="h-10"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      E-mail
                    </label>
                    <Input
                      type="email"
                      value={shipping.email}
                      onChange={(e) => updateShipping("email", e.target.value)}
                      className="h-10"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      Telefone
                    </label>
                    <Input
                      value={shipping.phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      onBlur={(e) => handlePhoneBlur(e.target.value)}
                      placeholder="(85) 99999-9999"
                      inputMode="tel"
                      autoComplete="tel"
                      maxLength={15}
                      aria-invalid={Boolean(phoneError)}
                      className="h-10"
                      required
                    />
                    {phoneError && (
                      <p className="mt-1.5 text-xs text-destructive">{phoneError}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      CPF
                    </label>
                    <Input
                      value={shipping.document}
                      onChange={(e) => handleDocumentChange(e.target.value)}
                      onBlur={(e) => handleDocumentBlur(e.target.value)}
                      placeholder="000.000.000-00"
                      inputMode="numeric"
                      autoComplete="off"
                      maxLength={14}
                      aria-invalid={Boolean(documentError)}
                      className="h-10"
                      required
                    />
                    {documentError && (
                      <p className="mt-1.5 text-xs text-destructive">{documentError}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      CEP
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={shipping.zip}
                        onChange={(e) => handleZipChange(e.target.value)}
                        onBlur={(e) => handleZipBlur(e.target.value)}
                        placeholder="00000-000"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        maxLength={9}
                        aria-invalid={Boolean(zipError)}
                        className="h-10"
                        required
                      />
                      {isFetchingCep && (
                        <Loader2 className="h-4 w-4 animate-spin self-center text-muted-foreground" />
                      )}
                    </div>
                    {zipError && (
                      <p className="mt-1.5 text-xs text-destructive">{zipError}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      Estado
                    </label>
                    <StateSelect
                      value={shipping.state}
                      onChange={(uf) => updateShipping("state", uf)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      Endereço
                    </label>
                    <Input
                      value={shipping.address1}
                      onChange={(e) => updateShipping("address1", e.target.value)}
                      className="h-10"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      Número
                    </label>
                    <Input
                      value={shipping.number}
                      onChange={(e) => updateShipping("number", e.target.value)}
                      className="h-10"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      Complemento
                    </label>
                    <Input
                      value={shipping.complement ?? ""}
                      onChange={(e) => updateShipping("complement", e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      Bairro
                    </label>
                    <Input
                      value={shipping.neighborhood}
                      onChange={(e) => updateShipping("neighborhood", e.target.value)}
                      className="h-10"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      Cidade
                    </label>
                    <Input
                      value={shipping.city}
                      onChange={(e) => updateShipping("city", e.target.value)}
                      className="h-10"
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </section>

          <CheckoutOrderSummary
            itemCount={totalItems}
            subtotal={totalPrice}
            shippingCost={shippingCost}
            previewItems={summaryPreviewItems}
            className="lg:sticky lg:top-28"
          >
            {step === "review" ? (
              <CheckoutPrimaryAction
                label="Continuar para entrega"
                disabled={!canProceed}
                onClick={() => setStep("shipping")}
              />
            ) : (
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full rounded-full"
                  onClick={() => setStep("review")}
                >
                  Voltar à revisão
                </Button>
                <CheckoutPrimaryAction
                  label={isPreparing ? "Preparando pedido..." : "Ir para pagamento"}
                  disabled={!canProceed || isPreparing}
                  loading={isPreparing}
                  onClick={handlePrepareOrder}
                />
              </div>
            )}
          </CheckoutOrderSummary>
        </div>
      )}

      {(step === "payment" || step === "pix") && (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-12">
          <section>
            {step === "payment" && prepareResult?.publicKey && prepareResult.reference && (
              <CheckoutPaymentForm
                key={prepareResult.reference}
                publicKey={prepareResult.publicKey}
                amount={prepareResult.amount ?? orderTotal}
                reference={prepareResult.reference}
                shipping={shipping}
                items={[
                  ...items.map((item) => ({
                    title: `${item.product.title} — ${item.colorName} / ${item.size}`,
                    unitPrice: item.price,
                    quantity: item.quantity,
                  })),
                  ...(shippingCost > 0
                    ? [{ title: "Frete", unitPrice: shippingCost, quantity: 1 }]
                    : []),
                ]}
                onApproved={handleApproved}
                onPixPending={({ orderId, pix }) => {
                  setPixState({
                    orderId,
                    qrCode: pix.qrCode,
                    qrCodeBase64: pix.qrCodeBase64,
                    ticketUrl: pix.ticketUrl,
                  });
                  setStep("pix");
                }}
                onError={(message) => toast.error(message)}
              />
            )}

            {step === "pix" && pixState && (
              <CheckoutPaymentPanel variant="pix">
              <PixPayment
                orderId={pixState.orderId}
                qrCode={pixState.qrCode}
                qrCodeBase64={pixState.qrCodeBase64}
                ticketUrl={pixState.ticketUrl}
                email={shipping.email}
              />
              </CheckoutPaymentPanel>
            )}
          </section>

          <CheckoutOrderSummary
            itemCount={totalItems}
            subtotal={totalPrice}
            shippingCost={shippingCost}
            previewItems={summaryPreviewItems}
            compact
            className="lg:sticky lg:top-28"
          >
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-full"
              onClick={() => setStep(step === "pix" ? "payment" : "shipping")}
            >
              {step === "pix" ? "Voltar ao pagamento" : "Voltar ao endereço"}
            </Button>
          </CheckoutOrderSummary>
        </div>
      )}

      <div className="mt-8 space-y-2 text-center">
        {!shop && (
          <p className="text-sm text-destructive">
            Configure SHOP_STORE_DOMAIN no .env para finalizar a compra.
          </p>
        )}

        {missingVariants && (
          <p className="text-sm text-destructive">
            Alguns itens não têm variante Shopify. Remova e adicione novamente pela página do
            produto.
          </p>
        )}
      </div>
    </div>
  );
}