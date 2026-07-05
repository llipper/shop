import type { LoaderFunctionArgs } from "react-router";
import { data } from "react-router";
import { lookupCep } from "@/lib/cep.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const zip = url.searchParams.get("zip") ?? url.searchParams.get("cep") ?? "";

  if (!zip.trim()) {
    return data({ ok: false, message: "Informe o CEP." }, { status: 400 });
  }

  const result = await lookupCep(zip);
  return data(result, { status: result.ok ? 200 : result.message === "CEP não encontrado." ? 404 : 422 });
}