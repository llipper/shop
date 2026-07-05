export type CepLookupResult = {
  ok: boolean;
  message?: string;
  zip?: string;
  address1?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  source?: "brasilapi" | "viacep";
};

function normalizeZip(rawZip: string): string | null {
  const zip = rawZip.replace(/\D/g, "");
  return zip.length === 8 ? zip : null;
}

function formatZip(zip: string) {
  return `${zip.slice(0, 5)}-${zip.slice(5)}`;
}

async function fetchFromBrasilApi(zip: string): Promise<CepLookupResult | null> {
  try {
    const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${zip}`, {
      headers: { Accept: "application/json" },
    });

    if (response.status === 404) {
      return { ok: false, message: "CEP não encontrado." };
    }

    if (!response.ok) return null;

    const data = (await response.json()) as {
      cep?: string;
      state?: string;
      city?: string;
      neighborhood?: string;
      street?: string;
    };

    return {
      ok: true,
      zip: data.cep ? formatZip(data.cep.replace(/\D/g, "")) : formatZip(zip),
      address1: data.street ?? "",
      neighborhood: data.neighborhood ?? "",
      city: data.city ?? "",
      state: data.state ?? "",
      source: "brasilapi",
    };
  } catch {
    return null;
  }
}

async function fetchFromViaCep(zip: string): Promise<CepLookupResult | null> {
  try {
    const response = await fetch(`https://viacep.com.br/ws/${zip}/json/`);
    if (!response.ok) return null;

    const data = (await response.json()) as {
      erro?: boolean;
      cep?: string;
      logradouro?: string;
      bairro?: string;
      localidade?: string;
      uf?: string;
    };

    if (data.erro) {
      return { ok: false, message: "CEP não encontrado." };
    }

    return {
      ok: true,
      zip: data.cep ?? formatZip(zip),
      address1: data.logradouro ?? "",
      neighborhood: data.bairro ?? "",
      city: data.localidade ?? "",
      state: data.uf ?? "",
      source: "viacep",
    };
  } catch {
    return null;
  }
}

export async function lookupCep(rawZip: string): Promise<CepLookupResult> {
  const zip = normalizeZip(rawZip);
  if (!zip) {
    return { ok: false, message: "Informe um CEP válido com 8 dígitos." };
  }

  const brasilApi = await fetchFromBrasilApi(zip);
  if (brasilApi?.ok) return brasilApi;
  if (brasilApi && !brasilApi.ok) return brasilApi;

  const viaCep = await fetchFromViaCep(zip);
  if (viaCep) return viaCep;

  return { ok: false, message: "Não foi possível consultar o CEP agora." };
}