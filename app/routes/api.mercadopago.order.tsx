import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { data } from "react-router";
import {
  createMercadoPagoOrder,
  fetchMercadoPagoOrder,
  getMercadoPagoPaymentErrorMessage,
  getOrderFailureMessage,
  getOrderId,
  getOrderPixData,
  getOrderStatusDetail,
  getOrderPaymentStatus,
  isOrderPaymentApproved,
  isOrderPaymentPending,
  parsePaymentReference,
} from "@/lib/mercadopago.server";
import { completeDraftOrder } from "@/lib/shopify-order.server";

type OrderRequestBody = {
  reference?: string;
  amount?: number;
  method?: "card" | "pix" | "ticket";
  payer?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    document?: string;
    phone?: string;
  };
  items?: Array<{
    title?: string;
    unitPrice?: number;
    quantity?: number;
  }>;
  card?: {
    token?: string;
    paymentMethodId?: string;
    installments?: number;
  };
};

async function handleApprovedOrder(draftOrderId: string, payerEmail?: string) {
  const complete = await completeDraftOrder(draftOrderId);
  return {
    ok: true as const,
    status: "approved",
    orderName: complete.ok ? complete.orderName : null,
    email: payerEmail ?? null,
  };
}

function buildOrderResponse(
  order: Record<string, unknown>,
  draftOrderId: string,
  payerEmail?: string,
) {
  const orderId = getOrderId(order);
  const status = getOrderPaymentStatus(order);

  if (isOrderPaymentApproved(order)) {
    return handleApprovedOrder(draftOrderId, payerEmail).then((result) => ({
      ...result,
      orderId,
      mpOrderId: orderId,
    }));
  }

  if (isOrderPaymentPending(order)) {
    const pix = getOrderPixData(order);
    const hasPix = Boolean(pix.qrCode || pix.qrCodeBase64);

    return Promise.resolve({
      ok: true as const,
      status,
      orderId,
      mpOrderId: orderId,
      pix: hasPix ? pix : undefined,
      ticketUrl: pix.ticketUrl,
    });
  }

  const message =
    getOrderFailureMessage(order) ??
    getMercadoPagoPaymentErrorMessage(getOrderStatusDetail(order));

  return Promise.resolve({
    ok: false as const,
    message,
    status,
    orderId,
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("id");

  if (!orderId) {
    return data({ ok: false, message: "ID do pedido ausente." }, { status: 400 });
  }

  const order = await fetchMercadoPagoOrder(orderId);
  if (!order) {
    return data({ ok: false, message: "Pedido não encontrado." }, { status: 404 });
  }

  const reference = String(order.external_reference ?? "");
  const draftOrderId = parsePaymentReference(reference);
  const payer = order.payer as { email?: string } | undefined;

  if (isOrderPaymentApproved(order) && draftOrderId) {
    const result = await handleApprovedOrder(draftOrderId, payer?.email);
    return data({ ...result, orderId, mpOrderId: orderId });
  }

  return data({
    ok: true,
    status: getOrderPaymentStatus(order),
    orderId,
    mpOrderId: orderId,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return data({ ok: false, message: "Método não permitido." }, { status: 405 });
  }

  let body: OrderRequestBody;
  try {
    body = (await request.json()) as OrderRequestBody;
  } catch {
    return data({ ok: false, message: "Payload inválido." }, { status: 400 });
  }

  const reference = body.reference?.trim();
  const amount = body.amount;
  const method = body.method;
  const payer = body.payer;
  const items = body.items;

  if (!reference || !amount || !method || !payer?.email || !items?.length) {
    return data({ ok: false, message: "Dados de pagamento incompletos." }, { status: 400 });
  }

  const draftOrderId = parsePaymentReference(reference);
  if (!draftOrderId) {
    return data({ ok: false, message: "Referência de pedido inválida." }, { status: 400 });
  }

  const normalizedItems = items
    .filter((item) => item.title && item.unitPrice && item.quantity)
    .map((item) => ({
      title: item.title!,
      unitPrice: item.unitPrice!,
      quantity: item.quantity!,
    }));

  if (!normalizedItems.length) {
    return data({ ok: false, message: "Itens do pedido inválidos." }, { status: 400 });
  }

  if (method === "card") {
    if (!body.card?.token || !body.card.paymentMethodId || !body.card.installments) {
      return data({ ok: false, message: "Dados do cartão incompletos." }, { status: 400 });
    }
  }

  const result = await createMercadoPagoOrder({
    reference,
    amount,
    method,
    payer: {
      email: payer.email,
      firstName: payer.firstName ?? "",
      lastName: payer.lastName ?? "",
      document: payer.document ?? "",
      phone: payer.phone,
    },
    items: normalizedItems,
    card: body.card
      ? {
          token: body.card.token!,
          paymentMethodId: body.card.paymentMethodId!,
          installments: body.card.installments!,
        }
      : undefined,
    idempotencyKey: crypto.randomUUID(),
  });

  if (!result.ok) {
    return data({ ok: false, message: result.message }, { status: 422 });
  }

  const response = await buildOrderResponse(result.order, draftOrderId, payer.email);

  if ("ok" in response && response.ok === false) {
    return data(response, { status: 422 });
  }

  return data(response);
}