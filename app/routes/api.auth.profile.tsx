import type { ActionFunctionArgs } from "react-router";
import { data } from "react-router";
import { profileToStoreUser, updateCustomerProfile } from "@/lib/shopify-customer.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const accessToken = String(formData.get("accessToken") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!accessToken) {
    return data({ ok: false, message: "Sessão inválida." }, { status: 401 });
  }

  const result = await updateCustomerProfile(accessToken, { name, phone });
  if (!result.ok || !result.profile) {
    return data(
      { ok: false, message: result.message ?? "Não foi possível salvar." },
      { status: 422 },
    );
  }

  return data({
    ok: true,
    user: profileToStoreUser(result.profile),
    orders: result.profile.orders,
    addresses: result.profile.addresses,
  });
}