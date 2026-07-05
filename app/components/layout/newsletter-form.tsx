"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useFetcher } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

type NewsletterActionData = {
  ok: boolean;
  message: string;
};

export function NewsletterForm() {
  const fetcher = useFetcher<NewsletterActionData>();
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const lastHandledData = useRef<NewsletterActionData | null>(null);
  const isSubmitting = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) return;
    if (lastHandledData.current === fetcher.data) return;

    lastHandledData.current = fetcher.data;

    if (fetcher.data.ok) {
      toast.success(fetcher.data.message);
      setEmail("");
      setConsent(false);
    } else {
      toast.error(fetcher.data.message);
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <fetcher.Form method="post" action="/api/newsletter" className="flex flex-col gap-3">
      <input
        type="email"
        name="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Seu melhor e-mail"
        required
        className="rounded-md border border-border bg-secondary px-4 py-3 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-foreground"
      />

      <label className="flex items-start gap-3 text-left text-xs leading-relaxed text-muted-foreground">
        <Checkbox
          checked={consent}
          onCheckedChange={(checked) => setConsent(checked === true)}
          className="mt-0.5"
        />
        <span>
          Concordo em receber comunicações da ROCCIUS e aceito a{" "}
          <Link to="/privacidade" className="underline underline-offset-4 hover:text-foreground">
            Política de Privacidade
          </Link>{" "}
          (LGPD).
        </span>
      </label>

      <input type="hidden" name="consent" value={consent ? "true" : "false"} />

      <Button
        type="submit"
        disabled={!consent || !email.trim() || isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Inscrevendo..." : "Assinar"}
      </Button>
    </fetcher.Form>
  );
}