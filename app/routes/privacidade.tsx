import type { MetaFunction } from "react-router";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { LegalPage } from "@/components/pages/legal-page";
import { buildMetaTags } from "@/lib/seo";

export const meta: MetaFunction = ({ matches }) =>
  buildMetaTags({
    title: "Política de Privacidade",
    description:
      "Saiba como a ROUHI coleta, usa e protege seus dados pessoais em conformidade com a LGPD.",
    path: "/privacidade",
    noIndex: true,
    matches,
  });

export default function PrivacidadeRoute() {
  return (
    <StorefrontShell>
      <LegalPage
        title="Política de Privacidade"
        intro="Esta política explica como a ROUHI trata dados pessoais em nosso site e em comunicações de marketing, em conformidade com a Lei Geral de Proteção de Dados (LGPD)."
        sections={[
          {
            title: "1. Dados que coletamos",
            paragraphs: [
              "Podemos coletar nome, e-mail, telefone, endereço, histórico de pedidos e preferências de navegação quando você cria conta, finaliza compra, entra em contato ou assina a newsletter.",
              "Também registramos cookies essenciais e, com seu consentimento, cookies de experiência e marketing.",
            ],
          },
          {
            title: "2. Finalidade do tratamento",
            paragraphs: [
              "Utilizamos seus dados para processar pedidos, prestar suporte, enviar comunicações solicitadas, melhorar o site e cumprir obrigações legais.",
              "A inscrição na newsletter só ocorre com consentimento explícito e pode ser cancelada a qualquer momento.",
            ],
          },
          {
            title: "3. Compartilhamento",
            paragraphs: [
              "Seus dados podem ser compartilhados com provedores necessários à operação da loja, como Shopify (pagamentos e checkout), hospedagem e ferramentas de e-mail marketing, sempre dentro dos limites legais.",
            ],
          },
          {
            title: "4. Seus direitos (LGPD)",
            paragraphs: [
              "Você pode solicitar acesso, correção, exclusão, portabilidade, revogação de consentimento ou informações sobre o uso dos seus dados pelo e-mail suporte@rouhi.com.br.",
              "Responderemos às solicitações dentro dos prazos previstos em lei.",
            ],
          },
          {
            title: "5. Cookies",
            paragraphs: [
              "Cookies essenciais garantem funcionamento do carrinho, sessão e preferências. Outros cookies só são ativados após sua escolha no banner de consentimento.",
            ],
          },
          {
            title: "6. Contato",
            paragraphs: [
              "Encarregado/DPO: suporte@rouhi.com.br",
              "Última atualização: julho de 2026.",
            ],
          },
        ]}
      />
    </StorefrontShell>
  );
}