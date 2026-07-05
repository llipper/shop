import type { ActionFunctionArgs } from "react-router";
import { data } from "react-router";
import {
  fetchCustomerProfile,
  profileToStoreUser,
  registerShopifyCustomer,
} from "@/lib/shopify-customer.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    return data({ ok: false, message: "Preencha todos os campos." }, { status: 400 });
  }

  if (password.length < 8) {
    return data(
      { ok: false, message: "A senha deve ter pelo menos 8 caracteres." },
      { status: 400 },
    );
  }

  const registerResult = await registerShopifyCustomer({ name, email, password });
  if (!registerResult.ok || !("accessToken" in registerResult)) {
    return data(
      { ok: false, message: registerResult.message ?? "Não foi possível criar a conta." },
      { status: 422 },
    );
  }

  const profileResult = await fetchCustomerProfile(registerResult.accessToken);
  if (!profileResult.ok || !profileResult.profile) {
    return data(
      { ok: false, message: profileResult.message ?? "Conta criada, mas não foi possível entrar." },
      { status: 500 },
    );
  }

  return data({
    ok: true,
    accessToken: registerResult.accessToken,
    expiresAt: registerResult.expiresAt,
    user: profileToStoreUser(profileResult.profile),
    orders: profileResult.profile.orders,
    addresses: profileResult.profile.addresses,
  });
}