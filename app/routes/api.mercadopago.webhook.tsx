import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { data } from "react-router";
import {
  fetchMercadoPagoOrder,
  isOrderPaymentApproved,
  parsePaymentReference,
} from "@/lib/mercadopago.server";
import { completeDraftOrder } from "@/lib/shopify-order.server";

async function processOrderNotification(orderId: string) {
  const order = await fetchMercadoPagoOrder(orderId);
  if (!order || !isOrderPaymentApproved(order)) return;

  const reference = String(order.external_reference ?? "");
  const draftOrderId = parsePaymentReference(reference);
  if (!draftOrderId) return;

  await completeDraftOrder(draftOrderId);
}

function extractOrderId(request: Request): string | null {
  const url = new URL(request.url);
  const topic = url.searchParams.get("topic") ?? url.searchParams.get("type");
  const id = url.searchParams.get("id") ?? url.searchParams.get("data.id");

  if (id && (!topic || topic.includes("order"))) {
    return id;
  }

  return null;
}

async function extractOrderIdFromBody(request: Request): Promise<string | null> {
  try {
    const body = (await request.json()) as {
      type?: string;
      topic?: string;
      action?: string;
      data?: { id?: string | number };
      id?: string | number;
    };

    const type = body.type ?? body.topic ?? body.action ?? "";
    const id = body.data?.id ?? body.id;

    if (id == null) return null;
    if (type.includes("order")) return String(id);

    return null;
  } catch {
    return null;
  }
}

async function handleNotification(request: Request) {
  let orderId = extractOrderId(request);

  if (!orderId && request.method === "POST") {
    orderId = await extractOrderIdFromBody(request);
  }

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