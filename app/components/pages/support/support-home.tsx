import { Link } from "react-router";
import { HelpCircle, Truck, RefreshCw, MapPin, Mail, Search } from "lucide-react";

export function SupportHome() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-medium text-foreground mb-2">Central de Ajuda</h1>
        <p className="text-muted-foreground">Como podemos ajudar você hoje?</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Busque por dúvidas, prazos, trocas..."
          className="w-full bg-secondary border border-border rounded-lg pl-12 pr-4 py-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { href: "/suporte/faq", icon: HelpCircle, title: "Perguntas Frequentes", desc: "Respostas sobre pedidos, pagamento e tamanhos." },
          { href: "/suporte/envio-e-prazos", icon: Truck, title: "Envios e Prazos", desc: "Modalidades de frete, prazos e taxas." },
          { href: "/suporte/trocas-e-devolucoes", icon: RefreshCw, title: "Trocas e Devoluções", desc: "Como solicitar troca ou devolução em até 7 dias." },
          { href: "/suporte/rastreio", icon: MapPin, title: "Rastreamento", desc: "Acompanhe seu pacote pelo código de rastreio." },
        ].map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className="group p-6 border border-border hover:border-foreground rounded-lg transition-all flex items-start gap-4"
          >
            <div className="p-3 bg-secondary rounded-lg text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              <item.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-medium text-foreground mb-1">Não encontrou o que precisava?</h4>
          <p className="text-sm text-muted-foreground">Nosso time de atendimento está à disposição.</p>
        </div>
        <Link
          to="/suporte/contato"
          className="bg-primary text-primary-foreground px-6 py-3 rounded-md text-sm font-medium hover:bg-primary/90 transition-all flex items-center gap-2"
        >
          <Mail className="w-4 h-4" /> Entrar em Contato
        </Link>
      </div>
    </div>
  );
}