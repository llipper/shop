"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const faqData = [
  {
    q: "Quais são as formas de pagamento aceitas?",
    a: "Aceitamos cartões de crédito (Visa, Mastercard, Elo, American Express), PIX com confirmação instantânea e boleto bancário (compensação em até 3 dias úteis).",
  },
  {
    q: "Como funciona a política de trocas?",
    a: "Você pode solicitar a troca ou devolução gratuita de qualquer produto em até 7 dias corridos após o recebimento. O produto deve estar em estado novo, com etiquetas fixadas e na embalagem original.",
  },
  {
    q: "Qual é o prazo de entrega?",
    a: "O prazo varia conforme sua localidade e o frete escolhido. O PAC costuma levar de 7 a 12 dias úteis, enquanto o SEDEX entrega em até 3 dias úteis nas principais capitais.",
  },
  {
    q: "Os produtos têm garantia?",
    a: "Sim, todos os nossos produtos possuem garantia de 90 dias contra defeitos de fabricação.",
  },
  {
    q: "Como faço para rastrear o meu pedido?",
    a: "Assim que o pedido for despachado, você receberá um código de rastreamento por e-mail. Você também pode rastreá-lo na página Rastrear Pedido.",
  },
];

export function FaqPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-medium text-foreground mb-2">Perguntas Frequentes (FAQ)</h1>
        <p className="text-muted-foreground">Tire suas dúvidas rapidamente sobre o funcionamento da nossa loja.</p>
      </div>

      <Accordion type="single" collapsible className="border-t border-border">
        {faqData.map((item, idx) => (
          <AccordionItem key={idx} value={`item-${idx}`} className="border-b border-border py-2">
            <AccordionTrigger className="text-base text-foreground font-medium hover:no-underline">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pt-1 pb-4 leading-relaxed">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}