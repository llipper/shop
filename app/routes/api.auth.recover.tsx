import type { ActionFunctionArgs } from "react-router";
import { data } from "react-router";
import { recoverCustomerPassword } from "@/lib/shopify-customer.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return data({ ok: false, message: "Informe seu e-mail." }, { status: 400 });
  }

  const result = await recoverCustomerPassword(email);
  return data(result, { status: result.ok ? 200 : 422 });
}