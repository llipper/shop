"use client";

import type { Product } from "@/types/product";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  getMaterialLine,
  getPremiumFallbackDescription,
  getPremiumHighlights,
  hasRichDescription,
} from "@/lib/product-content";

interface ProductStorySectionProps {
  product: Product;
}

export function ProductStorySection({ product }: ProductStorySectionProps) {
  const highlights = getPremiumHighlights(product);
  const fallbackParagraphs = getPremiumFallbackDescription(product);
  const material = getMaterialLine(product);
  const rich = hasRichDescription(product);

  return (
    <section className="border-t border-border bg-muted/20">
      <div className="mx-auto max-w-[1440px] px-6 py-16 md:px-12 md:py-24">
        <div className="mb-12 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            A peça
          </p>
          <h2 className="mt-3 text-3xl font-medium tracking-tight text-foreground md:text-4xl">
            Design pensado para durar além da estação
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <ul className="space-y-5">
              {highlights.map((item) => (
                <li
                  key={item}
                  className="border-l border-foreground/20 pl-5 text-base leading-relaxed text-foreground/90"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-7">
            {rich && product.descriptionHtml ? (
              <div
                className="product-description-html prose prose-neutral max-w-none text-base leading-8 text-muted-foreground prose-headings:font-medium prose-headings:text-foreground prose-p:mb-5 prose-strong:text-foreground"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            ) : (
              <div className="space-y-5 text-base leading-8 text-muted-foreground">
                {(product.description
                  ? [product.description, ...fallbackParagraphs.slice(1)]
                  : fallbackParagraphs
                ).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-14">
          <Accordion type="single" collapsible className="rounded-2xl border border-border bg-background px-2 md:px-4">
            <AccordionItem value="details">
              <AccordionTrigger className="px-3 text-sm font-semibold uppercase tracking-[0.14em]">
                Detalhes do produto
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-4 text-sm leading-7 text-muted-foreground">
                <ul className="space-y-2">
                  <li>Categoria: {product.category}</li>
                  {product.productType && <li>Tipo: {product.productType}</li>}
                  {product.vendor && <li>Marca: {product.vendor}</li>}
                  {product.tags && product.tags.length > 0 && (
                    <li>Tags: {product.tags.join(", ")}</li>
                  )}
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="materials">
              <AccordionTrigger className="px-3 text-sm font-semibold uppercase tracking-[0.14em]">
                Materiais e cuidados
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-4 text-sm leading-7 text-muted-foreground">
                <p className="mb-3">{material}</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Lavar à mão ou ciclo delicado</li>
                  <li>Não usar alvejante</li>
                  <li>Secar à sombra para preservar cor e bordado</li>
                  <li>Passar do avesso em temperatura baixa</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="shipping">
              <AccordionTrigger className="px-3 text-sm font-semibold uppercase tracking-[0.14em]">
                Envio e devoluções
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-4 text-sm leading-7 text-muted-foreground">
                <p>
                  Pedidos são processados em até 2 dias úteis. O prazo de entrega
                  varia conforme sua região e é calculado no checkout oficial da
                  Shopify. Você tem 30 dias para solicitar troca da primeira compra,
                  conforme política da loja.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  );
}