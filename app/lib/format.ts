export function formatPrice(value: number, currency = "BRL"): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatInstallments(value: number, count = 3): string {
  const installment = value / count;
  return `${count}x de ${formatPrice(installment)} sem juros`;
}