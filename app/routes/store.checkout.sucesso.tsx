import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { CheckoutSuccessPage } from "@/components/pages/checkout-success-page";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  return {
    orderName: url.searchParams.get("order") ?? url.searchParams.get("order_number"),
    orderId: url.searchParams.get("order_id") ?? url.searchParams.get("checkout_id"),
    email: url.searchParams.get("email") ?? url.searchParams.get("customer_email"),
  };
};

export default function CheckoutSuccessRoute() {
  const data = useLoaderData<typeof loader>();
  return <CheckoutSuccessPage {...data} />;
}