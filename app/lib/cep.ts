export function getZipDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 8);
}

export function formatZipInput(value: string): string {
  const digits = getZipDigits(value);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function isValidZip(value: string): boolean {
  return getZipDigits(value).length === 8;
}