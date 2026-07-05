export function getMercadoPagoClientErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (Array.isArray(error)) {
    const first = error[0] as { message?: string; description?: string } | undefined;
    return first?.message ?? first?.description ?? "Cartão recusado. Verifique os dados.";
  }

  if (error && typeof error === "object") {
    const record = error as {
      message?: string;
      error?: string;
      cause?: Array<{ description?: string; message?: string }>;
    };

    if (record.cause?.[0]?.description) return record.cause[0].description;
    if (record.cause?.[0]?.message) return record.cause[0].message;
    if (record.message) return record.message;
    if (record.error) return record.error;
  }

  return "Não foi possível tokenizar o cartão. Verifique os dados ou desative bloqueadores.";
}