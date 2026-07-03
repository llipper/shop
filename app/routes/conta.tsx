"use client";

import { useEffect } from "react";
import { useNavigate } from "react-router";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { AccountPage } from "@/components/pages/account-page";
import { useAuth } from "@/contexts/auth-context";

function ContaRouteContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground text-sm">
        Carregando...
      </div>
    );
  }

  return <AccountPage />;
}

export default function ContaRoute() {
  return (
    <StorefrontShell>
      <ContaRouteContent />
    </StorefrontShell>
  );
}