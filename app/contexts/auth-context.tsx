"use client";

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

interface AuthContextType {
  user: StoreUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: StoreUser) => void;
  updateUser: (data: Partial<StoreUser>) => void;
  logout: () => void;
}

const STORAGE_KEY = "papirar-user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readStoredUser(): StoreUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoreUser;
    if (parsed?.email) return parsed;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoreUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(readStoredUser());
    setIsLoading(false);
  }, []);

  const persistUser = useCallback((nextUser: StoreUser) => {
    setUser(nextUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
  }, []);

  const login = useCallback(
    (nextUser: StoreUser) => {
      const existing = readStoredUser();
      persistUser({
        ...nextUser,
        phone: nextUser.phone ?? existing?.phone,
        memberSince:
          existing?.memberSince ??
          nextUser.memberSince ??
          new Date().toISOString(),
      });
    },
    [persistUser],
  );

  const updateUser = useCallback(
    (data: Partial<StoreUser>) => {
      setUser((current) => {
        if (!current) return current;
        const updated = { ...current, ...data };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    [],
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        updateUser,
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