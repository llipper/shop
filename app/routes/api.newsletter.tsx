import type { ActionFunctionArgs } from "react-router";
import { data } from "react-router";
import { subscribeNewsletter } from "@/lib/shopify-newsletter.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const consent = formData.get("consent") === "true";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return data(
      { ok: false, message: "Informe um e-mail válido." },
      { status: 400 },
    );
  }

  if (!consent) {
    return data(
      {
        ok: false,
        message: "É necessário aceitar a Política de Privacidade para se inscrever.",
      },
      { status: 400 },
    );
  }

  const result = await subscribeNewsletter(email);
  return data(result, { status: result.ok ? 200 : 422 });
}