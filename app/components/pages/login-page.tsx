"use client";

import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";

export function LoginPage() {
  const navigate = useNavigate();
  const { loginWithPassword, recoverPassword, isAuthenticated, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/conta", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const result = await loginWithPassword(email, password);
    setLoading(false);

    if (!result.ok) {
      toast.error(result.message ?? "Não foi possível entrar.");
      return;
    }

    toast.success("Bem-vindo de volta!");
    navigate("/conta");
  }

  async function handleRecoverPassword() {
    if (!email.trim()) {
      toast.error("Informe seu e-mail para recuperar a senha.");
      return;
    }

    setRecovering(true);
    const result = await recoverPassword(email);
    setRecovering(false);

    if (result.ok) {
      toast.success(result.message);
    } else {
      toast.error(result.message ?? "Não foi possível enviar o e-mail.");
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12">
        <div className="max-w-md w-full mx-auto">
          <Link
            to="/store"
            className="text-2xl font-semibold tracking-widest uppercase text-foreground mb-12 block"
          >
            ROUHI
          </Link>

          <h1 className="text-3xl font-medium text-foreground mb-2">Bem-vindo de volta</h1>
          <p className="text-muted-foreground mb-10">
            Entre com sua conta Shopify da ROUHI para acompanhar pedidos, favoritos e checkout
            mais rápido.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-border rounded-md pl-10 pr-4 py-3 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-foreground">Senha</label>
                <button
                  type="button"
                  onClick={handleRecoverPassword}
                  disabled={recovering}
                  className="text-xs text-primary hover:text-primary/80 transition-colors disabled:opacity-60"
                >
                  {recovering ? "Enviando..." : "Esqueceu a senha?"}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-border rounded-md pl-10 pr-12 py-3 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-md font-medium hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? "Entrando..." : <>Entrar <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-10">
            Não tem uma conta?{" "}
            <Link to="/cadastro" className="text-primary font-medium hover:text-primary/80 transition-colors">
              Criar conta
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-secondary relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5" />
        <div className="relative z-10 text-center px-12 max-w-lg">
          <div className="text-6xl mb-6">👋</div>
          <h2 className="text-2xl font-medium text-foreground mb-3">Boas compras começam aqui</h2>
          <p className="text-muted-foreground leading-relaxed">
            Acesse sua conta para acompanhar pedidos, salvar seus favoritos e ter uma experiência personalizada.
          </p>
        </div>
      </div>
    </div>
  );
}