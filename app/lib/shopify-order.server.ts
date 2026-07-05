import type { CheckoutLineItem, CheckoutShippingAddress } from "@/types/checkout";
import { getShippingLabel } from "@/lib/shipping";
import { variantIdToNumeric } from "@/lib/shopify-cart";
import { getShopDomain } from "@/lib/shopify-storefront.server";

const API_VERSION = "2025-10";

function getAdminAccessToken(): string | null {
  return process.env.SHOPIFY_ADMIN_ACCESS_TOKEN?.trim() || null;
}

export function getShopifyAdminConfigError(): string | null {
  if (!getShopDomain()) {
    return "Defina SHOP_STORE_DOMAIN no .env.";
  }
  if (!getAdminAccessToken()) {
    return "Defina SHOPIFY_ADMIN_ACCESS_TOKEN no .env (app customizado no admin Shopify).";
  }
  return null;
}

async function adminGraphql<T>(query: string, variables?: Record<string, unknown>) {
  const shop = getShopDomain();
  const token = getAdminAccessToken();
  if (!shop || !token) {
    throw new Error("Shopify Admin API não configurada.");
  }

  const response = await fetch(`https://${shop}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = (await response.json()) as {
    data?: T;
    errors?: Array<{ message: string }>;
  };

  if (!response.ok || payload.errors?.length) {
    const message =
      payload.errors?.map((error) => error.message).join(" ") ??
      "Erro na Admin API da Shopify.";
    throw new Error(message);
  }

  return payload.data as T;
}

function toVariantGid(variantId: string): string | null {
  if (variantId.startsWith("gid://shopify/ProductVariant/")) {
    return variantId;
  }
  const numeric = variantIdToNumeric(variantId);
  return numeric ? `gid://shopify/ProductVariant/${numeric}` : null;
}

function formatPhoneForShopify(phone: string): string {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, "");

  if (!digits) return trimmed;

  if (trimmed.startsWith("+")) {
    return `+${digits}`;
  }

  if (digits.startsWith("55") && digits.length >= 12) {
    return `+${digits}`;
  }

  if (digits.length === 10 || digits.length === 11) {
    return `+55${digits}`;
  }

  return `+${digits}`;
}

function buildAddress(shipping: CheckoutShippingAddress) {
  const address1 = [shipping.address1, shipping.number, shipping.complement]
    .filter(Boolean)
    .join(", ");

  const phone = formatPhoneForShopify(shipping.phone);

  return {
    firstName: shipping.firstName,
    lastName: shipping.lastName,
    address1,
    address2: shipping.neighborhood,
    city: shipping.city,
    province: shipping.state,
    country: "BR",
    zip: shipping.zip.replace(/\D/g, ""),
    phone,
  };
}

const DRAFT_ORDER_CREATE = `#graphql
  mutation RouhiDraftOrderCreate($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder {
        id
        name
        totalPrice
      }
      userErrors { field message }
    }
  }
`;

const DRAFT_ORDER_COMPLETE = `#graphql
  mutation RouhiDraftOrderComplete($id: ID!) {
    draftOrderComplete(id: $id, paymentPending: false) {
      draftOrder {
        id
        name
        order { id name }
      }
      userErrors { field message }
    }
  }
`;

export async function createDraftOrder(
  items: CheckoutLineItem[],
  shipping: CheckoutShippingAddress,
  shippingCost: number,
) {
  const configError = getShopifyAdminConfigError();
  if (configError) {
    return { ok: false as const, message: configError };
  }

  const lineItems = items
    .map((item) => {
      const variantId = toVariantGid(item.variantId);
      if (!variantId) return null;
      return { variantId, quantity: item.quantity };
    })
    .filter((item): item is { variantId: string; quantity: number } => Boolean(item));

  if (lineItems.length === 0) {
    return { ok: false as const, message: "Nenhuma variante válida no pedido." };
  }

  try {
    const data = await adminGraphql<{
      draftOrderCreate: {
        draftOrder: { id: string; name: string; totalPrice: string } | null;
        userErrors: Array<{ field: string[]; message: string }>;
      };
    }>(DRAFT_ORDER_CREATE, {
      input: {
        email: shipping.email,
        phone: formatPhoneForShopify(shipping.phone),
        note: `Pagamento Mercado Pago · CPF ${shipping.document}`,
        tags: ["rouhi", "mercadopago"],
        shippingAddress: buildAddress(shipping),
        billingAddress: buildAddress(shipping),
        lineItems,
        shippingLine: {
          title: getShippingLabel(shippingCost),
          price: shippingCost.toFixed(2),
        },
      },
    });

    const userError = data.draftOrderCreate.userErrors[0];
    if (userError) {
      return { ok: false as const, message: userError.message };
    }

    const draftOrder = data.draftOrderCreate.draftOrder;
    if (!draftOrder) {
      return { ok: false as const, message: "Não foi possível criar o pedido." };
    }

    return {
      ok: true as const,
      draftOrderId: draftOrder.id,
      draftOrderName: draftOrder.name,
      total: Number.parseFloat(draftOrder.totalPrice),
    };
  } catch (error) {
    return {
      ok: false as const,
      message: error instanceof Error ? error.message : "Erro ao criar pedido na Shopify.",
    };
  }
}

export async function completeDraftOrder(draftOrderId: string) {
  const configError = getShopifyAdminConfigError();
  if (configError) {
    return { ok: false as const, message: configError };
  }

  try {
    const data = await adminGraphql<{
      draftOrderComplete: {
        draftOrder: {
          id: string;
          name: string;
          order: { id: string; name: string } | null;
        } | null;
        userErrors: Array<{ field: string[]; message: string }>;
      };
    }>(DRAFT_ORDER_COMPLETE, { id: draftOrderId });

    const userError = data.draftOrderComplete.userErrors[0];
    if (userError) {
      return { ok: false as const, message: userError.message };
    }

    const order = data.draftOrderComplete.draftOrder?.order;
    return {
      ok: true as const,
      orderName: order?.name ?? data.draftOrderComplete.draftOrder?.name ?? null,
      orderId: order?.id ?? null,
    };
  } catch (error) {
    return {
      ok: false as const,
      message: error instanceof Error ? error.message : "Erro ao finalizar pedido.",
    };
  }
}