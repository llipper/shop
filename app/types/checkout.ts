export type CheckoutLineItem = {
  variantId: string;
  quantity: number;
  title: string;
  size: string;
  colorName: string;
  unitPrice: number;
};

export type CheckoutShippingAddress = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  document: string;
  zip: string;
  address1: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
};

export type CheckoutPreparePayload = {
  items: CheckoutLineItem[];
  shipping: CheckoutShippingAddress;
};

export type CheckoutPrepareResult = {
  ok: boolean;
  message?: string;
  draftOrderId?: string;
  draftOrderName?: string;
  amount?: number;
  subtotal?: number;
  shippingCost?: number;
  reference?: string;
  publicKey?: string;
};