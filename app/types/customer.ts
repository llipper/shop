export type CustomerOrder = {
  id: string;
  name: string;
  orderNumber: number;
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  statusUrl: string;
  totalLabel: string;
  tracking: Array<{
    company: string;
    number: string;
    url: string | null;
  }>;
};

export type CustomerAddress = {
  id: string;
  address1: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone: string | null;
  firstName: string;
  lastName: string;
};

export type CustomerProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  createdAt: string;
  addresses: CustomerAddress[];
  orders: CustomerOrder[];
};