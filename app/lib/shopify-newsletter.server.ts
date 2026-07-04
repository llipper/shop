import {
  getShopDomain,
  getStorefrontClient,
  getStorefrontConfigError,
} from "./shopify-storefront.server";

const CUSTOMER_CREATE_MUTATION = `#graphql
  mutation RouhiNewsletterSubscribe($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

export async function subscribeNewsletter(email: string) {
  const shop = getShopDomain();
  const configError = getStorefrontConfigError();

  if (configError || !shop) {
    return {
      ok: false as const,
      message: configError ?? "Loja não configurada.",
    };
  }

  const client = getStorefrontClient();
  if (!client) {
    return {
      ok: false as const,
      message: "Storefront API não configurada.",
    };
  }

  try {
    const { data, errors } = await client.request(CUSTOMER_CREATE_MUTATION, {
      variables: {
        input: {
          email: email.trim(),
          acceptsMarketing: true,
        },
      },
    });

    if (errors) {
      const message =
        errors.message ??
        errors.graphQLErrors?.[0]?.message ??
        "Não foi possível concluir a inscrição.";
      return { ok: false as const, message };
    }

    const payload = data?.customerCreate;
    const userError = payload?.customerUserErrors?.[0];

    if (userError) {
      if (userError.code === "CUSTOMER_DISABLED") {
        return {
          ok: false as const,
          message: "Este e-mail não pode ser inscrito no momento.",
        };
      }

      if (userError.code === "TAKEN" || userError.message?.includes("taken")) {
        return {
          ok: true as const,
          message: "Você já está inscrito na nossa newsletter.",
        };
      }

      return {
        ok: false as const,
        message: userError.message ?? "Não foi possível concluir a inscrição.",
      };
    }

    return {
      ok: true as const,
      message: "Inscrição confirmada! Em breve você receberá novidades da ROUHI.",
    };
  } catch {
    return {
      ok: false as const,
      message: "Erro ao conectar com a loja. Tente novamente em instantes.",
    };
  }
}