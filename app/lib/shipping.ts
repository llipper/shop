const FREE_SHIPPING_MIN = 200;
const STANDARD_SHIPPING = 18.9;

export function calculateShipping(subtotal: number): number {
  if (subtotal >= FREE_SHIPPING_MIN) return 0;
  return STANDARD_SHIPPING;
}

export function getShippingLabel(cost: number): string {
  if (cost === 0) return "Frete grátis";
  return "Frete padrão";
}