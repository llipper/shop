import { getCpfDigits, getPhoneDigits } from "./br-format";
import { getPublicStorefrontOrigin } from "./storefront-url.server";

const MP_API = "https://api.mercadopago.com/v1";

export function getMercadoPagoPublicKey(): string | null {
  return process.env.MERCADOPAGO_PUBLIC_KEY?.trim() || null;
}

export function getMercadoPagoAccessToken(): string | null {
  return process.env.MERCADOPAGO_ACCESS_TOKEN?.trim() || null;
}

export function getMercadoPagoPaymentErrorMessage(statusDetail: string): string {
  const messages: Record<string, string> = {
    cc_rejected_insufficient_amount: "Saldo insuficiente no cartão.",
    cc_rejected_bad_filled_card_number: "Número do cartão inválido.",
    cc_rejected_bad_filled_date: "Data de vencimento inválida.",
    cc_rejected_bad_filled_security_code: "Código de segurança inválido.",
    cc_rejected_call_for_authorize: "Ligue para o banco para autorizar o pagamento.",
    cc_rejected_duplicated_payment: "Pagamento duplicado. Aguarde e tente novamente.",
    cc_rejected_high_risk: "Pagamento recusado por segurança.",
    cc_rejected_blacklist: "Meio de pagamento não permitido.",
    cc_rejected_other_reason: "Cartão recusado. Tente outro cartão ou Pix.",
    rejected_by_bank: "Pagamento recusado pelo banco.",
    rejected_insufficient_data: "Dados do pagamento incompletos.",
  };

  return messages[statusDetail] ?? "Pagamento recusado. Tente outro método.";
}

export function getMercadoPagoConfigError(): string | null {
  if (!getMercadoPagoAccessToken()) {
    return "Defina MERCADOPAGO_ACCESS_TOKEN no .env.";
  }
  if (!getMercadoPagoPublicKey()) {
    return "Defina MERCADOPAGO_PUBLIC_KEY no .env.";
  }
  return null;
}

function extractDraftOrderNumericId(draftOrderId: string) {
  const match = draftOrderId.match(/(\d+)$/);
  return match?.[1] ?? draftOrderId.replace(/\W+/g, "-");
}

export function buildPaymentReference(draftOrderId: string) {
  return `draft-${extractDraftOrderNumericId(draftOrderId)}`;
}

export function parsePaymentReference(reference: string | null | undefined) {
  if (!reference) return null;

  if (reference.startsWith("draft-")) {
    const id = reference.slice("draft-".length);
    return id.startsWith("gid://") ? id : `gid://shopify/DraftOrder/${id}`;
  }

  if (reference.startsWith("draft:")) {
    return reference.slice("draft:".length);
  }

  return null;
}

function isMercadoPagoTestMode() {
  if (process.env.MERCADOPAGO_TEST_MODE === "true") return true;
  if (process.env.MERCADOPAGO_TEST_MODE === "false") return false;
  return process.env.NODE_ENV !== "production";
}

function normalizeSandboxPayerEmail(email: string) {
  const trimmed = email.trim();
  if (!trimmed) return trimmed;
  if (trimmed.endsWith("@testuser.com")) return trimmed;

  const localPart = trimmed.split("@")[0] || "buyer";
  const sanitized = localPart.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 40) || "buyer";
  return `${sanitized}@testuser.com`;
}

function formatMercadoPagoApiErrors(payload: Record<string, unknown>) {
  const errors = payload.errors as
    | Array<{ message?: string; details?: string[] }>
    | undefined;

  if (errors?.length) {
    return errors
      .map((error) => {
        const detail = error.details?.[0];
        return detail ? `${error.message}: ${detail}` : error.message;
      })
      .filter(Boolean)
      .join(" ");
  }

  return (
    (payload.message as string | undefined) ??
    (payload.error as string | undefined) ??
    "Não foi possível processar o pagamento."
  );
}

function formatOrderAmount(value: number) {
  return value.toFixed(2);
}

function buildPayer(input: {
  email: string;
  firstName: string;
  lastName: string;
  document: string;
  phone?: string;
}) {
  const phoneDigits = input.phone ? getPhoneDigits(input.phone) : "";
  const email = isMercadoPagoTestMode()
    ? normalizeSandboxPayerEmail(input.email)
    : input.email;
  const payer: Record<string, unknown> = {
    email,
    entity_type: "individual",
    first_name: input.firstName,
    last_name: input.lastName,
    identification: {
      type: "CPF",
      number: getCpfDigits(input.document),
    },
  };

  if (phoneDigits.length >= 10) {
    payer.phone = {
      area_code: phoneDigits.slice(0, 2),
      number: phoneDigits.slice(2),
    };
  }

  return payer;
}

function buildPaymentMethod(
  method: "card" | "pix" | "ticket",
  card?: { token: string; paymentMethodId: string; installments: number },
) {
  if (method === "pix") {
    return { id: "pix", type: "bank_transfer" };
  }

  if (method === "ticket") {
    return { id: "bolbradesco", type: "ticket" };
  }

  if (!card) {
    throw new Error("Dados do cartão ausentes.");
  }

  return {
    id: card.paymentMethodId,
    type: "credit_card",
    token: card.token,
    installments: card.installments,
  };
}

export type CreateMercadoPagoOrderInput = {
  reference: string;
  amount: number;
  payer: {
    email: string;
    firstName: string;
    lastName: string;
    document: string;
    phone?: string;
  };
  items: Array<{
    title: string;
    unitPrice: number;
    quantity: number;
  }>;
  method: "card" | "pix" | "ticket";
  card?: {
    token: string;
    paymentMethodId: string;
    installments: number;
  };
  idempotencyKey: string;
};

export async function createMercadoPagoOrder(input: CreateMercadoPagoOrderInput) {
  const accessToken = getMercadoPagoAccessToken();
  if (!accessToken) {
    return { ok: false as const, message: "Mercado Pago não configurado." };
  }

  const origin = getPublicStorefrontOrigin();
  const notificationUrl = origin ? `${origin}/api/mercadopago/webhook` : undefined;
  const amount = formatOrderAmount(input.amount);

  const body = {
    type: "online",
    external_reference: input.reference,
    processing_mode: "automatic",
    total_amount: amount,
    description: "Pedido ROUHI",
    payer: buildPayer(input.payer),
    items: input.items.map((item) => ({
      title: item.title,
      unit_price: formatOrderAmount(item.unitPrice),
      quantity: item.quantity,
    })),
    transactions: {
      payments: [
        {
          amount,
          payment_method: buildPaymentMethod(input.method, input.card),
        },
      ],
    },
    ...(notificationUrl ? { notification_url: notificationUrl } : {}),
  };

  try {
    const response = await fetch(`${MP_API}/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": input.idempotencyKey,
      },
      body: JSON.stringify(body),
    });

    const payload = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      return { ok: false as const, message: formatMercadoPagoApiErrors(payload) };
    }

    return {
      ok: true as const,
      order: payload,
    };
  } catch {
    return { ok: false as const, message: "Erro ao conectar com o Mercado Pago." };
  }
}

export async function fetchMercadoPagoOrder(orderId: string) {
  const accessToken = getMercadoPagoAccessToken();
  if (!accessToken) return null;

  try {
    const response = await fetch(`${MP_API}/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) return null;
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getOrderPrimaryPayment(order: Record<string, unknown>) {
  const transactions = order.transactions as { payments?: Array<Record<string, unknown>> } | undefined;
  return transactions?.payments?.[0] ?? null;
}

export function getOrderPaymentStatus(order: Record<string, unknown>) {
  const payment = getOrderPrimaryPayment(order);
  if (payment?.status) return String(payment.status);
  return String(order.status ?? "");
}

export function getOrderStatusDetail(order: Record<string, unknown>) {
  const payment = getOrderPrimaryPayment(order);
  return String(payment?.status_detail ?? "");
}

export function getOrderId(order: Record<string, unknown>) {
  return String(order.id ?? "");
}

type PixTransactionData = {
  qr_code?: string;
  qr_code_base64?: string;
  ticket_url?: string;
};

function readPixTransactionData(source: unknown) {
  if (!source || typeof source !== "object") return null;
  const record = source as Record<string, unknown>;
  const poi = record.point_of_interaction as { transaction_data?: PixTransactionData } | undefined;
  const method = record.payment_method as { transaction_data?: PixTransactionData } | undefined;
  return poi?.transaction_data ?? method?.transaction_data ?? null;
}

export function getOrderPixData(order: Record<string, unknown>) {
  const payment = getOrderPrimaryPayment(order);
  const transactionData =
    readPixTransactionData(payment) ??
    readPixTransactionData(order) ??
    ((order.transactions as { payments?: unknown[] } | undefined)?.payments ?? [])
      .map(readPixTransactionData)
      .find(Boolean) ??
    null;

  return {
    qrCode: transactionData?.qr_code ?? null,
    qrCodeBase64: transactionData?.qr_code_base64 ?? null,
    ticketUrl: transactionData?.ticket_url ?? null,
  };
}

export function isOrderPaymentApproved(order: Record<string, unknown>) {
  const paymentStatus = getOrderPaymentStatus(order);
  if (paymentStatus === "approved") return true;

  const orderStatus = String(order.status ?? "");
  return orderStatus === "processed";
}

export function isOrderPaymentPending(order: Record<string, unknown>) {
  const paymentStatus = getOrderPaymentStatus(order);
  return paymentStatus === "pending" || paymentStatus === "in_process" || paymentStatus === "action_required";
}