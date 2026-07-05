import type { ActionFunctionArgs } from "react-router";
import { data } from "react-router";
import { sendContactMessage } from "@/lib/contact.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !subject || !message) {
    return data({ ok: false, message: "Preencha todos os campos." }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return data({ ok: false, message: "Informe um e-mail válido." }, { status: 400 });
  }

  const result = await sendContactMessage({ name, email, subject, message });
  return data(result, { status: result.ok ? 200 : 422 });
}