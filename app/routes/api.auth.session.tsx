import type { ActionFunctionArgs } from "react-router";
import { data } from "react-router";
import { fetchCustomerProfile, profileToStoreUser } from "@/lib/shopify-customer.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const accessToken = String(formData.get("accessToken") ?? "").trim();

  if (!accessToken) {
    return data({ ok: false, message: "Sessão inválida." }, { status: 401 });
  }

  const profileResult = await fetchCustomerProfile(accessToken);
  if (!profileResult.ok || !profileResult.profile) {
    return data(
      { ok: false, message: profileResult.message ?? "Sessão expirada." },
      { status: 401 },
    );
  }

  return data({
    ok: true,
    user: profileToStoreUser(profileResult.profile),
    orders: profileResult.profile.orders,
    addresses: profileResult.profile.addresses,
  });
}