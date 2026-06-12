export interface CurrentUser {
  id: number;
  role: string;
  email: string;
}

export function getCurrentUser(): CurrentUser | null {
  if (typeof window === "undefined") return null;
  const isAdmin = window.location.port === "3001";
  const key = isAdmin ? "auth_admin" : "auth";
  const auth = localStorage.getItem(key);
  if (!auth) return null;
  try {
    const { token } = JSON.parse(auth);
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      id: payload.user_id,
      role: payload.role,
      email: payload.email,
    };
  } catch {
    return null;
  }
}
