import type { CustomerOrder, CustomerProfile } from "@/types/customer";
import { formatPrice } from "@/lib/format";
import {
  getStorefrontClient,
  getStorefrontConfigError,
} from "./shopify-storefront.server";

type CustomerUserError = {
  code?: string;
  field?: string[];
  message: string;
};

const CUSTOMER_CREATE = `#graphql
  mutation RouhiCustomerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer { id email firstName lastName }
      customerUserErrors { code field message }
    }
  }
`;

const CUSTOMER_ACCESS_TOKEN_CREATE = `#graphql
  mutation RouhiCustomerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken { accessToken expiresAt }
      customerUserErrors { code field message }
    }
  }
`;

const CUSTOMER_UPDATE = `#graphql
  mutation RouhiCustomerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
    customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
      customer { id firstName lastName email phone }
      customerUserErrors { field message }
    }
  }
`;

const CUSTOMER_RECOVER = `#graphql
  mutation RouhiCustomerRecover($email: String!) {
    customerRecover(email: $email) {
      customerUserErrors { field message }
    }
  }
`;

const CUSTOMER_QUERY = `#graphql
  query RouhiCustomer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      firstName
      lastName
      email
      phone
      createdAt
      addresses(first: 10) {
        edges {
          node {
            id
            address1
            city
            province
            country
            zip
            phone
            firstName
            lastName
          }
        }
      }
      orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            name
            orderNumber
            processedAt
            financialStatus
            fulfillmentStatus
            statusUrl
            totalPrice { amount currencyCode }
            successfulFulfillments(first: 5) {
              trackingCompany
              trackingInfo { number url }
            }
          }
        }
      }
    }
  }
`;

function getFirstUserError(errors: CustomerUserError[] | undefined) {
  return errors?.[0]?.message ?? null;
}

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: "Cliente", lastName: "ROUHI" };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "ROUHI" };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function mapCustomer(node: Record<string, unknown>): CustomerProfile {
  const customer = node as {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    createdAt: string;
    addresses?: {
      edges: Array<{
        node: {
          id: string;
          address1: string;
          city: string;
          province: string;
          country: string;
          zip: string;
          phone: string | null;
          firstName: string;
          lastName: string;
        };
      }>;
    };
    orders?: {
      edges: Array<{
        node: {
          id: string;
          name: string;
          orderNumber: number;
          processedAt: string;
          financialStatus: string;
          fulfillmentStatus: string;
          statusUrl: string;
          totalPrice: { amount: string; currencyCode: string };
          successfulFulfillments: Array<{
            trackingCompany: string | null;
            trackingInfo: Array<{ number: string; url: string | null }>;
          }>;
        };
      }>;
    };
  };

  const orders: CustomerOrder[] = (customer.orders?.edges ?? []).map(({ node: order }) => ({
    id: order.id,
    name: order.name,
    orderNumber: order.orderNumber,
    processedAt: order.processedAt,
    financialStatus: order.financialStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    statusUrl: order.statusUrl,
    totalLabel: formatPrice(
      Number.parseFloat(order.totalPrice.amount),
      order.totalPrice.currencyCode,
    ),
    tracking: (order.successfulFulfillments ?? []).flatMap((fulfillment) =>
      (fulfillment.trackingInfo ?? []).map((info) => ({
        company: fulfillment.trackingCompany ?? "Transportadora",
        number: info.number,
        url: info.url,
      })),
    ),
  }));

  return {
    id: customer.id,
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    phone: customer.phone,
    createdAt: customer.createdAt,
    addresses: (customer.addresses?.edges ?? []).map(({ node }) => node),
    orders,
  };
}

function getClientOrError() {
  const configError = getStorefrontConfigError();
  const client = getStorefrontClient();
  if (configError || !client) {
    return { client: null, error: configError ?? "Storefront API não configurada." };
  }
  return { client, error: null };
}

export async function createCustomerAccessToken(email: string, password: string) {
  const { client, error } = getClientOrError();
  if (!client) return { ok: false as const, message: error };

  try {
    const { data, errors } = await client.request(CUSTOMER_ACCESS_TOKEN_CREATE, {
      variables: {
        input: { email: email.trim(), password },
      },
    });

    if (errors) {
      return {
        ok: false as const,
        message: errors.message ?? "Não foi possível entrar. Verifique e-mail e senha.",
      };
    }

    const userError = getFirstUserError(data?.customerAccessTokenCreate?.customerUserErrors);
    if (userError) {
      return { ok: false as const, message: userError };
    }

    const token = data?.customerAccessTokenCreate?.customerAccessToken;
    if (!token?.accessToken) {
      return { ok: false as const, message: "Credenciais inválidas." };
    }

    return {
      ok: true as const,
      accessToken: token.accessToken as string,
      expiresAt: token.expiresAt as string,
    };
  } catch {
    return { ok: false as const, message: "Erro ao conectar com a loja. Tente novamente." };
  }
}

export async function registerShopifyCustomer(input: {
  name: string;
  email: string;
  password: string;
  acceptsMarketing?: boolean;
}) {
  const { client, error } = getClientOrError();
  if (!client) return { ok: false as const, message: error };

  const { firstName, lastName } = splitFullName(input.name);

  try {
    const { data, errors } = await client.request(CUSTOMER_CREATE, {
      variables: {
        input: {
          firstName,
          lastName,
          email: input.email.trim(),
          password: input.password,
          acceptsMarketing: input.acceptsMarketing ?? true,
        },
      },
    });

    if (errors) {
      return {
        ok: false as const,
        message: errors.message ?? "Não foi possível criar a conta.",
      };
    }

    const userError = getFirstUserError(data?.customerCreate?.customerUserErrors);
    if (userError) {
      if (userError.toLowerCase().includes("taken")) {
        return {
          ok: false as const,
          message: "Este e-mail já possui conta. Faça login ou recupere a senha.",
        };
      }
      return { ok: false as const, message: userError };
    }

    return createCustomerAccessToken(input.email, input.password);
  } catch {
    return { ok: false as const, message: "Erro ao criar conta. Tente novamente." };
  }
}

export async function fetchCustomerProfile(accessToken: string) {
  const { client, error } = getClientOrError();
  if (!client) return { ok: false as const, message: error, profile: null };

  try {
    const { data, errors } = await client.request(CUSTOMER_QUERY, {
      variables: { customerAccessToken: accessToken },
    });

    if (errors) {
      return {
        ok: false as const,
        message: errors.message ?? "Sessão inválida.",
        profile: null,
      };
    }

    if (!data?.customer) {
      return { ok: false as const, message: "Sessão expirada. Entre novamente.", profile: null };
    }

    return { ok: true as const, profile: mapCustomer(data.customer) };
  } catch {
    return { ok: false as const, message: "Erro ao carregar sua conta.", profile: null };
  }
}

export async function updateCustomerProfile(
  accessToken: string,
  input: { name?: string; phone?: string },
) {
  const { client, error } = getClientOrError();
  if (!client) return { ok: false as const, message: error };

  const customer: Record<string, string> = {};
  if (input.name) {
    const { firstName, lastName } = splitFullName(input.name);
    customer.firstName = firstName;
    customer.lastName = lastName;
  }
  if (input.phone !== undefined) {
    customer.phone = input.phone;
  }

  try {
    const { data, errors } = await client.request(CUSTOMER_UPDATE, {
      variables: {
        customerAccessToken: accessToken,
        customer,
      },
    });

    if (errors) {
      return { ok: false as const, message: errors.message ?? "Não foi possível salvar." };
    }

    const userError = getFirstUserError(data?.customerUpdate?.customerUserErrors);
    if (userError) {
      return { ok: false as const, message: userError };
    }

    return fetchCustomerProfile(accessToken);
  } catch {
    return { ok: false as const, message: "Erro ao atualizar dados." };
  }
}

export async function recoverCustomerPassword(email: string) {
  const { client, error } = getClientOrError();
  if (!client) return { ok: false as const, message: error };

  try {
    const { data, errors } = await client.request(CUSTOMER_RECOVER, {
      variables: { email: email.trim() },
    });

    if (errors) {
      return { ok: false as const, message: errors.message ?? "Não foi possível enviar o e-mail." };
    }

    const userError = getFirstUserError(data?.customerRecover?.customerUserErrors);
    if (userError) {
      return { ok: false as const, message: userError };
    }

    return {
      ok: true as const,
      message: "Se o e-mail existir na loja, você receberá instruções para redefinir a senha.",
    };
  } catch {
    return { ok: false as const, message: "Erro ao solicitar recuperação de senha." };
  }
}

export function profileToStoreUser(profile: CustomerProfile) {
  return {
    name: `${profile.firstName} ${profile.lastName}`.trim(),
    email: profile.email,
    phone: profile.phone ?? undefined,
    memberSince: profile.createdAt,
  };
}