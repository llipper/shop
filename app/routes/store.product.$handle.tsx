import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useLoaderData } from "react-router";
import { Header } from "@/components/layout/header";
import { ProductOverview } from "@/components/product/product-overview";
import { formatPrice } from "@/lib/format";
import { fetchShopifyProductByHandle } from "@/lib/shopify-products.server";
import {
  getProductShareDescription,
  getSiteOrigin,
  toAbsoluteUrl,
} from "@/lib/share-url";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const handle = params.handle;
  if (!handle) {
    return { product: null, error: "Produto inválido." };
  }
  return fetchShopifyProductByHandle(handle);
};

export const meta: MetaFunction<typeof loader> = ({ data, location }) => {
  const product = data?.product;
  const origin = getSiteOrigin();
  const pageUrl = toAbsoluteUrl(location.pathname, origin);

  if (!product) {
    return [{ title: "Produto | Papirar" }];
  }

  const image = toAbsoluteUrl(product.image, origin);
  const priceLabel = formatPrice(product.price, product.currencyCode);
  const description =
    product.description?.trim().slice(0, 180) ||
    getProductShareDescription(product.title, product.category, priceLabel);

  return [
    { title: `${product.title} | Papirar` },
    { name: "description", content: description },
    { property: "og:site_name", content: "Papirar" },
    { property: "og:title", content: product.title },
    { property: "og:description", content: description },
    { property: "og:image", content: image },
    { property: "og:url", content: pageUrl },
    { property: "og:type", content: "website" },
    { property: "og:locale", content: "pt_BR" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: product.title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];
};

export default function StoreProductPage() {
  const { product, error } = useLoaderData<typeof loader>();

  if (error || !product) {
    return (
      <main className="min-h-screen bg-background pt-32 text-center">
        <Header />
        <p className="text-muted-foreground">
          {error ?? "Produto não encontrado."}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-24 font-sans text-foreground lg:pb-0">
      <Header />
      <ProductOverview product={product} />
    </main>
  );
};