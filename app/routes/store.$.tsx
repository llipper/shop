import type { MetaFunction } from "react-router";
import { data } from "react-router";
import { NotFoundPage } from "@/components/pages/not-found-page";

export const loader = async () => {
  return data(null, { status: 404 });
};

export const meta: MetaFunction = () => [
  { title: "Página não encontrada | ROUHI" },
  { name: "robots", content: "noindex" },
];

export default function StoreNotFoundRoute() {
  return <NotFoundPage />;
}