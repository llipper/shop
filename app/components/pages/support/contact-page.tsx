"use client";

import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { Mail, Send, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

type ContactActionData = {
  ok: boolean;
  message: string;
};

export function ContactPage() {
  const fetcher = useFetcher<ContactActionData>();
  const lastHandled = useRef<ContactActionData | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const isSubmitting = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) return;
    if (lastHandled.current === fetcher.data) return;
    lastHandled.current = fetcher.data;

    if (fetcher.data.ok) {
      toast.success(fetcher.data.message);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } else {
      toast.error(fetcher.data.message);
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-medium text-foreground mb-2">Fale Conosco</h1>
        <p className="text-muted-foreground">Estamos aqui para responder suas dúvidas ou ouvir seu feedback.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-10">
        <fetcher.Form method="post" action="/api/contact" className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Nome</label>
              <input
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-border rounded-md px-4 py-3 bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                placeholder="Ex: Ana Maria"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">E-mail</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-border rounded-md px-4 py-3 bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Assunto</label>
            <input
              type="text"
              name="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-border rounded-md px-4 py-3 bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              placeholder="Ex: Dúvida sobre troca ou tamanho"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Mensagem</label>
            <textarea
              name="message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-border rounded-md px-4 py-3 bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
              placeholder="Escreva sua mensagem aqui..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-md font-medium hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-75 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" /> {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
          </button>
        </fetcher.Form>

        <div className="space-y-6 text-sm text-muted-foreground">
          <div>
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4" /> Telefones
            </h4>
            <p>0800 123 4567</p>
            <p className="text-xs mt-1">Segunda a Sexta, das 9h às 18h</p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Mail className="w-4 h-4" /> E-mail
            </h4>
            <p className="break-all">suporte@roccius.com.br</p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Endereço
            </h4>
            <p>Av. Paulista, 1000 — Bela Vista</p>
            <p>São Paulo - SP</p>
          </div>
        </div>
      </div>
    </div>
  );
}