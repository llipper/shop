import type { LoaderFunctionArgs } from "react-router";
import { data } from "react-router";
import {
  getMercadoPagoConfigError,
  getMercadoPagoIntegrationMeta,
  isMercadoPagoSandboxAccount,
} from "@/lib/mercadopago.server";
import { getMercadoPagoWebhookSecret } from "@/lib/mercadopago-webhook.server";
import { getPublicStorefrontOrigin } from "@/lib/storefront-url.server";

export async function loader(_args: LoaderFunctionArgs) {
  const configError = getMercadoPagoConfigError();
  const meta = getMercadoPagoIntegrationMeta();
  const sandboxAccount = await isMercadoPagoSandboxAccount();

  return data({
    ok: !configError,
    message: configError,
    publicStorefrontUrl: getPublicStorefrontOrigin(),
    testModeEnv: process.env.MERCADOPAGO_TEST_MODE ?? "unset",
    sandboxAccount,
    payerEmailSandbox: sandboxAccount
      ? "E-mails de comprador viram *@testuser.com automaticamente."
      : null,
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