"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { logoutApi } from "@/lib/services/auth.service";

export interface AuthUser {
  id: number;
  email: string;
  role: string; // "admin" | "staff" | "requester"
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<{ token: string | null; user: AuthUser | null }>(() => {
    if (typeof window === "undefined") return { token: null, user: null };
    const stored = localStorage.getItem("auth");
    return stored ? JSON.parse(stored) : { token: null, user: null };
  });

  const login = useCallback((token: string, user: AuthUser) => {
    const state = { token, user };
    setAuthState(state);
    localStorage.setItem("auth", JSON.stringify(state));
  }, []);

  const logout = useCallback(() => {
    logoutApi();
    setAuthState({ token: null, user: null });
    localStorage.removeItem("auth");
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
