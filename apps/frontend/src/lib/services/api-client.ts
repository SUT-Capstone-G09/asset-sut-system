const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

function isAdminApp(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.port === "3001";
}

const AUTH_KEY = () => (isAdminApp() ? "auth_admin" : "auth");
const AUTH_SUFFIX = () => (isAdminApp() ? "?app=admin" : "");

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const auth = localStorage.getItem(AUTH_KEY());
  if (!auth) return null;
  try {
    return JSON.parse(auth).token ?? null;
  } catch {
    return null;
  }
}

function persistRefreshedAuth(accessToken: string, user: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_KEY(), JSON.stringify({ token: accessToken, user }));
}

function clearAuthAndRedirect() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_KEY());
  window.location.href = "/login";
}

let refreshPromise: Promise<string> | null = null;

function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE_URL}/auth/refresh${AUTH_SUFFIX()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body?.error ?? "refresh failed");
        const data = body.data as { access_token: string; user: unknown };
        persistRefreshedAuth(data.access_token, data.user);
        return data.access_token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 401 && retry && token && path !== "/auth/refresh") {
    try {
      await refreshAccessToken();
    } catch {
      clearAuthAndRedirect();
      throw new Error("session expired");
    }
    return request<T>(path, options, false);
  }

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(body?.error ?? `Request failed: ${res.status}`);
  }

  return body.data as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(data) }),
  put: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(data) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export { AUTH_SUFFIX };
