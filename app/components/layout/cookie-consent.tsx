"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  getCookieConsent,
  hasCookieConsentChoice,
  setCookieConsent,
} from "@/lib/cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!hasCookieConsentChoice());
  }, []);

  if (!visible) return null;

  function handleChoice(value: "accepted" | "rejected" | "essential") {
    setCookieConsent(value);
    setVisible(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-4 md:p-6">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 rounded-xl border border-border bg-background/95 p-5 shadow-lg backdrop-blur-md md:flex-row md:items-center md:justify-between md:gap-8 md:p-6">
        <div className="max-w-3xl space-y-2">
          <p className="text-sm font-medium text-foreground">Cookies e privacidade</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Utilizamos cookies essenciais para o funcionamento do site e, com seu
            consentimento, cookies para melhorar sua experiência. Saiba mais na{" "}
            <Link to="/privacidade" className="underline underline-offset-4 hover:text-foreground">
              Política de Privacidade
            </Link>
            .
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleChoice("essential")}
          >
            Apenas essenciais
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleChoice("rejected")}
          >
            Recusar
          </Button>
          <Button type="button" size="sm" onClick={() => handleChoice("accepted")}>
            Aceitar todos
          </Button>
        </div>
      </div>
    </div>
  );
}

export function useAnalyticsAllowed() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setAllowed(getCookieConsent() === "accepted");
  }, []);

  return allowed;
}