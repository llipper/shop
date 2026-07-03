"use client";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  User,
  Heart,
  MapPin,
  Package,
  LogOut,
  LayoutDashboard,
  ShoppingBag,
  Settings,
  Shield,
  ChevronRight,
  Calendar,
  Mail,
  Phone,
  ExternalLink,
} from "lucide-react";

type AccountSection = "overview" | "orders" | "profile" | "addresses";

const navItems: Array<{
  id: AccountSection;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: "overview", label: "Visão geral", icon: LayoutDashboard },
  { id: "orders", label: "Meus pedidos", icon: ShoppingBag },
  { id: "profile", label: "Dados pessoais", icon: User },
  { id: "addresses", label: "Endereços", icon: MapPin },
];

function formatMemberSince(iso?: string) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function AccountPage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState<AccountSection>("overview");
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone ?? "");
  }, [user]);

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function handleLogout() {
    logout();
    navigate("/store");
  }

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      updateUser({ name, email, phone });
      setSaving(false);
      toast.success("Dados atualizados com sucesso.");
    }, 600);
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-24">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
            Área do cliente
          </p>
          <h1 className="text-3xl md:text-4xl font-medium text-foreground tracking-tight">
            Minha conta
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-8 lg:gap-12">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-28 h-fit space-y-6">
            <div className="border border-border rounded-2xl p-5 bg-secondary/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-semibold">
                  {initials || <User className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                <span className="px-2 py-1 rounded-full bg-background border border-border">
                  Cliente Papirar
                </span>
              </div>
            </div>

            <nav className="border border-border rounded-2xl p-2 bg-background">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = section === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSection(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                      active
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="border border-border rounded-2xl p-2 space-y-1">
              <Link
                to="/favoritos"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              >
                <Heart className="w-4 h-4" />
                Favoritos
              </Link>
              <Link
                to="/suporte"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Suporte
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair da conta
              </button>
            </div>
          </aside>

          {/* Main */}
          <div className="min-w-0">
            {section === "overview" && (
              <div className="space-y-6">
                <div className="border border-border rounded-2xl p-6 md:p-8 bg-gradient-to-br from-secondary/30 to-background">
                  <h2 className="text-xl font-medium mb-2">
                    Olá, {user.name.split(" ")[0]}.
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
                    Bem-vindo à sua área exclusiva Papirar. Acompanhe pedidos, atualize seus dados
                    e acesse atalhos da sua conta.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Pedidos", value: "0", sub: "Nenhum pedido ainda" },
                    { label: "Favoritos", value: "—", sub: "Ver lista salva", href: "/favoritos" },
                    {
                      label: "Membro desde",
                      value: user.memberSince
                        ? String(new Date(user.memberSince).getFullYear())
                        : "—",
                      sub: formatMemberSince(user.memberSince),
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="border border-border rounded-2xl p-5 bg-background"
                    >
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-medium text-foreground capitalize">
                        {stat.value}
                      </p>
                      {"href" in stat && stat.href ? (
                        <Link
                          to={stat.href}
                          className="text-xs text-primary mt-2 inline-flex items-center gap-1 hover:underline"
                        >
                          {stat.sub} <ChevronRight className="w-3 h-3" />
                        </Link>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-2 capitalize">{stat.sub}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    to="/store"
                    className="group border border-border rounded-2xl p-6 hover:border-foreground/30 transition-colors"
                  >
                    <ShoppingBag className="w-5 h-5 mb-4 text-foreground" />
                    <p className="font-medium mb-1">Continuar comprando</p>
                    <p className="text-sm text-muted-foreground">
                      Explore novidades e coleções da loja.
                    </p>
                  </Link>
                  <Link
                    to="/suporte/rastreio"
                    className="group border border-border rounded-2xl p-6 hover:border-foreground/30 transition-colors"
                  >
                    <Package className="w-5 h-5 mb-4 text-foreground" />
                    <p className="font-medium mb-1">Rastrear entrega</p>
                    <p className="text-sm text-muted-foreground">
                      Acompanhe seu pedido com o código de rastreio.
                    </p>
                  </Link>
                </div>
              </div>
            )}

            {section === "orders" && (
              <div className="border border-border rounded-2xl p-6 md:p-10 bg-background">
                <div className="flex items-start justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-xl font-medium mb-1">Histórico de pedidos</h2>
                    <p className="text-sm text-muted-foreground">
                      Compras finalizadas no checkout Shopify.
                    </p>
                  </div>
                  <Link
                    to="/suporte/rastreio"
                    className="text-sm text-primary hover:underline whitespace-nowrap"
                  >
                    Rastrear pedido
                  </Link>
                </div>

                <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-xl bg-secondary/10">
                  <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-5">
                    <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-foreground mb-2">Nenhum pedido registrado</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
                    Após finalizar uma compra na Shopify, você receberá a confirmação por e-mail.
                    O histórico completo estará disponível quando a conta for integrada à Shopify.
                  </p>
                  <Button asChild>
                    <Link to="/store">Ir para a loja</Link>
                  </Button>
                </div>
              </div>
            )}

            {section === "profile" && (
              <div className="border border-border rounded-2xl p-6 md:p-8 bg-background">
                <h2 className="text-xl font-medium mb-1">Dados pessoais</h2>
                <p className="text-sm text-muted-foreground mb-8">
                  Mantenha suas informações atualizadas para uma experiência personalizada.
                </p>

                <form onSubmit={handleSaveProfile} className="space-y-6 max-w-lg">
                  <div className="space-y-2">
                    <Label htmlFor="account-name">Nome completo</Label>
                    <Input
                      id="account-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account-email">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="account-email"
                        type="email"
                        className="pl-9"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account-phone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="account-phone"
                        type="tel"
                        className="pl-9"
                        placeholder="(11) 99999-9999"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                    <Calendar className="w-3.5 h-3.5" />
                    Cliente desde {formatMemberSince(user.memberSince)}
                  </div>

                  <Button type="submit" disabled={saving} className="min-w-36">
                    {saving ? "Salvando..." : "Salvar alterações"}
                  </Button>
                </form>

                <div className="mt-10 pt-8 border-t border-border">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Segurança da conta</p>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        Para alterar senha ou recuperar acesso, entre em contato com nosso suporte.
                      </p>
                      <Link
                        to="/suporte/contato"
                        className="text-sm text-primary inline-flex items-center gap-1 mt-2 hover:underline"
                      >
                        Falar com suporte <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {section === "addresses" && (
              <div className="border border-border rounded-2xl p-6 md:p-8 bg-background">
                <h2 className="text-xl font-medium mb-1">Endereços de entrega</h2>
                <p className="text-sm text-muted-foreground mb-8">
                  Endereços informados no checkout Shopify são usados na entrega dos pedidos.
                </p>

                <div className="flex flex-col items-center justify-center py-14 text-center border border-dashed border-border rounded-xl bg-secondary/10">
                  <MapPin className="w-8 h-8 text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">Nenhum endereço salvo</h3>
                  <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
                    No checkout da Shopify você informa o endereço de entrega. Em breve, endereços
                    poderão ser salvos aqui na sua conta Papirar.
                  </p>
                  <Button variant="outline" asChild>
                    <Link to="/store/checkout">Ir para checkout</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}