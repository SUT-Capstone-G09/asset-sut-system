"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { logoutApi } from "@/lib/services/auth.service";

export interface AuthUser {
  id: number;
  email: string;
  role: string; // "admin" | "staff" | "requester"
  first_name: string;
  last_name: string;
  requester_type_id?: number; // 1 = ภายใน, 2 = ภายนอก
}

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

function getAuthKey(): string {
  if (typeof window === "undefined") return "auth";
  return window.location.port === "3001" ? "auth_admin" : "auth";
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<{ token: string | null; user: AuthUser | null }>(() => {
    if (typeof window === "undefined") return { token: null, user: null };
    const stored = localStorage.getItem(getAuthKey());
    return stored ? JSON.parse(stored) : { token: null, user: null };
  });

  const login = useCallback((token: string, user: AuthUser) => {
    const state = { token, user };
    setAuthState(state);
    localStorage.setItem(getAuthKey(), JSON.stringify(state));
  }, []);

  const logout = useCallback(() => {
    logoutApi();
    setAuthState({ token: null, user: null });
    localStorage.removeItem(getAuthKey());
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, isAuthenticated: !!authState.token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext must be used within AuthProvider");
  return context;
}
