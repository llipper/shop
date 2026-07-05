import { createHmac, timingSafeEqual } from "node:crypto";
import { getPublicStorefrontOrigin } from "@/lib/storefront-url.server";

export function getMercadoPagoWebhookSecret(): string | null {
  return process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim() || null;
}

export function getMercadoPagoWebhookUrl(): string | null {
  const origin = getPublicStorefrontOrigin();
  if (!origin) return null;
  return `${origin}/api/mercadopago/webhook`;
}

type WebhookNotificationBody = {
  id?: string | number;
  type?: string;
  topic?: string;
  action?: string;
  entity?: string;
  data?: { id?: string | number };
};

function parseSignatureHeader(header: string | null) {
  if (!header) return null;

  const parts = Object.fromEntries(
    header
      .split(",")
      .map((segment) => segment.trim().split("="))
      .filter((pair) => pair.length === 2),
  ) as Record<string, string>;

  if (!parts.ts || !parts.v1) return null;
  return parts;
}

export function verifyMercadoPagoWebhookSignature(input: {
  signatureHeader: string | null;
  requestIdHeader: string | null;
  dataId: string | null;
}) {
  const secret = getMercadoPagoWebhookSecret();
  if (!secret) return { ok: true as const, skipped: true as const };

  // Navegador ou teste de URL do painel MP (sem x-signature) — só confirma que o endpoint existe.
  if (!input.signatureHeader) return { ok: true as const, skipped: true as const };

  const signature = parseSignatureHeader(input.signatureHeader);
  if (!signature || !input.requestIdHeader || !input.dataId) {
    return { ok: false as const, skipped: false as const };
  }

  const manifest = `id:${input.dataId};request-id:${input.requestIdHeader};ts:${signature.ts};`;
  const digest = createHmac("sha256", secret).update(manifest).digest("hex");

  try {
    const valid = timingSafeEqual(Buffer.from(digest), Buffer.from(signature.v1));
    return { ok: valid, skipped: false as const };
  } catch {
    return { ok: false as const, skipped: false as const };
  }
}

function isOrderNotification(type: string, entity?: string) {
  const normalized = type.toLowerCase();
  if (normalized.includes("order")) return true;
  if (entity?.toLowerCase() === "order") return true;
  return false;
}

export function extractMercadoPagoOrderId(request: Request, body?: WebhookNotificationBody | null) {
  const url = new URL(request.url);
  const queryId = url.searchParams.get("id") ?? url.searchParams.get("data.id");
  const queryTopic = url.searchParams.get("topic") ?? url.searchParams.get("type") ?? "";

  if (queryId && (!queryTopic || isOrderNotification(queryTopic))) {
    return String(queryId);
  }

  if (!body) return null;

  const type = String(body.type ?? body.topic ?? body.action ?? "");
  const entity = body.entity;
  const dataId = body.data?.id ?? body.id;

  if (dataId == null) return null;
  if (!isOrderNotification(type, entity)) return null;

  return String(dataId);
}

export async function readMercadoPagoWebhookBody(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return (await request.json()) as WebhookNotificationBody;
  } catch {
    return null;
  }
}