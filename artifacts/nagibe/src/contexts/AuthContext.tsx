import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi, type AuthUser } from "@/lib/auth-api";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (login: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isOperator: boolean;
  isRevisor: boolean;
  isProducer: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (loginVal: string, password: string) => {
    const u = await authApi.login(loginVal, password);
    setUser(u);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const profile = user?.profile ?? "";
  const isAdmin = profile === "administrador";
  const isOperator = isAdmin || profile === "operador";
  const isRevisor = isOperator || profile === "revisor";
  const isProducer = isAdmin || (user?.isProducer ?? false);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isOperator, isRevisor, isProducer }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
