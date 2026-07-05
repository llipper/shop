import type { ActionFunctionArgs } from "react-router";
import { data } from "react-router";
import { calculateShipping } from "@/lib/shipping";
import {
  buildPaymentReference,
  getMercadoPagoConfigError,
  getMercadoPagoPublicKey,
} from "@/lib/mercadopago.server";
import { createDraftOrder, getShopifyAdminConfigError } from "@/lib/shopify-order.server";
import { isValidBrazilPhone, isValidCpf } from "@/lib/br-format";
import type { CheckoutPreparePayload, CheckoutShippingAddress } from "@/types/checkout";

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateShipping(shipping: CheckoutShippingAddress): string | null {
  if (!shipping.firstName.trim() || !shipping.lastName.trim()) {
    return "Informe nome e sobrenome.";
  }
  if (!validateEmail(shipping.email)) {
    return "Informe um e-mail válido.";
  }
  if (!isValidBrazilPhone(shipping.phone)) {
    return "Informe um telefone válido com DDD.";
  }
  if (!isValidCpf(shipping.document)) {
    return "Informe um CPF válido.";
  }
  if (shipping.zip.replace(/\D/g, "").length !== 8) {
    return "Informe um CEP válido.";
  }
  if (!shipping.address1.trim() || !shipping.number.trim()) {
    return "Informe endereço e número.";
  }
  if (!shipping.neighborhood.trim() || !shipping.city.trim() || !shipping.state.trim()) {
    return "Informe bairro, cidade e estado.";
  }
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return data({ ok: false, message: "Método não permitido." }, { status: 405 });
  }

  let body: CheckoutPreparePayload;
  try {
    body = (await request.json()) as CheckoutPreparePayload;
  } catch {
    return data({ ok: false, message: "Payload inválido." }, { status: 400 });
  }

  const mpError = getMercadoPagoConfigError();
  if (mpError) {
    return data({ ok: false, message: mpError }, { status: 503 });
  }

  const adminError = getShopifyAdminConfigError();
  if (adminError) {
    return data({ ok: false, message: adminError }, { status: 503 });
  }

  if (!body.items?.length) {
    return data({ ok: false, message: "Carrinho vazio." }, { status: 400 });
  }

  const invalidItem = body.items.find(
    (item) => !item.variantId || item.quantity < 1 || item.unitPrice <= 0,
  );
  if (invalidItem) {
    return data({ ok: false, message: "Itens do carrinho inválidos." }, { status: 400 });
  }

  const shippingError = validateShipping(body.shipping);
  if (shippingError) {
    return data({ ok: false, message: shippingError }, { status: 400 });
  }

  const subtotal = body.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const shippingCost = calculateShipping(subtotal);

  const draftResult = await createDraftOrder(body.items, body.shipping, shippingCost);
  if (!draftResult.ok) {
    return data({ ok: false, message: draftResult.message }, { status: 422 });
  }

  const reference = buildPaymentReference(draftResult.draftOrderId);
  const publicKey = getMercadoPagoPublicKey();

  return data({
    ok: true,
    draftOrderId: draftResult.draftOrderId,
    draftOrderName: draftResult.draftOrderName,
    amount: draftResult.total,
    subtotal,
    shippingCost,
    reference,
    publicKey,
  });
}