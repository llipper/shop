import { getPublicStorefrontOrigin } from "./storefront-url.server";
import {
  getShopDomain,
  getStorefrontClient,
  getStorefrontConfigError,
} from "./shopify-storefront.server";
import { variantIdToNumeric } from "./shopify-cart";

export type CheckoutLine = {
  variantId: string;
  quantity: number;
};

export type CheckoutOptions = {
  buyerEmail?: string;
};

const CART_CREATE_MUTATION = `#graphql
  mutation ROCCIUSCartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        checkoutUrl
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

function normalizeMerchandiseId(variantId: string): string | null {
  if (variantId.startsWith("gid://shopify/ProductVariant/")) {
    return variantId;
  }
  const numeric = variantIdToNumeric(variantId);
  return numeric ? `gid://shopify/ProductVariant/${numeric}` : null;
}

/** Remove parâmetros de preview de tema que aparecem em lojas de desenvolvimento. */
export function normalizeCheckoutUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete("preview_theme_id");

    const origin = getPublicStorefrontOrigin();
    if (origin) {
      const returnTo = `${origin}/store/checkout/sucesso`;
      parsed.searchParams.set("return_to", returnTo);
    }

    return parsed.toString();
  } catch {
    return url;
  }
}

function buildPermalinkCheckout(
  shop: string,
  lines: CheckoutLine[],
  buyerEmail?: string,
): string | null {
  const parts = lines
    .map((line) => {
      const id = variantIdToNumeric(line.variantId);
      if (!id || line.quantity < 1) return null;
      return `${id}:${line.quantity}`;
    })
    .filter((part): part is string => Boolean(part));

  if (parts.length === 0) return null;

  let url = `https://${shop}/cart/${parts.join(",")}?checkout`;
  if (buyerEmail?.trim()) {
    url += `&checkout[email]=${encodeURIComponent(buyerEmail.trim())}`;
  }
  return url;
}

function buildCartInput(
  cartLines: Array<{ merchandiseId: string; quantity: number }>,
  buyerEmail?: string,
) {
  const input: {
    lines: Array<{ merchandiseId: string; quantity: number }>;
    buyerIdentity?: { email: string; countryCode: string };
  } = { lines: cartLines };

  if (buyerEmail?.trim()) {
    input.buyerIdentity = {
      email: buyerEmail.trim(),
      countryCode: "BR",
    };
  }

  return input;
}

export async function createStorefrontCheckout(
  lines: CheckoutLine[],
  options: CheckoutOptions = {},
) {
  const buyerEmail = options.buyerEmail;
  const shop = getShopDomain();
  const configError = getStorefrontConfigError();

  if (configError || !shop) {
    return { checkoutUrl: null, error: configError ?? "Loja não configurada." };
  }

  if (lines.length === 0) {
    return { checkoutUrl: null, error: "Carrinho vazio." };
  }

  const cartLines = lines
    .map((line) => {
      const merchandiseId = normalizeMerchandiseId(line.variantId);
      if (!merchandiseId || line.quantity < 1) return null;
      return { merchandiseId, quantity: line.quantity };
    })
    .filter((line): line is { merchandiseId: string; quantity: number } =>
      Boolean(line),
    );

  if (cartLines.length === 0) {
    return {
      checkoutUrl: null,
      error: "Nenhuma variante válida no carrinho. Adicione o produto novamente.",
    };
  }

  const client = getStorefrontClient();
  if (!client) {
    return { checkoutUrl: null, error: "Storefront API não configurada." };
  }

  const permalink = buildPermalinkCheckout(shop, lines, buyerEmail);

  try {
    const { data, errors } = await client.request(CART_CREATE_MUTATION, {
      variables: {
        input: buildCartInput(cartLines, buyerEmail),
      },
    });

    if (errors) {
      return {
        checkoutUrl: permalink ? normalizeCheckoutUrl(permalink) : null,
        error: permalink ? null : errors.message ?? "Erro ao criar checkout.",
        warning: permalink ? errors.message ?? null : null,
      };
    }

    const userErrors = data?.cartCreate?.userErrors ?? [];
    if (userErrors.length > 0) {
      const message = userErrors.map((e: { message: string }) => e.message).join(" ");
      return {
        checkoutUrl: permalink ? normalizeCheckoutUrl(permalink) : null,
        error: permalink ? null : message,
        warning: permalink ? message : null,
      };
    }

    const rawUrl = data?.cartCreate?.cart?.checkoutUrl ?? permalink;
    return { checkoutUrl: rawUrl ? normalizeCheckoutUrl(rawUrl) : null, error: null };
  } catch (error) {
    return {
      checkoutUrl: permalink ? normalizeCheckoutUrl(permalink) : null,
      error: permalink
        ? null
        : error instanceof Error
          ? error.message
          : "Erro ao criar checkout.",
      warning:
        permalink && error instanceof Error ? error.message : null,
    };
  }
}