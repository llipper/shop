"use client";

import type { CustomerAddress, CustomerOrder } from "@/types/customer";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface StoreUser {
  name: string;
  email: string;
  phone?: string;
  memberSince?: string;
}

type AuthSession = {
  accessToken: string;
  expiresAt: string;
  user: StoreUser;
  orders: CustomerOrder[];
  addresses: CustomerAddress[];
};

type AuthActionResponse = {
  ok: boolean;
  message?: string;
  accessToken?: string;
  expiresAt?: string;
  user?: StoreUser;
  orders?: CustomerOrder[];
  addresses?: CustomerAddress[];
};

interface AuthContextType {
  user: StoreUser | null;
  orders: CustomerOrder[];
  addresses: CustomerAddress[];
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithPassword: (email: string, password: string) => Promise<AuthActionResponse>;
  registerAccount: (input: {
    name: string;
    email: string;
    password: string;
  }) => Promise<AuthActionResponse>;
  updateProfile: (input: { name: string; phone?: string }) => Promise<AuthActionResponse>;
  recoverPassword: (email: string) => Promise<AuthActionResponse>;
  refreshSession: () => Promise<void>;
  logout: () => void;
}

const STORAGE_KEY = "roccius-session";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    if (parsed?.accessToken && parsed?.user?.email) return parsed;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return null;
}

function persistSession(session: AuthSession | null) {
  if (!session) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

async function postAuthAction(
  action: string,
  payload: Record<string, string>,
): Promise<AuthActionResponse> {
  const body = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    body.set(key, value);
  }

  const response = await fetch(action, { method: "POST", body });
  return (await response.json()) as AuthActionResponse;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applySession = useCallback((next: AuthSession | null) => {
    setSession(next);
    persistSession(next);
  }, []);

  const hydrateFromResponse = useCallback(
    (result: AuthActionResponse) => {
      if (
        !result.ok ||
        !result.accessToken ||
        !result.expiresAt ||
        !result.user
      ) {
        return result;
      }

      const nextSession: AuthSession = {
        accessToken: result.accessToken,
        expiresAt: result.expiresAt,
        user: result.user,
        orders: result.orders ?? [],
        addresses: result.addresses ?? [],
      };
      applySession(nextSession);
      return result;
    },
    [applySession],
  );

  const refreshSession = useCallback(async () => {
    const stored = readStoredSession();
    if (!stored?.accessToken) {
      applySession(null);
      return;
    }

    const result = await postAuthAction("/api/auth/session", {
      accessToken: stored.accessToken,
    });

    if (!result.ok || !result.user) {
      applySession(null);
      return;
    }

    applySession({
      accessToken: stored.accessToken,
      expiresAt: stored.expiresAt,
      user: result.user,
      orders: result.orders ?? [],
      addresses: result.addresses ?? [],
    });
  }, [applySession]);

  useEffect(() => {
    const stored = readStoredSession();
    if (!stored) {
      setIsLoading(false);
      return;
    }

    setSession(stored);
    void refreshSession().finally(() => setIsLoading(false));
  }, [refreshSession]);

  const loginWithPassword = useCallback(
    async (email: string, password: string) => {
      const result = await postAuthAction("/api/auth/login", { email, password });
      return hydrateFromResponse(result);
    },
    [hydrateFromResponse],
  );

  const registerAccount = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      const result = await postAuthAction("/api/auth/register", input);
      return hydrateFromResponse(result);
    },
    [hydrateFromResponse],
  );

  const updateProfile = useCallback(
    async (input: { name: string; phone?: string }) => {
      if (!session?.accessToken) {
        return { ok: false, message: "Sessão inválida." };
      }

      const result = await postAuthAction("/api/auth/profile", {
        accessToken: session.accessToken,
        name: input.name,
        phone: input.phone ?? "",
      });

      if (result.ok && result.user) {
        applySession({
          accessToken: session.accessToken,
          expiresAt: session.expiresAt,
          user: result.user,
          orders: result.orders ?? session.orders,
          addresses: result.addresses ?? session.addresses,
        });
      }

      return result;
    },
    [applySession, session],
  );

  const recoverPassword = useCallback(async (email: string) => {
    return postAuthAction("/api/auth/recover", { email });
  }, []);

  const logout = useCallback(() => {
    applySession(null);
  }, [applySession]);

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        orders: session?.orders ?? [],
        addresses: session?.addresses ?? [],
        accessToken: session?.accessToken ?? null,
        isAuthenticated: Boolean(session?.accessToken && session?.user),
        isLoading,
        loginWithPassword,
        registerAccount,
        updateProfile,
        recoverPassword,
        refreshSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}