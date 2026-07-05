import { getCardDigits } from "@/lib/card-format";

const MP_SDK_URL = "https://sdk.mercadopago.com/js/v2";

let sdkPromise: Promise<void> | null = null;

export function getCardBin(cardNumber: string) {
  return getCardDigits(cardNumber).slice(0, 8);
}

export function loadMercadoPagoSdk() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("SDK indisponível no servidor."));
  }

  if (window.MercadoPago) {
    return Promise.resolve();
  }

  if (!sdkPromise) {
    sdkPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${MP_SDK_URL}"]`);
      if (existing) {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () => reject(new Error("Falha ao carregar Mercado Pago.")));
        return;
      }

      const script = document.createElement("script");
      script.src = MP_SDK_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Falha ao carregar Mercado Pago."));
      document.body.appendChild(script);
    });
  }

  return sdkPromise;
}

export type MercadoPagoInstallmentOption = {
  installments: number;
  installmentAmount: number;
  totalAmount: number;
  label: string;
};

export type MercadoPagoCardTokenResult = {
  id?: string;
  token?: string;
  payment_method_id?: string;
  first_six_digits?: string;
  last_four_digits?: string;
};

type PaymentMethodsApiResponse = {
  results?: Array<{ id?: string }>;
};

type CreateCardTokenInput = {
  cardNumber: string;
  cardholderName: string;
  cardExpirationMonth: string;
  cardExpirationYear: string;
  securityCode: string;
  identificationType: string;
  identificationNumber: string;
  cardholderEmail?: string;
};

type GetInstallmentsInput = {
  amount: string;
  bin: string;
};

type InstallmentsApiRow = {
  payment_method_id?: string;
  payer_costs?: Array<{
    installments: number;
    installment_amount: number;
    total_amount: number;
    recommended_message?: string;
  }>;
};

export type MercadoPagoSdk = {
  createCardToken: (input: CreateCardTokenInput) => Promise<MercadoPagoCardTokenResult>;
  getInstallments: (input: GetInstallmentsInput) => Promise<InstallmentsApiRow[]>;
  getPaymentMethods: (input: { bin: string }) => Promise<PaymentMethodsApiResponse>;
};

type MercadoPagoClientOptions = {
  locale: string;
  advancedFraudPrevention: boolean;
  trackingDisabled: boolean;
};

declare global {
  interface Window {
    MercadoPago?: new (publicKey: string, options?: MercadoPagoClientOptions) => MercadoPagoSdk;
  }
}

export function createMercadoPagoClient(publicKey: string) {
  if (!window.MercadoPago) {
    throw new Error("Mercado Pago indisponível.");
  }

  return new window.MercadoPago(publicKey, {
    locale: "pt-BR",
    advancedFraudPrevention: false,
    trackingDisabled: true,
  });
}

export function parseCardTokenResult(result: MercadoPagoCardTokenResult | null | undefined) {
  const token = String(result?.id ?? result?.token ?? "").trim();
  const paymentMethodId = String(result?.payment_method_id ?? "").trim();
  return { token, paymentMethodId };
}

export async function resolvePaymentMethodId(
  mp: MercadoPagoSdk,
  bin: string,
  currentId = "",
) {
  if (currentId) return currentId;

  const normalizedBin = bin.slice(0, 8);
  if (normalizedBin.length < 6) return "";

  try {
    const methods = await mp.getPaymentMethods({ bin: normalizedBin });
    const methodId = methods.results?.[0]?.id?.trim();
    if (methodId) return methodId;
  } catch {
    // Fall through to BIN heuristics.
  }

  if (normalizedBin.startsWith("4")) return "visa";
  if (normalizedBin.startsWith("5")) return "master";
  if (normalizedBin.startsWith("3")) return "amex";

  return "";
}

function formatBRL(value: number) {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

export function parseInstallmentOptions(
  rows: InstallmentsApiRow[] | null | undefined,
): { paymentMethodId: string; options: MercadoPagoInstallmentOption[] } {
  const first = rows?.[0];
  if (!first?.payer_costs?.length || !first.payment_method_id) {
    return { paymentMethodId: "", options: [] };
  }

  const options = first.payer_costs.map((cost) => ({
    installments: cost.installments,
    installmentAmount: cost.installment_amount,
    totalAmount: cost.total_amount,
    label:
      cost.recommended_message ||
      (cost.installments === 1
        ? `1x de ${formatBRL(cost.total_amount)} sem juros`
        : `${cost.installments}x de ${formatBRL(cost.installment_amount)}`),
  }));

  return {
    paymentMethodId: first.payment_method_id,
    options,
  };
}