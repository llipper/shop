export function ShippingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-medium text-foreground mb-2">Envio e Prazos</h1>
        <p className="text-muted-foreground">Saiba tudo sobre a entrega das suas compras.</p>
      </div>

      <div className="space-y-6 text-muted-foreground leading-relaxed text-sm">
        <section className="space-y-3">
          <h2 className="text-lg font-medium text-foreground">1. Prazos de Processamento</h2>
          <p>
            Todos os pedidos aprovados são processados em até <strong>2 dias úteis</strong>.
            Você receberá um e-mail com o código de rastreio assim que a encomenda for coletada.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-foreground">2. Modalidades de Entrega</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-foreground">PAC:</strong> 7 a 12 dias úteis após a postagem.</li>
            <li><strong className="text-foreground">SEDEX:</strong> 1 a 3 dias úteis para capitais e regiões metropolitanas.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-foreground">3. Frete Grátis</h2>
          <p>
            Frete grátis na modalidade <strong>PAC</strong> para compras acima de <strong>R$ 299,00</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}