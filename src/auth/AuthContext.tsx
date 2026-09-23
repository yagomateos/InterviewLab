import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { api, getToken, setToken, onUnauthorized } from "@/services/api";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  // True only while the initial "am I already logged in" check is running,
  // so pages can avoid a flash of the logged-out state on first load.
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  // Any 401 from the API (expired/invalid token) drops the session the
  // same way an explicit logout does — see api.ts's onUnauthorized.
  useEffect(() => {
    onUnauthorized(logout);
    return () => onUnauthorized(null);
  }, [logout]);

  // On mount, if a token is already stored, verify it's still valid by
  // fetching the current user instead of trusting it blindly.
  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    api.auth
      .me()
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user, token } = await api.auth.login({ email, password });
    setToken(token);
    setUser(user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { user, token } = await api.auth.register({ name, email, password });
    setToken(token);
    setUser(user);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
