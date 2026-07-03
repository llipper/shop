export function ReturnsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-medium text-foreground mb-2">Trocas e Devoluções</h1>
        <p className="text-muted-foreground">Entenda as regras e os prazos para trocar ou devolver suas peças.</p>
      </div>

      <div className="space-y-6 text-muted-foreground leading-relaxed text-sm">
        <section className="space-y-3">
          <h2 className="text-lg font-medium text-foreground">Como Funciona a Devolução?</h2>
          <p>
            Você pode devolver ou trocar seus produtos em até <strong>7 dias corridos</strong> a partir da data de entrega.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-foreground">Condições Necessárias</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Produto sem sinais de uso ou lavagem.</li>
            <li>Etiqueta original intacta.</li>
            <li>Embalagem original de envio.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-foreground">Como Iniciar?</h2>
          <p>
            Entre em contato pela página <strong>Fale Conosco</strong> ou envie e-mail para{" "}
            <strong className="text-foreground">suporte@papirar.com.br</strong> com o número do pedido.
          </p>
        </section>
      </div>
    </div>
  );
}