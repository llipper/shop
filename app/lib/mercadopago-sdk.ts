const MP_SDK_URL = "https://sdk.mercadopago.com/js/v2";

let sdkPromise: Promise<void> | null = null;

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
  id: string;
  payment_method_id?: string;
  first_six_digits?: string;
  last_four_digits?: string;
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
};

declare global {
  interface Window {
    MercadoPago?: new (publicKey: string, options?: { locale: string }) => MercadoPagoSdk;
  }
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