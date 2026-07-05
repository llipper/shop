import type { MetaFunction } from "react-router";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { LegalPage } from "@/components/pages/legal-page";
import { buildMetaTags } from "@/lib/seo";

export const meta: MetaFunction = ({ matches }) =>
  buildMetaTags({
    title: "Termos de Serviço",
    description: "Termos de uso do site e loja online da ROCCIUS.",
    path: "/termos",
    noIndex: true,
    matches,
  });

export default function TermosRoute() {
  return (
    <StorefrontShell>
      <LegalPage
        title="Termos de Serviço"
        intro="Ao utilizar o site da ROCCIUS, você concorda com os termos abaixo. Leia com atenção antes de realizar compras ou criar conta."
        sections={[
          {
            title: "1. Sobre a loja",
            paragraphs: [
              "A ROCCIUS opera como loja online de moda e lifestyle. Produtos, preços, estoque e promoções podem ser alterados sem aviso prévio.",
            ],
          },
          {
            title: "2. Compras e pagamento",
            paragraphs: [
              "O checkout de pagamento é processado de forma segura pela Shopify. Ao concluir a compra, você confirma que os dados informados são verdadeiros.",
              "Pedidos podem ser cancelados em caso de indisponibilidade de estoque, com reembolso conforme política vigente.",
            ],
          },
          {
            title: "3. Entregas, trocas e devoluções",
            paragraphs: [
              "Prazos e condições de envio estão descritos na página de Suporte. Trocas e devoluções seguem o Código de Defesa do Consumidor e nossa política de atendimento.",
            ],
          },
          {
            title: "4. Conta e comunicações",
            paragraphs: [
              "Você é responsável por manter suas credenciais em segurança. Comunicações de marketing são enviadas apenas com consentimento e podem ser canceladas a qualquer momento.",
            ],
          },
          {
            title: "5. Propriedade intelectual",
            paragraphs: [
              "Marcas, imagens, textos e layout do site pertencem à ROCCIUS ou a seus licenciadores. É proibida a reprodução sem autorização.",
            ],
          },
          {
            title: "6. Contato",
            paragraphs: [
              "Dúvidas sobre estes termos: suporte@roccius.com.br",
              "Última atualização: julho de 2026.",
            ],
          },
        ]}
      />
    </StorefrontShell>
  );
}