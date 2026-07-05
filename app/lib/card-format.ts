export function getCardDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, 16);
}

export function formatCardNumberInput(value: string) {
  const digits = getCardDigits(value);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function formatCardExpiryInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function parseCardExpiry(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 4) return null;

  const month = digits.slice(0, 2);
  const year = digits.slice(2, 4);
  const monthNum = Number(month);

  if (monthNum < 1 || monthNum > 12) return null;

  return { month, year, fullYear: `20${year}` };
}