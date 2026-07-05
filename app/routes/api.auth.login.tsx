import type { ActionFunctionArgs } from "react-router";
import { data } from "react-router";
import {
  createCustomerAccessToken,
  fetchCustomerProfile,
  profileToStoreUser,
} from "@/lib/shopify-customer.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return data({ ok: false, message: "Informe e-mail e senha." }, { status: 400 });
  }

  const tokenResult = await createCustomerAccessToken(email, password);
  if (!tokenResult.ok) {
    return data({ ok: false, message: tokenResult.message }, { status: 401 });
  }

  const profileResult = await fetchCustomerProfile(tokenResult.accessToken);
  if (!profileResult.ok || !profileResult.profile) {
    return data(
      { ok: false, message: profileResult.message ?? "Não foi possível carregar a conta." },
      { status: 500 },
    );
  }

  return data({
    ok: true,
    accessToken: tokenResult.accessToken,
    expiresAt: tokenResult.expiresAt,
    user: profileToStoreUser(profileResult.profile),
    orders: profileResult.profile.orders,
    addresses: profileResult.profile.addresses,
  });
}