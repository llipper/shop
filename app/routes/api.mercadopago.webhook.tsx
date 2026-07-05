import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { data } from "react-router";
import {
  fetchMercadoPagoOrder,
  isOrderPaymentApproved,
  parsePaymentReference,
} from "@/lib/mercadopago.server";
import {
  extractMercadoPagoOrderId,
  readMercadoPagoWebhookBody,
  verifyMercadoPagoWebhookSignature,
} from "@/lib/mercadopago-webhook.server";
import { completeDraftOrder } from "@/lib/shopify-order.server";

async function processOrderNotification(orderId: string) {
  const order = await fetchMercadoPagoOrder(orderId);
  if (!order || !isOrderPaymentApproved(order)) return;

  const reference = String(order.external_reference ?? "");
  const draftOrderId = parsePaymentReference(reference);
  if (!draftOrderId) return;

  await completeDraftOrder(draftOrderId);
}

async function handleNotification(request: Request) {
  const url = new URL(request.url);
  const queryDataId = url.searchParams.get("data.id") ?? url.searchParams.get("id");
  const body = request.method === "POST" ? await readMercadoPagoWebhookBody(request) : null;
  const dataId = queryDataId ?? (body?.data?.id != null ? String(body.data.id) : null);

  const signature = verifyMercadoPagoWebhookSignature({
    signatureHeader: request.headers.get("x-signature"),
    requestIdHeader: request.headers.get("x-request-id"),
    dataId,
  });

  if (!signature.ok && !signature.skipped) {
    return data({ ok: false, message: "Assinatura do webhook inválida." }, { status: 401 });
  }

  const orderId = extractMercadoPagoOrderId(request, body);
  if (orderId) {
    await processOrderNotification(orderId);
  }

  return data({ ok: true });
}

export async function action({ request }: ActionFunctionArgs) {
  return handleNotification(request);
}

export async function loader({ request }: LoaderFunctionArgs) {
  return handleNotification(request);
}