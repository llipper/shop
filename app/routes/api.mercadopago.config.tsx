import type { LoaderFunctionArgs } from "react-router";
import { data } from "react-router";
import {
  getMercadoPagoConfigError,
  getMercadoPagoIntegrationMeta,
} from "@/lib/mercadopago.server";
import { getMercadoPagoWebhookSecret } from "@/lib/mercadopago-webhook.server";

export async function loader(_args: LoaderFunctionArgs) {
  const configError = getMercadoPagoConfigError();
  const meta = getMercadoPagoIntegrationMeta();

  return data({
    ok: !configError,
    message: configError,
    webhookUrl: meta.webhookUrl,
    webhookEvent: meta.webhookEvent,
    notifications: meta.notifications,
    webhookSecretConfigured: Boolean(getMercadoPagoWebhookSecret()),
    orderApiFields: {
      supported: [
        "type",
        "external_reference",
        "processing_mode",
        "total_amount",
        "payer",
        "items.title",
        "items.unit_price",
        "items.quantity",
        "transactions.payments",
      ],
      notSupported: ["notification_url", "description", "items.unit_measure"],
    },
  });
}