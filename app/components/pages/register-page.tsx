"use client";

import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const passwordRules = [
  { id: "length", label: "Mínimo de 8 caracteres", test: (p: string) => p.length >= 8 },
  { id: "upper", label: "Uma letra maiúscula", test: (p: string) => /[A-Z]/.test(p) },
  { id: "number", label: "Um número", test: (p: string) => /\d/.test(p) },
];

export function RegisterPage() {
  const navigate = useNavigate();
  const { registerAccount, isAuthenticated, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/conta", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (passwordStrength < 3) return;

    setLoading(true);
    const result = await registerAccount({ name, email, password });
    setLoading(false);

    if (!result.ok) {
      toast.error(result.message ?? "Não foi possível criar a conta.");
      return;
    }

    toast.success("Conta criada com sucesso!");
    navigate("/conta");
  }

  const passwordStrength = passwordRules.filter((r) => r.test(password)).length;

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex flex-1 bg-secondary relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5" />
        <div className="relative z-10 text-center px-12 max-w-lg">
          <div className="text-6xl mb-6">🛍️</div>
          <h2 className="text-2xl font-medium text-foreground mb-3">Junte-se à comunidade</h2>
          <p className="text-muted-foreground leading-relaxed">
            Crie sua conta e tenha acesso a ofertas exclusivas, lançamentos antecipados e acompanhe seus pedidos em tempo real.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12">
        <div className="max-w-md w-full mx-auto">
          <Link
            to="/store"
            className="text-2xl font-semibold tracking-widest uppercase text-foreground mb-12 block"
          >
            ROCCIUS
          </Link>

          <h1 className="text-3xl font-medium text-foreground mb-2">Criar sua conta</h1>
          <p className="text-muted-foreground mb-10">Preencha os dados abaixo para começar.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Nome completo</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-border rounded-md pl-10 pr-4 py-3 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="João da Silva"
                  required
                />
              </div>
            </div>

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
              <label className="block text-sm font-medium text-foreground mb-1.5">Senha</label>
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

              {password.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-colors",
                          passwordStrength >= level
                            ? passwordStrength === 3
                              ? "bg-green-500"
                              : passwordStrength === 2
                                ? "bg-amber-500"
                                : "bg-red-500"
                            : "bg-border",
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || passwordStrength < 3}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-md font-medium hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? "Criando..." : <>Criar conta <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-10">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-primary font-medium hover:text-primary/80 transition-colors">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}