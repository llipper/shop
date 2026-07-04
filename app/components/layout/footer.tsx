import { Link } from "react-router";
import { footerStoreLinks } from "@/lib/menu-data";
import { NewsletterForm } from "@/components/layout/newsletter-form";

function IconInstagram() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}
function IconTwitter() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}
function IconFacebook() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
function IconYoutube() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-background border-t border-border pt-16 pb-8">
      <div className="max-w-[1440px] mx-auto px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <div className="flex flex-col">
          <Link to="/store" className="text-2xl font-semibold tracking-widest uppercase mb-6 text-foreground">
            ROUHI
          </Link>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            Roupas minimalistas, essenciais e projetadas para durar. Feito com cuidado para o seu dia a dia.
          </p>
          <div className="flex gap-4 text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors"><IconInstagram /></a>
            <a href="#" className="hover:text-foreground transition-colors"><IconTwitter /></a>
            <a href="#" className="hover:text-foreground transition-colors"><IconFacebook /></a>
            <a href="#" className="hover:text-foreground transition-colors"><IconYoutube /></a>
          </div>
        </div>

        <div className="flex flex-col">
          <h4 className="font-medium text-foreground mb-6 uppercase tracking-wider text-sm">Loja</h4>
          <ul className="flex flex-col gap-4 text-sm text-muted-foreground">
            {footerStoreLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.href} className="hover:text-foreground transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col">
          <h4 className="font-medium text-foreground mb-6 uppercase tracking-wider text-sm">Suporte</h4>
          <ul className="flex flex-col gap-4 text-sm text-muted-foreground">
            <li><Link to="/suporte/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
            <li><Link to="/suporte/envio-e-prazos" className="hover:text-foreground transition-colors">Envio e Prazos</Link></li>
            <li><Link to="/suporte/trocas-e-devolucoes" className="hover:text-foreground transition-colors">Trocas e Devoluções</Link></li>
            <li><Link to="/suporte/rastreio" className="hover:text-foreground transition-colors">Rastreie seu pedido</Link></li>
            <li><Link to="/suporte/contato" className="hover:text-foreground transition-colors">Contato</Link></li>
          </ul>
        </div>

        <div className="flex flex-col">
          <h4 className="font-medium text-foreground mb-6 uppercase tracking-wider text-sm">Newsletter</h4>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            Assine para receber novidades, lançamentos antecipados e ofertas exclusivas.
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} ROUHI. Todos os direitos reservados.</p>
        <div className="flex gap-6">
          <Link to="/termos" className="hover:text-foreground transition-colors">Termos de Serviço</Link>
          <Link to="/privacidade" className="hover:text-foreground transition-colors">Política de Privacidade</Link>
        </div>
      </div>
    </footer>
  );
}