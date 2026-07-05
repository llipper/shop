import type { CheckoutShippingAddress } from "@/types/checkout";

export type MercadoPagoOrderLineItem = {
  title: string;
  unitPrice: number;
  quantity: number;
};

export type SubmitMercadoPagoOrderInput = {
  reference: string;
  amount: number;
  method: "card" | "pix" | "ticket";
  payer: CheckoutShippingAddress;
  items: MercadoPagoOrderLineItem[];
  card?: {
    token: string;
    paymentMethodId: string;
    installments: number;
  };
};

export type MercadoPagoOrderResult = {
  ok: boolean;
  message?: string;
  status?: string;
  orderId?: string;
  mpOrderId?: string;
  orderName?: string | null;
  email?: string | null;
  pix?: {
    qrCode: string | null;
    qrCodeBase64: string | null;
    ticketUrl: string | null;
  };
  ticketUrl?: string | null;
};

export async function submitMercadoPagoOrder(
  input: SubmitMercadoPagoOrderInput,
): Promise<MercadoPagoOrderResult> {
  const response = await fetch("/api/mercadopago/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      reference: input.reference,
      amount: input.amount,
      method: input.method,
      payer: {
        email: input.payer.email,
        firstName: input.payer.firstName,
        lastName: input.payer.lastName,
        document: input.payer.document,
        phone: input.payer.phone,
      },
      items: input.items,
      card: input.card,
    }),
  });

  return (await response.json()) as MercadoPagoOrderResult;
}