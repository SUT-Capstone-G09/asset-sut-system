import { useState, useCallback } from "react";

interface AuthUser {
  id: string;
  name: string;
  role: string;
  shop_name?: string;
  shopId?: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => {
    if (typeof window === "undefined") {
      return { token: null, user: null };
    }
    
    const stored = localStorage.getItem("auth");
    return stored ? JSON.parse(stored) : { token: null, user: null };
  });

  const login = useCallback((token: string, user: AuthUser) => {
    const state = { token, user };
    setAuthState(state);
    localStorage.setItem("auth", JSON.stringify(state));
  }, []);

  const logout = useCallback(() => {
    setAuthState({ token: null, user: null });
    localStorage.removeItem("auth");
  }, []);

  const isAuthenticated = !!authState.token;

  return { ...authState, login, logout, isAuthenticated };
}